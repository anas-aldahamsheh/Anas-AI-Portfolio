import {
  CitationReference,
  ConversationMode,
  GenerationInput,
  GenerationOptions,
  GenerationPort,
  GroundedAnswer,
  ResponseLanguage,
} from "@/ai/contracts";
import { citationValidator } from "@/ai/citations";
import {
  createInsufficientEvidenceAnswer,
  isInsufficientEvidenceText,
} from "./grounding-fallbacks";
import { generateHeuristicAnswer } from "./adapters/heuristic-generation-adapter";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { secretsService } from "@/lib/security/secrets-service";
import { promptService } from "@/ai/prompts";
import { logger } from "@/lib/observability/logger";

export interface GroundedGeneratorConfig {
  defaultPromptSlug?: string;
  defaultTimeoutMs?: number;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
}

export class GroundedGenerator implements GenerationPort {
  private defaultPromptSlug: string;
  private defaultTimeoutMs: number;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config?: GroundedGeneratorConfig) {
    this.defaultPromptSlug = config?.defaultPromptSlug ?? "chat_system";
    this.defaultTimeoutMs = config?.defaultTimeoutMs ?? 15000;
    this.defaultTemperature = config?.defaultTemperature ?? 0.2;
    this.defaultMaxTokens = config?.defaultMaxTokens ?? 1024;
  }

  /**
   * Generates a strictly evidence-grounded answer with validated source citations.
   */
  public async generate(
    input: GenerationInput,
    options?: GenerationOptions,
  ): Promise<GroundedAnswer> {
    const start = performance.now();
    const language: ResponseLanguage = input.responseLanguage || "en";
    const mode: ConversationMode = input.conversationMode || "general";
    const chunks = input.contextChunks || [];

    // 1. Strict Grounding Rule: If context has 0 chunks, instantly return insufficient evidence
    if (chunks.length === 0) {
      return createInsufficientEvidenceAnswer(language, mode);
    }

    // 2. Build available citations catalog
    const catalog: CitationReference[] =
      input.availableCitations && input.availableCitations.length > 0
        ? input.availableCitations
        : chunks.map((c) => ({
            citationId: c.citationId,
            sourceId: c.sourceId,
            sourceType: c.sourceType,
            title: c.title,
            locale: c.locale,
            headingHierarchy: c.headingHierarchy,
            tags: c.tags,
            sectionScope: c.sectionScope,
          }));

    const catalogFormatted = catalog
      .map(
        (c) =>
          `[cit:${c.citationId}] ${c.title} (Type: ${c.sourceType}${c.sectionScope ? `, Section: ${c.sectionScope}` : ""})`,
      )
      .join("\n");

    // 3. Format context chunks if not already formatted
    const formattedContext =
      input.formattedContext ||
      chunks
        .map(
          (c) =>
            `<source id="${c.id}" citation_id="${c.citationId}" title="${c.title}">\n${c.content}\n</source>`,
        )
        .join("\n\n");

    // 4. Query active generation model assignment from registry
    let rawAnswer = "";
    let modelUsed = "heuristic-grounded-fallback";
    let providerType = "heuristic";
    let promptTokens = 0;
    let completionTokens = 0;
    let strategy: "llm" | "fallback" | "insufficient_evidence" = "fallback";
    let systemPrompt = `You are Anas's engineering portfolio AI assistant. Answer strictly using provided evidence in ${language} under ${mode} mode. Every claim must cite [cit:ID].`;
    let userPrompt = input.userMessage;

    try {
      const [assignments, providers, runtimePolicy] = await Promise.all([
        modelRegistryService.listAssignments("production"),
        modelRegistryService.listProviders(),
        modelRegistryService.getRuntimePolicy(),
      ]);

      const activeAssignment = assignments.find((a) => a.capability === "generation" && a.isActive);

      if (activeAssignment) {
        const provider = providers.find((p) => p.id === activeAssignment.providerId);

        if (provider && provider.isEnabled) {
          // Resolve prompt template only when active model is ready
          const promptSlug = input.promptSlug || this.defaultPromptSlug;

          try {
            const rendered = await promptService.renderPrompt(promptSlug, {
              response_language: language,
              conversation_mode: mode,
              context_chunks: formattedContext,
              citation_catalog: catalogFormatted,
              conversation_summary: input.conversationSummary || "None",
              user_message: input.userMessage,
            });
            systemPrompt = rendered.systemPrompt;
            userPrompt = rendered.userPrompt || input.userMessage;
          } catch (err) {
            logger.warn("Failed to render prompt from registry, using baseline system prompt", {
              module: "generation",
              metadata: { promptSlug, error: String(err) },
            });
          }

          let apiKey: string | null = null;
          if (provider.hasApiKey) {
            try {
              apiKey = await secretsService.getSecret(`ai_provider_${provider.id}_api_key`);
            } catch {
              // Ignore secret retrieval failure if key is optional/absent
            }
          }

          const timeoutMs =
            options?.timeoutMs ?? runtimePolicy?.timeoutMs ?? this.defaultTimeoutMs;
          const temperature = options?.temperature ?? this.defaultTemperature;
          const maxTokens = options?.maxTokens ?? this.defaultMaxTokens;

          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({
              model: activeAssignment.modelId,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature,
              max_tokens: maxTokens,
            }),
            signal: controller.signal,
          });

          clearTimeout(timer);

          if (response.ok) {
            const data = (await response.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
              usage?: {
                prompt_tokens?: number;
                completion_tokens?: number;
                total_tokens?: number;
              };
            };

            const content = data.choices?.[0]?.message?.content?.trim();
            if (content) {
              rawAnswer = content;
              modelUsed = activeAssignment.modelId;
              providerType = provider.providerType;
              promptTokens = data.usage?.prompt_tokens ?? Math.ceil(systemPrompt.length / 4);
              completionTokens = data.usage?.completion_tokens ?? Math.ceil(content.length / 4);
              strategy = "llm";
            }
          } else {
            logger.warn("Generation provider returned non-200 status, falling back to heuristic", {
              module: "generation",
              metadata: { status: response.status, providerId: provider.id },
            });
          }
        }
      }
    } catch (err) {
      logger.warn("Grounded generation call failed or timed out, executing fallback", {
        module: "generation",
        metadata: { error: String(err) },
      });
    }

    // 6. If LLM did not generate an answer (offline / error / test), invoke heuristic generator
    if (!rawAnswer) {
      const heuristicResult = generateHeuristicAnswer(input);
      rawAnswer = heuristicResult.text;
      strategy = "fallback";
      promptTokens = Math.ceil(systemPrompt.length / 4);
      completionTokens = Math.ceil(rawAnswer.length / 4);
    }

    // 7. Validate citations & sanitize output
    const validation = citationValidator.validate(rawAnswer, catalog, language);
    const hasInsufficientEvidence = isInsufficientEvidenceText(validation.cleanedText);

    const latencyMs = Math.round(performance.now() - start);

    return {
      content: validation.cleanedText,
      rawContent: rawAnswer,
      language,
      conversationMode: mode,
      citations: validation.citations,
      validation,
      hasInsufficientEvidence,
      telemetry: {
        modelUsed,
        providerType,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        latencyMs,
        citedSourcesCount: validation.validCitedIds.length,
        hasInsufficientEvidence,
        strategy: hasInsufficientEvidence ? "insufficient_evidence" : strategy,
      },
    };
  }
}

export const groundedGenerator = new GroundedGenerator();
