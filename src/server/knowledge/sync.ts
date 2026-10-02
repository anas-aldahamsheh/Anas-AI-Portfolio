import {
  type EmbedPacing,
  forgetEntries,
  repairMissingEmbeddings,
  syncKnowledge,
  type SyncResult,
} from "@/ai/knowledge/indexer";
import { isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { appSettings, knowledgeChunks } from "@/lib/db/schema";
import { getRowById, listAllRows } from "@/server/content/repository";
import { knowledgeInputsForRow } from "@/server/content/knowledge-sources";

/**
 * Keeps the assistant's index in lock-step with one content entry. Called after every admin
 * write: unpublished or deleted entries are forgotten, edited ones are re-indexed (only the
 * parts whose text actually changed are re-embedded).
 */
export async function syncEntryKnowledge(
  entryId: string,
): Promise<SyncResult | { removed: number }> {
  const row = await getRowById(entryId);
  if (!row || row.status !== "published") {
    return { removed: await forgetEntries([entryId]) };
  }
  const inputs = knowledgeInputsForRow(row);
  if (inputs.length === 0) return { removed: await forgetEntries([entryId]) };
  return syncKnowledge(inputs, { entryIds: [entryId] });
}

/** Full rebuild: indexes everything published and removes anything that no longer exists. */
export async function rebuildKnowledge(
  pacing: EmbedPacing = {},
): Promise<SyncResult & { repaired: number }> {
  const rows = await listAllRows();
  const inputs = rows.flatMap(knowledgeInputsForRow);
  const result = await syncKnowledge(inputs, { all: true }, pacing);
  let repaired = 0;
  try {
    repaired = await repairMissingEmbeddings(pacing);
  } catch (error) {
    console.error("knowledge_repair_failed", error instanceof Error ? error.message : error);
  }
  return { ...result, repaired };
}

/**
 * Finishes embeddings that are still missing (for example after the daily quota ran out during
 * a deploy). Called after chat requests; it runs at most once every ten minutes and only when
 * something is missing, so the index completes itself once the quota allows it.
 */
export async function repairKnowledgeWhenDue(): Promise<void> {
  const [missing] = await db
    .select({ id: knowledgeChunks.id })
    .from(knowledgeChunks)
    .where(isNull(knowledgeChunks.embedding))
    .limit(1);
  if (!missing) return;
  const claimed = await db
    .insert(appSettings)
    .values({ key: "knowledge_repair", value: { startedAt: new Date().toISOString() } })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: { startedAt: new Date().toISOString() }, updatedAt: new Date() },
      setWhere: sql`${appSettings.updatedAt} < now() - interval '10 minutes'`,
    })
    .returning({ key: appSettings.key });
  if (claimed.length === 0) return;
  await repairMissingEmbeddings();
}
