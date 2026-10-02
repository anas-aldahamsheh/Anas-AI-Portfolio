import { z } from "zod";
import { cacheLife, cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { appSettings } from "@/lib/db/schema";
import { SETTINGS_TAG } from "@/server/content/tags";

/**
 * Assistant configuration, editable from the admin. Stored as one JSON row; every field has a
 * safe default so a fresh database (or a failed read) still produces a working assistant.
 */
export const aiSettingsSchema = z.object({
  /** Tried in order; the next model is used when one is overloaded or unavailable. */
  agentModels: z
    .array(z.string().min(1))
    .min(1)
    .default(["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"]),
  /** Small/fast models for reranking, translation, suggestions and document extraction. */
  fastModels: z
    .array(z.string().min(1))
    .min(1)
    .default(["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-2.5-flash-lite"]),
  thinking: z.enum(["minimal", "low", "medium", "high"]).default("low"),
  temperature: z.number().min(0).max(1.5).default(0.6),
  maxSteps: z.number().int().min(2).max(10).default(6),
  rerank: z.boolean().default(true),
  logConversations: z.boolean().default(true),
  /** Extra guidance from the owner, appended to the built-in instructions. */
  instructions: z
    .object({ en: z.string().max(4000).default(""), ar: z.string().max(4000).default("") })
    .default({}),
  quickQuestions: z
    .object({
      en: z.array(z.string().min(1).max(200)).max(8).default([]),
      ar: z.array(z.string().min(1).max(200)).max(8).default([]),
    })
    .default({}),
});

export type AiSettings = z.infer<typeof aiSettingsSchema>;

export const AI_SETTINGS_KEY = "assistant";

export const DEFAULT_QUICK_QUESTIONS = {
  en: [
    "Summarize Anas for a recruiter in 30 seconds",
    "What are his strongest AI engineering skills?",
    "Which projects prove he can ship production AI?",
    "Is he a fit for an AI Engineer role?",
  ],
  ar: [
    "لخّص أنس لمسؤول توظيف في 30 ثانية",
    "ما أقوى مهاراته في هندسة الذكاء الاصطناعي؟",
    "أي مشاريعه تثبت أنه يسلّم أنظمة ذكاء اصطناعي حقيقية؟",
    "هل هو مناسب لوظيفة مهندس ذكاء اصطناعي؟",
  ],
};

let cached: { value: AiSettings; at: number } | null = null;
const TTL_MS = 30_000;

export async function getAiSettings(): Promise<AiSettings> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
  let raw: unknown = {};
  try {
    const [row] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, AI_SETTINGS_KEY))
      .limit(1);
    raw = row?.value ?? {};
  } catch (error) {
    console.error("ai_settings_load_failed", error instanceof Error ? error.message : error);
  }
  const parsed = aiSettingsSchema.safeParse(raw);
  const value = parsed.success ? parsed.data : aiSettingsSchema.parse({});
  cached = { value, at: Date.now() };
  return value;
}

export async function saveAiSettings(input: unknown): Promise<AiSettings> {
  const value = aiSettingsSchema.parse(input);
  await db
    .insert(appSettings)
    .values({ key: AI_SETTINGS_KEY, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } });
  cached = { value, at: Date.now() };
  return value;
}

/** Quick questions shown to visitors (cached for rendering; the admin save expires the tag). */
export async function getQuickQuestions(locale: "en" | "ar"): Promise<string[]> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");
  let raw: unknown = {};
  try {
    const [row] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, AI_SETTINGS_KEY))
      .limit(1);
    raw = row?.value ?? {};
  } catch {
    // fall back to defaults
  }
  const parsed = aiSettingsSchema.safeParse(raw);
  const custom = parsed.success ? parsed.data.quickQuestions[locale] : [];
  return custom.length ? custom : DEFAULT_QUICK_QUESTIONS[locale];
}
