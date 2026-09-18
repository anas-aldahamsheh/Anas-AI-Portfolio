import { z } from "zod";

export type JobFitEvidenceStatus = "supported" | "partially_supported" | "not_found";

export interface JobFitCitation {
  sourceId: string;
  sourceType: "project" | "cv";
  title: string;
  sectionHierarchy?: string[] | undefined;
  url?: string | undefined;
  snippet?: string | undefined;
}

export interface JobFitRequirementMatch {
  id: string;
  requirement: string;
  status: JobFitEvidenceStatus;
  confidence: number;
  explanation: string;
  citations: JobFitCitation[];
  uncertaintyNote?: string | undefined;
}

export interface JobFitAnalysisSummary {
  totalRequirements: number;
  supportedCount: number;
  partiallySupportedCount: number;
  notFoundCount: number;
  matchScore: number;
  overview: string;
  strengths: string[];
  gapsOrConsiderations: string[];
}

export interface JobFitAnalysisTelemetry {
  retrievedCount: number;
  rerankedCount: number;
  tokenCount: number;
  durationMs: number;
  language: "en" | "ar";
}

export interface JobFitAnalysisResult {
  summary: JobFitAnalysisSummary;
  requirements: JobFitRequirementMatch[];
  telemetry: JobFitAnalysisTelemetry;
}

export const JobFitRequestSchema = z.object({
  jobDescription: z
    .string()
    .min(30, "Job description must be at least 30 characters long")
    .max(15000, "Job description must not exceed 15,000 characters"),
  locale: z.string().optional().default("en"),
});

export type JobFitRequestInput = z.infer<typeof JobFitRequestSchema>;

export interface JobFitPort {
  analyze(input: JobFitRequestInput): Promise<JobFitAnalysisResult>;
}
