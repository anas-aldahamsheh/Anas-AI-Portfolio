import { z } from "zod";

export type FeatureFlagCategory = "ai" | "security" | "ui" | "performance" | "experimental";

export interface FeatureFlag {
  key: string;
  isEnabled: boolean;
  description: string;
  category: FeatureFlagCategory;
  targetRolloutPercentage?: number | undefined;
  updatedAt: string;
}

export const UpdateFeatureFlagSchema = z.object({
  key: z.string().min(2).max(100),
  isEnabled: z.boolean(),
  description: z.string().max(500).optional(),
  targetRolloutPercentage: z.number().min(0).max(100).optional(),
});

export type UpdateFeatureFlagInput = z.infer<typeof UpdateFeatureFlagSchema>;

export const EvaluateFeatureFlagSchema = z.object({
  key: z.string(),
  userId: z.string().optional(),
  clientIp: z.string().optional(),
});

export type EvaluateFeatureFlagInput = z.infer<typeof EvaluateFeatureFlagSchema>;
