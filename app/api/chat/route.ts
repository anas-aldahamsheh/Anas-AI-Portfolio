import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatOrchestrator } from "@/ai/orchestration/chat-orchestrator";
import { CONVERSATION_MODES, RESPONSE_LANGUAGES } from "@/ai/contracts";
import { logger } from "@/lib/observability/logger";

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  mode: z.enum(CONVERSATION_MODES).optional().default("general"),
  conversationLocale: z.enum(RESPONSE_LANGUAGES).optional(),
  previousLanguage: z.enum(RESPONSE_LANGUAGES).optional(),
  projectScopeId: z.string().optional(),
  stream: z.boolean().optional().default(false),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { message, mode, conversationLocale, previousLanguage, projectScopeId, stream, history } =
      parsed.data;

    // Execute chat pipeline
    const result = await chatOrchestrator.processChat({
      message,
      conversationMode: mode,
      conversationLocale,
      previousLanguage,
      projectScopeId,
      history,
    });

    // If client requested SSE streaming
    if (stream) {
      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          try {
            // Send metadata event
            controller.enqueue(
              encoder.encode(
                `event: meta\ndata: ${JSON.stringify({
                  language: result.language,
                  direction: result.direction,
                  conversationMode: result.conversationMode,
                  hasInsufficientEvidence: result.hasInsufficientEvidence,
                })}\n\n`,
              ),
            );

            // Stream answer tokens in simulated batches for typewriter cadence
            const words = result.answer.split(" ");
            for (let i = 0; i < words.length; i++) {
              const chunk = (i === 0 ? "" : " ") + words[i];
              controller.enqueue(
                encoder.encode(`event: token\ndata: ${JSON.stringify({ token: chunk })}\n\n`),
              );
            }

            // Send citations event
            controller.enqueue(
              encoder.encode(
                `event: citations\ndata: ${JSON.stringify({
                  citations: result.citations,
                })}\n\n`,
              ),
            );

            // Send completion and telemetry event
            controller.enqueue(
              encoder.encode(
                `event: done\ndata: ${JSON.stringify({
                  answer: result.answer,
                  citations: result.citations,
                  telemetry: result.telemetry,
                })}\n\n`,
              ),
            );
          } catch (err) {
            controller.enqueue(
              encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(err) })}\n\n`),
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(customStream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Default JSON response
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error("Portfolio AI Chat request failed", {
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json(
      {
        error: "Internal chat processing error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
