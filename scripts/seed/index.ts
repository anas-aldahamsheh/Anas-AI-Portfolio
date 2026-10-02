/**
 * Seeds the content tables with the starter content (only entries that don't exist yet, so it
 * never overwrites edits), applies the projects release (src/content/projects) if this database
 * has not had it yet, then builds the assistant's knowledge index.
 *
 *   pnpm db:seed            # content + index
 *   pnpm db:seed --no-index # content only
 */
import seed from "@/server/content/seed-data.json";
import { and, eq } from "drizzle-orm";
import { db, client } from "@/lib/db/client";
import { contentEntries } from "@/lib/db/schema";
import { rebuildKnowledge } from "@/server/knowledge/sync";
import { applyProjectsRelease } from "@/server/content/release";

async function main() {
  let inserted = 0;
  for (const entry of seed.entries) {
    const existing = await db
      .select({ id: contentEntries.id })
      .from(contentEntries)
      .where(
        and(eq(contentEntries.collection, entry.collection), eq(contentEntries.slug, entry.slug)),
      )
      .limit(1);
    if (existing.length) continue;
    await db.insert(contentEntries).values({
      collection: entry.collection,
      slug: entry.slug,
      status: "published",
      orderIndex: entry.orderIndex,
      data: entry.data,
      i18n: entry.i18n,
    });
    inserted++;
  }
  console.info(`content: ${inserted} inserted, ${seed.entries.length - inserted} already present`);
  console.info("projects:", JSON.stringify(await applyProjectsRelease()));

  if (!process.argv.includes("--no-index")) {
    const result = await rebuildKnowledge();
    console.info("knowledge:", JSON.stringify(result));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
