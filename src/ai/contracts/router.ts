import { z } from "zod";
import { IngestionSourceType } from "./ingestion";

export const ROUTE_IDS = [
  "profile",
  "project",
  "skills",
  "experience",
  "certification",
  "technical_detail",
  "job_fit",
  "cv",
  "broad_portfolio",
] as const;

export type RouteId = (typeof ROUTE_IDS)[number];

export interface RetrievalPolicy {
  id: string;
  name: string;
  description: string;
  sourceTypes?: IngestionSourceType[] | undefined;
  denseEnabled: boolean;
  sparseEnabled: boolean;
  denseTopK: number;
  sparseTopK: number;
  candidateCap: number;
  rrfK: number;
  isDefault?: boolean | undefined;
}

export interface QueryRouteDefinition {
  id: RouteId;
  label: string;
  description: string;
  retrievalPolicyId: string;
  needsRewrite: boolean;
  keywords: {
    ar: string[];
    en: string[];
  };
}

export const RouterOutputSchema = z
  .object({
    route_id: z.enum(ROUTE_IDS),
    confidence: z.number().min(0.0).max(1.0),
    entity_hints: z.array(z.string()),
    needs_rewrite: z.boolean(),
    retrieval_policy_id: z.string(),
    reasoning: z.string().optional(),
    matched_keywords: z.array(z.string()).optional(),
  })
  .passthrough();

export type RouterOutput = z.infer<typeof RouterOutputSchema> & {
  policy?: RetrievalPolicy | undefined;
  matched_keywords?: string[] | undefined;
};

export interface RouterOptions {
  locale?: "ar" | "en" | undefined;
  forceRouteId?: RouteId | undefined;
  minConfidenceThreshold?: number | undefined;
}

export interface QueryRouterPort {
  route(query: string, options?: RouterOptions): Promise<RouterOutput>;
}
