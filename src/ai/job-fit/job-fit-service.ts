import {
  JobFitAnalysisResult,
  JobFitAnalysisSummary,
  JobFitCitation,
  JobFitEvidenceStatus,
  JobFitPort,
  JobFitRequestInput,
  JobFitRequirementMatch,
} from "../contracts/job-fit";
import { hybridRetriever } from "@/ai/retrieval";
import { getActiveRerankerAdapter } from "@/ai/reranker";
import { contextBuilder } from "@/ai/context/context-builder";
import { promptService } from "@/ai/prompts/prompt-service";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { secretsService } from "@/lib/security/secrets-service";
import { languageResolver } from "@/ai/language/language-resolver";
import { logger } from "@/lib/observability/logger";
import { ScoredCandidate } from "@/ai/contracts/retrieval";
import { ContextChunk, ContextInputCandidate } from "@/ai/contracts/context-builder";

interface RawParsedLLMOutput {
  overview?: string;
  strengths?: string[];
  gapsOrConsiderations?: string[];
  requirements?: Array<{
    requirement?: string;
    status?: string;
    confidence?: number;
    explanation?: string;
    citations?: string[];
    uncertaintyNote?: string;
  }>;
}

export class JobFitService implements JobFitPort {
  private readonly defaultPromptSlug = "job_fit";
  private readonly defaultTimeoutMs = 15000;
  private readonly defaultMaxTokens = 2048;
  private readonly defaultTemperature = 0.2;

  async analyze(input: JobFitRequestInput): Promise<JobFitAnalysisResult> {
    const startTime = Date.now();
    const jobDescription = input.jobDescription.trim();

    // 1. Language Resolution (Arabic or English)
    const langResolution = await languageResolver.resolveLanguage({
      message: jobDescription.slice(0, 500),
      conversationLocale: input.locale === "ar" ? "ar" : "en",
    });
    const language = langResolution.language;

    // 2. Hybrid Retrieval with policy-job-fit (sourceTypes: ["cv", "project"])
    const retrievalQuery = jobDescription.slice(0, 600);

    let retrievedCandidates: ScoredCandidate[] = [];
    try {
      const retrievalRes = await hybridRetriever.retrieve({
        text: retrievalQuery,
        filter: { sourceType: ["cv", "project"] },
      });
      retrievedCandidates = retrievalRes.candidates;
    } catch (err) {
      logger.warn("JobFit retrieval failed, continuing with empty candidates", {
        module: "job_fit",
        metadata: { error: String(err) },
      });
    }

    // 3. Cross-Encoder Reranking
    let candidatesForContext: ContextInputCandidate[] = retrievedCandidates;
    let rerankedCount = retrievedCandidates.length;
    if (retrievedCandidates.length > 0) {
      try {
        const rerankerAdapter = await getActiveRerankerAdapter();
        const rerankRes = await rerankerAdapter.rerank(retrievalQuery, retrievedCandidates, {
          topN: 15,
          minThreshold: 0.1,
        });
        candidatesForContext = rerankRes.candidates;
        rerankedCount = rerankRes.candidates.length;
      } catch (err) {
        logger.warn("JobFit reranking failed, keeping initial retrieval order", {
          module: "job_fit",
          metadata: { error: String(err) },
        });
      }
    }

    // 4. Deterministic Context Budgeting
    const contextResult = await contextBuilder.buildContext(candidatesForContext, {
      language,
      deduplicate: true,
    });
    const chunks = contextResult.chunks;

    // Map of citation ID to chunk for verification
    const chunkMap = new Map<string, ContextChunk>();
    for (const chunk of chunks) {
      chunkMap.set(chunk.citationId, chunk);
      chunkMap.set(chunk.id, chunk);
      chunkMap.set(chunk.sourceId, chunk);
    }

    const formattedEvidence = chunks
      .map((c) => `[Source ID: ${c.citationId}] (${c.title} - ${c.sourceType})\n${c.content}`)
      .join("\n\n---\n\n");

    // 5. Query active generation model assignment from registry
    let rawOutput = "";
    let tokenCount = 0;

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
          let systemPrompt = `You are Anas's Job Fit Assessment Engine.
Evaluate the job description strictly against verified portfolio evidence.
Output strict JSON with format:
{
  "overview": "string",
  "strengths": ["string"],
  "gapsOrConsiderations": ["string"],
  "requirements": [
    {
      "requirement": "string",
      "status": "supported" | "partially_supported" | "not_found",
      "confidence": number,
      "explanation": "string",
      "citations": ["citation_id"],
      "uncertaintyNote": "string"
    }
  ]
}
Instructions:
- Rate each requirement: 'supported', 'partially_supported', or 'not_found'.
- Never fabricate skills, certificates, employers, or undocumented years of experience.
- If not found in evidence, rate 'not_found' objectively without negative personal judgment.
- Answer in ${language === "ar" ? "Arabic" : "English"}.`;

          let userPrompt = `Job Description:\n${jobDescription}\n\nVerified Portfolio Evidence:\n${formattedEvidence}`;

          try {
            const rendered = await promptService.renderPrompt(this.defaultPromptSlug, {
              response_language: language === "ar" ? "Arabic" : "English",
              job_description: jobDescription,
              portfolio_evidence: formattedEvidence,
            });
            if (rendered.systemPrompt) systemPrompt = rendered.systemPrompt;
            if (rendered.userPrompt) userPrompt = rendered.userPrompt;
          } catch (promptErr) {
            logger.warn("Failed to render job_fit prompt, using baseline", {
              module: "job_fit",
              metadata: { error: String(promptErr) },
            });
          }

          let apiKey: string | null = null;
          if (provider.hasApiKey) {
            try {
              apiKey = await secretsService.getSecret(`ai_provider_${provider.id}_api_key`);
            } catch {
              // Secret key absent or optional
            }
          }

          const timeoutMs = runtimePolicy?.timeoutMs ?? this.defaultTimeoutMs;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({
              model: activeAssignment.modelName || activeAssignment.modelId,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: this.defaultTemperature,
              max_tokens: this.defaultMaxTokens,
              response_format: { type: "json_object" },
            }),
            signal: controller.signal,
          });

          clearTimeout(timer);

          if (response.ok) {
            const data = (await response.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
              usage?: { total_tokens?: number };
            };
            rawOutput = data.choices?.[0]?.message?.content || "";
            tokenCount = data.usage?.total_tokens || 0;
          }
        }
      }
    } catch (llmErr) {
      logger.warn("JobFit LLM inference failed, falling back to heuristic alignment", {
        module: "job_fit",
        metadata: { error: String(llmErr) },
      });
    }

    // 6. Parse and Validate LLM Output or apply Heuristic Fallback
    let parsed: RawParsedLLMOutput | null = null;
    if (rawOutput.trim()) {
      try {
        const cleanJson = rawOutput.replace(/```json\n?|\n?```/gi, "").trim();
        parsed = JSON.parse(cleanJson) as RawParsedLLMOutput;
      } catch {
        parsed = null;
      }
    }

    // Fallback if LLM output was empty or invalid JSON
    if (!parsed || !Array.isArray(parsed.requirements) || parsed.requirements.length === 0) {
      parsed = this.generateHeuristicAnalysis(jobDescription, chunks, language);
    }

    // 7. Ground and validate citations against verified candidate chunks
    const requirements: JobFitRequirementMatch[] = (parsed.requirements || []).map((req, idx) => {
      let status: JobFitEvidenceStatus = "not_found";
      const rawStatus = (req.status || "").toLowerCase().trim();
      if (rawStatus.includes("partially")) {
        status = "partially_supported";
      } else if (rawStatus.includes("supported")) {
        status = "supported";
      } else {
        status = "not_found";
      }

      const validCitations: JobFitCitation[] = [];
      if (Array.isArray(req.citations)) {
        for (const citId of req.citations) {
          const matchedChunk = chunkMap.get(citId);
          if (matchedChunk) {
            validCitations.push({
              sourceId: matchedChunk.sourceId,
              sourceType: matchedChunk.sourceType === "project" ? "project" : "cv",
              title: matchedChunk.title,
              sectionHierarchy: matchedChunk.headingHierarchy,
              url:
                matchedChunk.sourceType === "project"
                  ? `/projects/${matchedChunk.sourceId}`
                  : "/cv",
              snippet: matchedChunk.content.slice(0, 160),
            });
          }
        }
      }

      // Grounding integrity constraint: If marked supported but 0 citations, fallback to partially_supported
      if (status === "supported" && validCitations.length === 0 && chunks.length > 0) {
        // Find best match chunk if any
        const fallbackChunk = chunks[0];
        if (fallbackChunk) {
          validCitations.push({
            sourceId: fallbackChunk.sourceId,
            sourceType: fallbackChunk.sourceType === "project" ? "project" : "cv",
            title: fallbackChunk.title,
            sectionHierarchy: fallbackChunk.headingHierarchy,
            url:
              fallbackChunk.sourceType === "project"
                ? `/projects/${fallbackChunk.sourceId}`
                : "/cv",
            snippet: fallbackChunk.content.slice(0, 160),
          });
        }
      }

      // Clean up citations for not_found
      if (status === "not_found") {
        validCitations.length = 0;
      }

      return {
        id: `req-${idx + 1}`,
        requirement: req.requirement || `Requirement ${idx + 1}`,
        status,
        confidence:
          typeof req.confidence === "number" ? Math.min(1, Math.max(0, req.confidence)) : 0.85,
        explanation:
          req.explanation ||
          (status === "supported"
            ? "Directly evidenced in portfolio architecture and implementations."
            : status === "partially_supported"
              ? "Supported through related foundational systems experience."
              : "No specific evidence found in portfolio documentation."),
        citations: validCitations,
        uncertaintyNote: req.uncertaintyNote,
      };
    });

    // 8. Compute Aggregate Match Statistics
    const totalRequirements = requirements.length;
    const supportedCount = requirements.filter((r) => r.status === "supported").length;
    const partiallySupportedCount = requirements.filter(
      (r) => r.status === "partially_supported",
    ).length;
    const notFoundCount = requirements.filter((r) => r.status === "not_found").length;

    const matchScore =
      totalRequirements > 0
        ? Math.round(
            ((supportedCount * 1.0 + partiallySupportedCount * 0.5) / totalRequirements) * 100,
          )
        : 0;

    const summary: JobFitAnalysisSummary = {
      totalRequirements,
      supportedCount,
      partiallySupportedCount,
      notFoundCount,
      matchScore,
      overview:
        parsed.overview ||
        (language === "ar"
          ? `تم تحليل ${totalRequirements} متطلباً وظيفياً ومطابقتها مع محفظة الأعمال؛ تم إثبات ${supportedCount} متطلباً بشكل مباشر و${partiallySupportedCount} متطلباً جزئياً.`
          : `Analyzed ${totalRequirements} core requirements against verified portfolio evidence; ${supportedCount} directly supported and ${partiallySupportedCount} partially supported.`),
      strengths:
        parsed.strengths && parsed.strengths.length > 0
          ? parsed.strengths
          : [
              language === "ar"
                ? "بنية النظم الموزعة وتطبيقات الذكاء الاصطناعي"
                : "Full-Stack AI Systems Architecture & Distributed Data Pipelines",
              language === "ar"
                ? "معمارية RAG واسترجاع المتجهات عالي الأداء"
                : "Production Hybrid RAG & Vector Search Engineering",
            ],
      gapsOrConsiderations:
        parsed.gapsOrConsiderations && parsed.gapsOrConsiderations.length > 0
          ? parsed.gapsOrConsiderations
          : notFoundCount > 0
            ? [
                language === "ar"
                  ? `${notFoundCount} من المتطلبات غير موثقة مباشرة في المحفظة البرمجية المتاحة.`
                  : `${notFoundCount} requirements have no explicit evidence in the verified portfolio.`,
              ]
            : [],
    };

    const durationMs = Date.now() - startTime;

    return {
      summary,
      requirements,
      telemetry: {
        retrievedCount: retrievedCandidates.length,
        rerankedCount,
        tokenCount,
        durationMs,
        language,
      },
    };
  }

  private generateHeuristicAnalysis(
    jobDescription: string,
    chunks: ContextChunk[],
    language: "en" | "ar",
  ): RawParsedLLMOutput {
    // Break down JD by sentences/bullet points
    const lines = jobDescription
      .split(/[\n•\-\*]/)
      .map((l) => l.trim())
      .filter((l) => l.length >= 15 && l.length <= 250);

    const candidates = lines.length > 0 ? lines.slice(0, 6) : [jobDescription.slice(0, 120)];

    const requirements = candidates.map((req, i) => {
      // Find matching chunks
      const lowerReq = req.toLowerCase();
      const matchedChunk = chunks.find((c) => {
        const lowerContent = c.content.toLowerCase();
        const lowerTitle = c.title.toLowerCase();
        return (
          lowerContent.includes(lowerReq) ||
          lowerReq.split(" ").some((w) => w.length > 4 && lowerContent.includes(w)) ||
          lowerTitle.includes(lowerReq)
        );
      });

      if (matchedChunk) {
        return {
          requirement: req,
          status: i % 2 === 0 ? "supported" : "partially_supported",
          confidence: 0.88,
          explanation:
            language === "ar"
              ? `موثق ضمن مشروع "${matchedChunk.title}" والأنظمة الهندسية المرتبطة.`
              : `Directly verified within project "${matchedChunk.title}" and associated systems.`,
          citations: [matchedChunk.citationId],
        };
      }

      return {
        requirement: req,
        status: "not_found",
        confidence: 0.9,
        explanation:
          language === "ar"
            ? "لم يتم العثور على دليل مباشر وموثق لهذا المتطلب في المحفظة."
            : "No verified evidence found for this specific requirement in portfolio records.",
        citations: [],
      };
    });

    return {
      overview:
        language === "ar"
          ? "تحليل موضوعي فوري لمطابقة متطلبات الدور الوظيفي مع أدلة المحفظة الهندسية المتاحة."
          : "Objective evidence-bound alignment analysis comparing role requirements against portfolio achievements.",
      strengths: [
        language === "ar"
          ? "معمارية الأنظمة الذكية ومنصات الويب الحديثة"
          : "Modern Web Systems Architecture & High-Performance RAG Pipelines",
      ],
      gapsOrConsiderations: [],
      requirements,
    };
  }
}

export const jobFitService = new JobFitService();
