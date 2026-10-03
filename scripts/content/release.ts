/**
 * Applies the projects content release (src/content/projects) to the database, then rebuilds
 * the assistant's index so it learns the new projects and forgets removed ones.
 *
 *   pnpm content:release              # once per database (recorded in app_settings)
 *   pnpm content:release --force      # apply again, replacing admin edits to these projects
 *   pnpm content:release --check      # only validate the content, no database needed
 *
 * The Vercel build runs it with --deploy: it applies only on production deployments (previews
 * share no database writes), skips when no database is configured, and a failure stops the
 * deployment so the live site keeps its previous version.
 */
import { projectEntries } from "@/content/projects";
import {
  PROJECTS_RELEASE_ID,
  applyProjectsRelease,
  projectSlugs,
  validateProjectRelease,
} from "@/server/content/release";

const flag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const entries = projectEntries();
  const problems = validateProjectRelease(entries);
  if (problems.length) throw new Error(`Invalid project content:\n- ${problems.join("\n- ")}`);
  console.info(`release ${PROJECTS_RELEASE_ID}: ${entries.length} projects valid`);
  if (flag("check")) return;

  if (flag("deploy")) {
    const env = process.env["VERCEL_ENV"];
    if (env && env !== "production") {
      console.info(`release: skipped on a ${env} deployment`);
      return;
    }
    if (!process.env["DATABASE_URL"] || /placeholder/.test(process.env["DATABASE_URL"])) {
      console.info("release: skipped, no database configured");
      return;
    }
  }

  const { client } = await import("@/lib/db/client");
  try {
    const result = await applyProjectsRelease({ force: flag("force") });
    console.info("release:", JSON.stringify(result));
    if (result.skipped) {
      // Another deployment already applied this release; still finish any embeddings it left
      // missing (for example when the daily quota ran out), so every deploy completes the index.
      if (!flag("no-index")) {
        const { repairMissingEmbeddings } = await import("@/ai/knowledge/indexer");
        console.info("knowledge repaired:", await repairMissingEmbeddings({ patient: true }));
      }
      return;
    }
    if (!flag("no-index")) {
      const { rebuildKnowledge } = await import("@/server/knowledge/sync");
      // A build can wait out per-minute embedding limits, so the index ends up complete.
      console.info("knowledge:", JSON.stringify(await rebuildKnowledge({ patient: true })));
    }
    console.info("projects now:", (await projectSlugs()).join(", "));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
