import { EMBEDDING_DIMENSIONS } from "@/lib/db/schema/knowledge";

export const EMBEDDING = {
  model: process.env["GEMINI_EMBEDDING_MODEL"] || "gemini-embedding-2",
  dimensions: EMBEDDING_DIMENSIONS,
} as const;

/** What an indexed source is. Used for filtering searches and for citations. */
export const KNOWLEDGE_KINDS = [
  "profile",
  "project",
  "experience",
  "education",
  "certificate",
  "skills",
  "cv",
  "document",
  "note",
  "page",
] as const;

export type KnowledgeKind = (typeof KNOWLEDGE_KINDS)[number];
