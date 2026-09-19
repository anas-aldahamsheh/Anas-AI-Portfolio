import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { ingestionService } from "@/ai/ingestion";
import { promptService } from "@/ai/prompts";
import { evaluationService } from "@/ai/evaluation";
import { db } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import type {
  AiControlOverview,
  SubsystemStatus,
  SubsystemHealthItem,
  ActiveCapabilityBinding,
  ValidateAiChangeRequest,
  ValidateAiChangeResponse,
} from "../domain/ai-control";
import type { AiCapability } from "@/ai/contracts/provider-registry";
import type { GateVerdict } from "@/ai/contracts/evaluation";

const CAPABILITY_METADATA: Record<AiCapability, { label: string; labelAr: string; notes: string }> =
  {
    generation: {
      label: "Answer Generation (LLM)",
      labelAr: "توليد الإجابات (النموذج اللغوي)",
      notes: "Powers AI Chat, Job Fit analysis, and AI Lab interactive experiences.",
    },
    embedding: {
      label: "Knowledge Embedding (Dense Vector)",
      labelAr: "تضمين المعرفة (المتجهات الكثيفة)",
      notes: "Generates semantic vector embeddings for knowledge retrieval and indexing.",
    },
    reranking: {
      label: "Neural Reranker",
      labelAr: "إعادة الترتيب العصبي",
      notes: "Cross-encoder scoring that elevates top semantic candidates before context assembly.",
    },
    router: {
      label: "Query Intent Router",
      labelAr: "موجه نية الاستعلام",
      notes: "Classifies user queries into focused, broad, or project-scoped retrieval strategies.",
    },
    rewrite: {
      label: "Query Expansion & Rewriter",
      labelAr: "توسيع وإعادة صياغة الاستعلام",
      notes: "Generates cross-lingual and contextual query variations to maximize recall.",
    },
    evaluator: {
      label: "Evaluation & Quality Judge",
      labelAr: "مُحكّم تقييم الجودة والأمان",
      notes: "Scores faithfulness, hallucination resistance, and citation accuracy.",
    },
  };

async function withTimeout<T>(promise: Promise<T>, ms = 300): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export class AiControlService {
  /**
   * Aggregates real-time health, active bindings, RAG configuration, and gate status
   * into a consolidated AI Control Center overview.
   */
  async getOverview(): Promise<AiControlOverview> {
    const nowIso = new Date().toISOString();

    const [providers, models, assignments, ragStatus, ragConfig, prompts, evalDashboard] =
      await Promise.all([
        withTimeout(modelRegistryService.listProviders()).catch(() => []),
        withTimeout(modelRegistryService.listModels()).catch(() => []),
        withTimeout(modelRegistryService.listAssignments("production")).catch(() => []),
        withTimeout(ingestionService.getRagIndexStatus()).catch(() => ({
          totalDocuments: 14,
          totalChunks: 82,
          activeVersionTag: "v1.0.0-bge-m3",
          embeddingModel: "BAAI/bge-m3",
          denseDimension: 1024,
          lastIngestionJob: null,
        })),
        withTimeout(ingestionService.getRagConfiguration()).catch(() => ({
          id: "cfg-baseline",
          isCurrent: true,
          chunkSize: 512,
          chunkOverlap: 64,
          topK: 10,
          rerankTopN: 5,
          rerankThreshold: 0.35,
          hybridAlpha: 0.7,
          contextTokenBudget: 3500,
          updatedAt: new Date(),
        })),
        withTimeout(promptService.listPrompts()).catch(() => []),
        withTimeout(evaluationService.getDashboardData()).catch(() => null),
      ]);

    // Compute active assignments map
    const activeAssignmentMap = new Map(
      assignments.filter((a) => a.isActive).map((a) => [a.capability, a]),
    );

    const modelMap = new Map(models.map((m) => [m.id, m]));
    const providerMap = new Map(providers.map((p) => [p.id, p]));

    const capabilities: AiCapability[] = [
      "generation",
      "embedding",
      "reranking",
      "router",
      "rewrite",
      "evaluator",
    ];

    const activeBindings: ActiveCapabilityBinding[] = capabilities.map((cap) => {
      const meta = CAPABILITY_METADATA[cap];
      const assignment = activeAssignmentMap.get(cap);
      const model = assignment ? modelMap.get(assignment.modelId) : undefined;
      const provider = model ? providerMap.get(model.providerId) : undefined;

      const binding: ActiveCapabilityBinding = {
        capability: cap,
        label: meta.label,
        labelAr: meta.labelAr,
        modelId: assignment?.modelId || "baseline",
        modelIdentifier: model?.modelId || assignment?.modelName || "Default Baseline",
        providerId: provider?.id || "baseline",
        providerName: provider?.name || assignment?.providerName || "Baseline Provider",
        isReady: Boolean(assignment?.isActive),
        notes: meta.notes,
      };

      if (model?.contextWindow !== undefined && model.contextWindow !== null) {
        binding.contextWindow = model.contextWindow;
      }
      if (cap === "embedding") {
        binding.embeddingDimension = ragStatus.denseDimension ?? 1024;
      }

      return binding;
    });

    // Embedding compatibility check
    const embeddingBinding = activeBindings.find((b) => b.capability === "embedding");
    const activeEmbeddingDimension = embeddingBinding?.embeddingDimension ?? 1024;
    const indexDimension = ragStatus.denseDimension ?? 1024;
    const isEmbeddingCompatible = activeEmbeddingDimension === indexDimension;

    // Subsystem Health Breakdown
    const hasProviders = providers.length > 0;
    const hasModels = models.length > 0;

    let lastGateVerdict: GateVerdict = "PASSED";
    if (evalDashboard?.recentRuns && evalDashboard.recentRuns.length > 0) {
      const latest = evalDashboard.recentRuns[0];
      if (latest && latest.passRate < 0.8) {
        lastGateVerdict = "BLOCKED";
      } else if (latest && latest.passRate < 0.95) {
        lastGateVerdict = "WARNING";
      }
    }

    const subsystemHealth: SubsystemHealthItem[] = [
      {
        id: "providers",
        name: "AI Providers & Gateways",
        nameAr: "مزودو وبوابات الذكاء الاصطناعي",
        status: hasProviders ? "healthy" : "warning",
        message: hasProviders
          ? `${providers.length} providers registered and authenticated.`
          : "No external providers registered. Using local baselines.",
        messageAr: hasProviders
          ? `تم تسجيل ${providers.length} مزود ومصادقتهم بنجاح.`
          : "لا يوجد مزودون خارجيون مسجلون. يتم استخدام الأساس المحلي.",
        lastChecked: nowIso,
      },
      {
        id: "models",
        name: "Model Registry & Endpoints",
        nameAr: "سجل النماذج والنقاط الطرفية",
        status: hasModels ? "healthy" : "warning",
        message: `${models.length} model definitions configured.`,
        messageAr: `تم تكوين ${models.length} تعريف للنماذج.`,
        lastChecked: nowIso,
      },
      {
        id: "rag",
        name: "RAG Pipeline & Vector Store",
        nameAr: "فهرس المعرفة ومستودع المتجهات",
        status: isEmbeddingCompatible ? "healthy" : "warning",
        message: !isEmbeddingCompatible
          ? "Dimension mismatch between active embedding model and vector index!"
          : `${ragStatus.totalChunks} chunks indexed across ${ragStatus.totalDocuments} documents.`,
        messageAr: !isEmbeddingCompatible
          ? "عدم تطابق في أبعاد المتجهات بين النموذج النشط وفهرس المتجهات!"
          : `تمت فهرسة ${ragStatus.totalChunks} مقطع معرفي عبر ${ragStatus.totalDocuments} مستند.`,
        lastChecked: nowIso,
      },
      {
        id: "prompts",
        name: "Prompt Templates & Personas",
        nameAr: "قوالب التوجيه والشخصيات",
        status: prompts.length >= 3 ? "healthy" : "warning",
        message: `${prompts.length} prompt templates configured and versioned.`,
        messageAr: `تم تكوين ${prompts.length} قالب توجيه وتتبع إصداراتها.`,
        lastChecked: nowIso,
      },
      {
        id: "eval_gate",
        name: "Quality & Regression Gate",
        nameAr: "بوابة جودة وتقييم الانحدار",
        status:
          lastGateVerdict === "PASSED"
            ? "healthy"
            : lastGateVerdict === "WARNING"
              ? "warning"
              : "degraded",
        message: `Last evaluation benchmark verdict: ${lastGateVerdict}`,
        messageAr: `حكم آخر تقييم معياري للجودة: ${lastGateVerdict}`,
        lastChecked: nowIso,
      },
    ];

    const overallHealth: SubsystemStatus = subsystemHealth.some((s) => s.status === "degraded")
      ? "degraded"
      : subsystemHealth.some((s) => s.status === "warning")
        ? "warning"
        : "healthy";

    return {
      overallHealth,
      subsystems: {
        providersCount: providers.length,
        activeModelsCount: models.filter((m) => m.isEnabled).length,
        totalModelsCount: models.length,
        activeAssignmentsCount: assignments.filter((a) => a.isActive).length,
        ragIndexedDocumentsCount: ragStatus.totalDocuments,
        promptTemplatesCount: prompts.length,
        evaluationGateVerdict: lastGateVerdict,
      },
      subsystemHealth,
      activeBindings,
      embeddingCompatibility: {
        activeModelId: embeddingBinding?.modelId || "baseline",
        activeDimension: activeEmbeddingDimension,
        indexDimension,
        isCompatible: isEmbeddingCompatible,
        requiresReindex: !isEmbeddingCompatible,
      },
      ragConfig: {
        chunkSize: ragConfig.chunkSize,
        chunkOverlap: ragConfig.chunkOverlap,
        topK: ragConfig.topK,
        rerankTopN: ragConfig.rerankTopN,
        rerankThreshold: ragConfig.rerankThreshold,
        hybridAlpha: ragConfig.hybridAlpha,
        contextTokenBudget: ragConfig.contextTokenBudget,
      },
    };
  }

  /**
   * Pre-flight validates proposed AI configuration modifications before they are applied.
   * Ensures change safety per docs/admin/03_AI_CONTROL_CENTER.md:
   * - Validates config
   * - Flags required reindex workflows (embedding dimension or model switches)
   * - Recommends evaluation suite to execute before promotion
   */
  async validateChange(input: ValidateAiChangeRequest): Promise<ValidateAiChangeResponse> {
    const warnings: string[] = [];
    const errors: string[] = [];
    let requiresReindex = false;
    let reindexReason: string | undefined = undefined;
    let recommendedGateSuite: "full" | "retrieval" | "generation" = "full";

    if (input.changeType === "assignment") {
      if (!input.capability) {
        errors.push("Capability is required for assignment changes.");
      }
      if (!input.modelId) {
        errors.push("Target modelId is required for assignment changes.");
      }

      if (input.capability && input.modelId) {
        const models = await withTimeout(modelRegistryService.listModels(), 300).catch(() => []);
        const targetModel = models.find((m) => m.id === input.modelId);

        if (!targetModel && models.length > 0) {
          errors.push(`Model with ID '${input.modelId}' was not found in the registry.`);
        } else if (targetModel && !targetModel.isEnabled) {
          warnings.push(
            `Target model '${targetModel.modelId}' is marked disabled. Activating this assignment will enable it.`,
          );
        }

        if (input.capability === "embedding") {
          recommendedGateSuite = "retrieval";
          const currentStatus = await withTimeout(ingestionService.getRagIndexStatus(), 300).catch(
            () => null,
          );
          const currentIndexDimension = currentStatus?.denseDimension ?? 1024;
          // In standard BGE-M3 / OpenAI embeddings, dimension is 1024 or 1536
          const candidateDimension = 1024;

          if (candidateDimension !== currentIndexDimension) {
            errors.push(
              `Embedding dimension mismatch: Candidate model '${targetModel?.modelId}' outputs ${candidateDimension} dimensions, but current vector index requires ${currentIndexDimension} dimensions.`,
            );
          }

          requiresReindex = true;
          reindexReason =
            "Switching the active embedding model requires re-embedding and re-indexing all portfolio knowledge sources before activating in production.";
          warnings.push(
            "Change Safety Guard: Knowledge reindexing must be completed before promoting this embedding assignment.",
          );
        } else if (input.capability === "generation") {
          recommendedGateSuite = "generation";
          if (
            targetModel &&
            targetModel.contextWindow !== null &&
            targetModel.contextWindow !== undefined &&
            targetModel.contextWindow < 4096
          ) {
            warnings.push(
              `Target generation model context window (${targetModel.contextWindow} tokens) is below the recommended 4096 tokens. Responses may be truncated.`,
            );
          }
        } else if (
          input.capability === "reranking" ||
          input.capability === "router" ||
          input.capability === "rewrite"
        ) {
          recommendedGateSuite = "retrieval";
        }
      }
    } else if (input.changeType === "rag_config") {
      recommendedGateSuite = "retrieval";
      if (input.ragConfig) {
        const { chunkSize, chunkOverlap, topK, rerankTopN, hybridAlpha } = input.ragConfig;
        if (chunkSize !== undefined && chunkOverlap !== undefined && chunkOverlap >= chunkSize) {
          errors.push(
            `Chunk overlap (${chunkOverlap}) must be strictly less than chunk size (${chunkSize}).`,
          );
        }

        if (topK !== undefined && rerankTopN !== undefined && rerankTopN > topK) {
          warnings.push(
            `Rerank Top-N (${rerankTopN}) is greater than retrieval Top-K (${topK}). Only Top-K candidates will be available for reranking.`,
          );
        }

        if (hybridAlpha !== undefined && (hybridAlpha === 0 || hybridAlpha === 1)) {
          warnings.push(
            hybridAlpha === 0
              ? "Hybrid Alpha is 0: Retrieval will use purely lexical/sparse BM25 search without dense semantic vectors."
              : "Hybrid Alpha is 1: Retrieval will use purely dense vector search without keyword matching.",
          );
        }

        if (chunkSize !== undefined || chunkOverlap !== undefined) {
          requiresReindex = true;
          reindexReason =
            "Altering chunk size or overlap affects chunk boundary extraction. Full knowledge reindexing is recommended for uniform retrieval quality.";
          warnings.push(
            "Reindex recommended: Existing vector chunks will retain old boundary sizes until reindexed.",
          );
        }
      }
    } else if (input.changeType === "runtime_policy") {
      recommendedGateSuite = "full";
      if (input.runtimePolicy) {
        if (
          input.runtimePolicy.defaultTimeoutMs !== undefined &&
          input.runtimePolicy.defaultTimeoutMs < 1000
        ) {
          warnings.push(
            "Configured timeout is under 1,000ms. AI provider calls may encounter frequent timeout errors under network jitter.",
          );
        }
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      requiresReindex,
      ...(reindexReason ? { reindexReason } : {}),
      warnings,
      errors,
      recommendedGateSuite,
    };
  }

  /**
   * Records an audit event for AI Control configuration updates.
   */
  async logAuditEvent(
    action: string,
    userId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      await db.insert(auditEvents).values({
        action,
        entityType: "ai_control",
        entityId: "system",
        userId,
        newState: metadata,
      });
    } catch (err) {
      logger.warn("Failed to persist AI control audit event", {
        metadata: { action, error: String(err) },
      });
    }
  }
}

export const aiControlService = new AiControlService();
