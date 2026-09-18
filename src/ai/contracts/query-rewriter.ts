import { z } from "zod";
import { RouteId } from "./router";

export interface QueryRewriteInput {
  userMessage: string;
  language: "ar" | "en";
  conversationSummary?: string | undefined;
  currentScope?: string | undefined;
  route?: RouteId | string | undefined;
  entityHints?: string[] | undefined;
}

export interface QueryRewriteOptions {
  enabled?: boolean | undefined;
  maxQueries?: number | undefined;
  timeoutMs?: number | undefined;
  temperature?: number | undefined;
  allowCrossLingual?: boolean | undefined;
}

export interface QueryRewriteResult {
  originalQuery: string;
  rewrittenQueries: string[];
  wasRewritten: boolean;
  strategy: "llm" | "heuristic" | "noop";
  latencyMs: number;
  modelUsed?: string | undefined;
}

export interface QueryRewriterPort {
  rewrite(input: QueryRewriteInput, options?: QueryRewriteOptions): Promise<QueryRewriteResult>;
}

export const RewriteQueriesSchema = z.array(z.string().min(1)).min(1).max(5);

export const RewriteTestInputSchema = z.object({
  userMessage: z.string().min(1).max(1000),
  language: z.enum(["ar", "en"]).default("en"),
  conversationSummary: z.string().optional(),
  currentScope: z.string().optional(),
  route: z.string().optional(),
  entityHints: z.array(z.string()).optional(),
  maxQueries: z.number().int().min(1).max(5).default(3),
  enabled: z.boolean().default(true),
});

export type RewriteTestInput = z.infer<typeof RewriteTestInputSchema>;
