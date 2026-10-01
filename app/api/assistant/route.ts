import { after } from "next/server";
import { z } from "zod";
import { runAgent, type AgentEvent, type AgentTrace } from "@/ai/assistant/agent";
import { suggestFollowUps } from "@/ai/assistant/suggestions";
import { getAiSettings } from "@/ai/settings";
import { db } from "@/lib/db/client";
import { assistantTurns } from "@/lib/db/schema";
import { rateLimit, visitorId } from "@/server/security/rate-limit";

export const maxDuration = 60;

const bodySchema = z.object({
  message: z.string().trim().min(1).max(4000),
  locale: z.enum(["en", "ar"]).default("en"),
  conversationId: z.string().trim().min(8).max(64).optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .max(24)
    .default([]),
  // The page the visitor is reading, so "this project" can be resolved. Untrusted: only a
  // site path and a short title are accepted, and the prompt treats both as data.
  page: z
    .object({
      path: z
        .string()
        .max(200)
        .regex(/^\/[\w\-/%.]*$/),
      title: z
        .string()
        .max(160)
        .transform((value) => value.replace(/[\s"`]+/g, " ").trim())
        .optional(),
    })
    .optional()
    // A malformed page hint is dropped, never a reason to refuse the question.
    .catch(undefined),
});

const encoder = new TextEncoder();
const sse = (event: string, data: unknown) =>
  encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

export async function POST(request: Request) {
  // JSON only (a cross-site page can't send it without a CORS preflight, which is refused) and
  // never from another site in a browser, so other websites can't spend the model quota.
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "unsupported_media_type" }, { status: 415 });
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const visitor = visitorId(request.headers);
  const limit = await rateLimit(`assistant:${visitor}`, [
    { window: 60, max: 12 },
    { window: 86_400, max: 150 },
  ]);
  if (!limit.ok) {
    return Response.json(
      { error: "rate_limited", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const started = Date.now();
  const conversationId = body.conversationId ?? crypto.randomUUID();
  const trace: AgentTrace = {
    model: null,
    toolCalls: [],
    usage: { input: 0, output: 0 },
    answer: "",
    sources: [],
    error: null,
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(sse(event, data));
        } catch {
          // client went away
        }
      };
      send("meta", { conversationId });
      try {
        for await (const event of runAgent({
          message: body.message,
          history: body.history,
          locale: body.locale,
          ...(body.page ? { page: body.page } : {}),
          signal: request.signal,
          trace,
        }) as AsyncGenerator<AgentEvent>) {
          send(event.type, event);
        }
        if (trace.answer) {
          const suggestions = await suggestFollowUps(body.message, trace.answer, request.signal);
          if (suggestions.length) send("suggestions", { items: suggestions });
        }
      } catch (error) {
        trace.error = error instanceof Error ? error.message : String(error);
        send("error", {
          type: "error",
          code: "failed",
          message:
            body.locale === "ar"
              ? "صار خلل غير متوقع. جرّب مرة ثانية."
              : "Something went wrong. Please try again.",
        });
      } finally {
        send("done", { latencyMs: Date.now() - started });
        controller.close();
      }
    },
  });

  after(async () => {
    try {
      const settings = await getAiSettings();
      if (!settings.logConversations) return;
      await db.insert(assistantTurns).values({
        conversationId,
        visitor,
        locale: body.locale,
        question: body.message.slice(0, 4000),
        answer: trace.answer.slice(0, 20_000),
        toolCalls: trace.toolCalls,
        sources: trace.sources.map((s) => ({ title: s.title, url: s.url })),
        model: trace.model,
        latencyMs: Date.now() - started,
        inputTokens: trace.usage.input,
        outputTokens: trace.usage.output,
        error: trace.error,
      });
    } catch (error) {
      console.error("assistant_log_failed", error instanceof Error ? error.message : error);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
