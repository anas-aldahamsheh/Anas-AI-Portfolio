import {
  forgetEntries,
  repairMissingEmbeddings,
  syncKnowledge,
  type SyncResult,
} from "@/ai/knowledge/indexer";
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
export async function rebuildKnowledge(): Promise<SyncResult & { repaired: number }> {
  const rows = await listAllRows();
  const inputs = rows.flatMap(knowledgeInputsForRow);
  const result = await syncKnowledge(inputs, { all: true });
  let repaired = 0;
  try {
    repaired = await repairMissingEmbeddings();
  } catch (error) {
    console.error("knowledge_repair_failed", error instanceof Error ? error.message : error);
  }
  return { ...result, repaired };
}
