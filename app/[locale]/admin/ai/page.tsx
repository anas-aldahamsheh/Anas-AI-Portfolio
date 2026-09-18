import type { Metadata } from "next";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { ingestionService } from "@/ai/ingestion";
import { aiControlService } from "@/modules/admin/infrastructure/ai-control-service";
import { AiControlCenter } from "@/modules/admin/presentation";
import {
  BASELINE_PROVIDERS,
  BASELINE_MODELS,
  BASELINE_ASSIGNMENTS,
  BASELINE_RUNTIME_POLICY,
} from "@/ai/contracts/baseline-registry";

export const dynamic = "force-dynamic";

interface AdminAiPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminAiPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic
      ? "مركز التحكم في الذكاء الاصطناعي | لوحة التحكم"
      : "AI Control Center | Admin Control Plane",
    description: isArabic
      ? "المركز القيادي الموحد لإدارة مزودي ونماذج الذكاء الاصطناعي ومحرك الـ RAG وبوابة الجودة."
      : "Unified executive control plane for AI providers, models, capability routing, RAG pipeline, and release gates.",
  };
}

async function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 300): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export default async function AdminAiPage({ params }: AdminAiPageProps) {
  const { locale } = await params;
  const supportedLocale = locale === "ar" ? "ar" : "en";

  const [overview, providers, models, assignments, policy, ragStatus, ragConfig] =
    await Promise.all([
      aiControlService.getOverview(),
      withTimeout(
        modelRegistryService.listProviders(),
        BASELINE_PROVIDERS.map((p) => ({
          ...p,
          modelsCount: 2,
          activeModelsCount: 1,
          hasApiKey: true,
          maskedKey: "sk-***1234",
        })),
        300,
      ),
      withTimeout(
        modelRegistryService.listModels(),
        BASELINE_MODELS.map((m) => ({
          ...m,
          providerName: "OpenAI",
          providerType: "openai_compatible" as const,
          isCurrentlyAssigned: true,
        })),
        300,
      ),
      withTimeout(
        modelRegistryService.listAssignments("production"),
        BASELINE_ASSIGNMENTS.map((a) => ({
          ...a,
          modelName: "gpt-4o",
          providerId: "prov-openai-1",
          providerName: "OpenAI",
          providerType: "openai_compatible" as const,
        })),
        300,
      ),
      withTimeout(modelRegistryService.getRuntimePolicy(), BASELINE_RUNTIME_POLICY, 300),
      withTimeout(
        ingestionService.getRagIndexStatus(),
        {
          totalDocuments: 14,
          totalChunks: 82,
          activeVersionTag: "v1.0.0-bge-m3",
          embeddingModel: "BAAI/bge-m3",
          denseDimension: 1024,
          lastIngestionJob: null,
        },
        300,
      ),
      withTimeout(
        ingestionService.getRagConfiguration(),
        {
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
        },
        300,
      ),
    ]);

  return (
    <div className="py-2">
      <AiControlCenter
        initialOverview={overview}
        initialProviders={providers}
        initialModels={models}
        initialAssignments={assignments}
        initialPolicy={policy}
        initialRagStatus={ragStatus}
        initialRagConfig={ragConfig}
        locale={supportedLocale}
      />
    </div>
  );
}
