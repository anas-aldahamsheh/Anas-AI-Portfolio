import {
  GeminiConfigError,
  isSignatureRejection,
  SKIP_SIGNATURE,
  streamContent,
} from "@/ai/gemini/client";
import type { GeminiContent, GeminiFunctionCall, GeminiPart, GeminiUsage } from "@/ai/gemini/types";
import { getAiSettings } from "@/ai/settings";
import type { Locale } from "@/server/content/collections";
import { listPublishedFresh } from "@/server/content/repository";
import { buildSystemPrompt } from "./prompt";
import { fixOwnerName } from "@/lib/owner-name";
import { finalizeCitations, SourceRegistry, type SourceRef } from "./sources";
import { executeTool, toolDeclarations, toolLabel } from "./tools";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AgentEvent =
  | { type: "status"; stage: "thinking" | "tool" | "writing"; label: string; tool?: string }
  | { type: "delta"; text: string }
  | { type: "final"; text: string; sources: SourceRef[] }
  | { type: "error"; code: "unavailable" | "config" | "failed"; message: string };

export interface AgentTrace {
  model: string | null;
  toolCalls: { name: string; args: unknown }[];
  usage: { input: number; output: number };
  answer: string;
  sources: SourceRef[];
  error: string | null;
}

const MAX_HISTORY = 12;

function toContents(history: ChatMessage[], message: string): GeminiContent[] {
  const turns = history.slice(-MAX_HISTORY).map<GeminiContent>((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content.slice(0, 6000) }],
  }));
  // Gemini requires the conversation to start with a user turn.
  while (turns[0]?.role === "model") turns.shift();
  turns.push({ role: "user", parts: [{ text: message }] });
  return turns;
}

/** Streamed chunks repeat cumulative usage, so only the last one of each step is counted. */
function addUsage(total: { input: number; output: number }, usage?: GeminiUsage) {
  if (!usage) return;
  total.input += usage.promptTokenCount ?? 0;
  total.output += (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0);
}

const T = (locale: Locale, en: string, ar: string) => (locale === "ar" ? ar : en);

function neutraliseSignatures(contents: GeminiContent[]) {
  for (const turn of contents) {
    if (turn.role !== "model") continue;
    let first = true;
    for (const part of turn.parts) {
      if (part.functionCall) {
        if (first) part.thoughtSignature = SKIP_SIGNATURE;
        else delete part.thoughtSignature;
        first = false;
      } else if (part.thoughtSignature) {
        delete part.thoughtSignature;
      }
    }
  }
}

/**
 * Tool-using agent loop over Gemini function calling, streamed as events.
 * Each step streams the model's output; function calls are executed in parallel and fed back
 * (with their thought signatures, as Gemini 3 requires) until the model answers or the step
 * budget is spent, at which point it must answer with what it has.
 */
export async function* runAgent(input: {
  message: string;
  history: ChatMessage[];
  locale: Locale;
  page?: { path: string; title?: string | undefined };
  signal?: AbortSignal;
  trace: AgentTrace;
}): AsyncGenerator<AgentEvent> {
  const { locale, trace } = input;
  const settings = await getAiSettings();
  const registry = new SourceRegistry(locale);
  const [profile] = await listPublishedFresh("profile", locale).catch(() => []);

  const system = buildSystemPrompt({
    name: profile?.t.name ?? "",
    headline: profile?.t.headline ?? "",
    email: profile?.data.email ?? "",
    locale,
    today: new Date().toISOString().slice(0, 10),
    ownerInstructions: settings.instructions[locale] || settings.instructions.en || "",
    ...(input.page ? { page: input.page } : {}),
  });

  const contents = toContents(input.history, input.message);
  const tools = [{ functionDeclarations: toolDeclarations() }];
  let answer = "";

  yield { type: "status", stage: "thinking", label: T(locale, "Thinking", "أفكّر") };

  // Stay on the model that answered first: thought signatures are only valid for that model.
  let models = settings.agentModels;

  for (let step = 0; step < settings.maxSteps; step++) {
    const lastStep = step === settings.maxSteps - 1;
    let stream;
    try {
      const open = () =>
        streamContent({
          models,
          thinking: settings.thinking,
          retries: 1,
          ...(input.signal ? { signal: input.signal } : {}),
          request: {
            systemInstruction: { parts: [{ text: system }] },
            contents,
            tools,
            toolConfig: { functionCallingConfig: { mode: lastStep ? "NONE" : "AUTO" } },
            generationConfig: { temperature: settings.temperature, maxOutputTokens: 4096 },
          },
        });
      let result;
      try {
        result = await open();
      } catch (error) {
        if (!isSignatureRejection(error)) throw error;
        // A fallback model received another model's signatures: neutralise them and retry once.
        neutraliseSignatures(contents);
        result = await open();
      }
      stream = result.stream;
      trace.model = result.model;
      models = [result.model, ...settings.agentModels.filter((m) => m !== result.model)];
    } catch (error) {
      trace.error = error instanceof Error ? error.message : String(error);
      yield error instanceof GeminiConfigError
        ? {
            type: "error",
            code: "config",
            message: T(
              locale,
              "The assistant isn't available right now. You can still browse the site or contact Anas directly.",
              "المساعد غير متاح حاليًا. يمكنك تصفح الموقع أو التواصل مع أنس مباشرة.",
            ),
          }
        : {
            type: "error",
            code: "unavailable",
            message: T(
              locale,
              "The AI service is busy right now. Please try again in a moment.",
              "خدمة الذكاء الاصطناعي مشغولة حاليًا. يُرجى المحاولة بعد قليل.",
            ),
          };
      return;
    }

    const modelParts: GeminiPart[] = [];
    const calls: GeminiFunctionCall[] = [];
    let stepText = "";
    let stepUsage: GeminiUsage | undefined;
    try {
      for await (const chunk of stream) {
        if (chunk.usageMetadata) stepUsage = chunk.usageMetadata;
        const parts = chunk.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          modelParts.push(part);
          if (part.functionCall) calls.push(part.functionCall);
          else if (typeof part.text === "string" && !part.thought && part.text) {
            if (!stepText && calls.length === 0 && answer === "") {
              yield { type: "status", stage: "writing", label: T(locale, "Writing", "أكتب") };
            }
            stepText += part.text;
            yield { type: "delta", text: part.text };
          }
        }
      }
    } catch (error) {
      trace.error = error instanceof Error ? error.message : String(error);
      if (!stepText) {
        yield {
          type: "error",
          code: "failed",
          message: T(
            locale,
            "Something interrupted the answer. Please try again.",
            "حدث خلل قطع الإجابة. يُرجى المحاولة مرة أخرى.",
          ),
        };
        return;
      }
    }
    addUsage(trace.usage, stepUsage);
    answer += stepText;

    if (calls.length === 0) break;

    // Replay the model turn verbatim (thought signatures included), then answer every call.
    // Models without signatures (e.g. 2.5) get the documented placeholder so a later 3.x
    // fallback still accepts the history.
    const firstCall = modelParts.find((part) => part.functionCall);
    if (firstCall && !modelParts.some((part) => part.thoughtSignature)) {
      firstCall.thoughtSignature = SKIP_SIGNATURE;
    }
    contents.push({ role: "model", parts: modelParts });
    for (const call of calls) {
      trace.toolCalls.push({ name: call.name, args: call.args ?? {} });
      yield { type: "status", stage: "tool", tool: call.name, label: toolLabel(call.name, locale) };
    }
    const results = await Promise.all(
      calls.map((call) =>
        executeTool(call.name, call.args ?? {}, {
          locale,
          registry,
          rerank: settings.rerank,
          ...(input.signal ? { signal: input.signal } : {}),
        }),
      ),
    );
    results.forEach((result) => registry.collectLinks(result));
    contents.push({
      role: "user",
      parts: calls.map((call, i) => ({
        functionResponse: {
          name: call.name,
          ...(call.id ? { id: call.id } : {}),
          response: results[i] ?? { error: "no result" },
        },
      })),
    });
    if (stepText) answer += "\n\n";
  }

  const final = finalizeCitations(fixOwnerName(answer.trim()), registry);
  trace.answer = final.text;
  trace.sources = final.sources;
  if (!final.text) {
    yield {
      type: "error",
      code: "failed",
      message: T(
        locale,
        "I couldn't put an answer together. Please rephrase and try again.",
        "تعذّر تجهيز إجابة. يُرجى إعادة صياغة سؤالك والمحاولة مرة أخرى.",
      ),
    };
    return;
  }
  yield { type: "final", text: final.text, sources: final.sources };
}
