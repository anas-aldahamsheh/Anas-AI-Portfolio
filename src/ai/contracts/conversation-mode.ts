import { z } from "zod";
import { ConversationMode, ResponseLanguage } from "./generation";

export interface ConversationModeConfig {
  id: string;
  slug: ConversationMode;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  toneGuidelines: string;
  focusAreas: string;
  promptSlug: string;
  isEnabled: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalizedConversationMode {
  id: string;
  slug: ConversationMode;
  name: string;
  description: string;
  toneGuidelines: string;
  focusAreas: string;
  isEnabled: boolean;
  sortOrder: number;
}

export interface UpdateConversationModeInput {
  nameEn?: string | undefined;
  nameAr?: string | undefined;
  descriptionEn?: string | undefined;
  descriptionAr?: string | undefined;
  toneGuidelines?: string | undefined;
  focusAreas?: string | undefined;
  promptSlug?: string | undefined;
  isEnabled?: boolean | undefined;
  isPublished?: boolean | undefined;
  sortOrder?: number | undefined;
}

export interface ConversationModePort {
  listModes(locale?: ResponseLanguage): Promise<LocalizedConversationMode[]>;
  getAllConfigs(): Promise<ConversationModeConfig[]>;
  getModeBySlug(slug: string): Promise<ConversationModeConfig | null>;
  verifyMode(slug: string | undefined | null): Promise<ConversationMode>;
  updateMode(id: string, input: UpdateConversationModeInput): Promise<ConversationModeConfig>;
}

export const updateConversationModeSchema = z.object({
  nameEn: z.string().min(1).max(100).optional(),
  nameAr: z.string().min(1).max(100).optional(),
  descriptionEn: z.string().min(1).max(500).optional(),
  descriptionAr: z.string().min(1).max(500).optional(),
  toneGuidelines: z.string().min(1).max(1000).optional(),
  focusAreas: z.string().min(1).max(1000).optional(),
  promptSlug: z.string().min(1).max(100).optional(),
  isEnabled: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100).optional(),
});
