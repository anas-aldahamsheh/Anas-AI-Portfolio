import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { getGeminiApiKey } from "@/ai/gemini/client";

/** Liveness + dependency check (no secrets, no internals). */
export async function GET() {
  const started = Date.now();
  let database = false;
  let indexedChunks = 0;
  try {
    const rows = (await db.execute<{ count: number }>(
      sql`select count(*)::int as count from knowledge_chunks`,
    )) as unknown as {
      count: number;
    }[];
    indexedChunks = Number(rows[0]?.count ?? 0);
    database = true;
  } catch {
    database = false;
  }
  const ok = database;
  return Response.json(
    {
      ok,
      database,
      ai: Boolean(getGeminiApiKey()),
      indexedChunks,
      latencyMs: Date.now() - started,
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
