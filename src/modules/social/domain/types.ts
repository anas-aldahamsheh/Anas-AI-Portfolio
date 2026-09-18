import { z } from "zod";

export type SocialPlatform = "github" | "linkedin" | "x" | "email" | "custom";

export interface SocialProfile {
  id: string;
  platform: SocialPlatform;
  url: string;
  handle: string;
  iconName: string;
  displayName: string;
  description?: string | null | undefined;
  orderIndex: number;
  isVisible: boolean;
}

export const socialProfileUpdateSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  handle: z.string().min(1, "Handle is required"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  isVisible: z.boolean().default(true),
  orderIndex: z.number().int().optional(),
});

export type SocialProfileUpdateInput = z.infer<typeof socialProfileUpdateSchema>;

export {
  BASELINE_GITHUB_PROFILE,
  BASELINE_LINKEDIN_PROFILE,
  BASELINE_SOCIAL_PROFILES,
} from "./baseline";
