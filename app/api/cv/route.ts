import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentEntries } from "@/lib/db/schema";
import { mediaIdFromUrl, readMedia } from "@/server/media/store";

/**
 * The current CV, always fresh (no stale cached blank PDF). `?inline=1` opens it in the browser,
 * otherwise it downloads with a readable file name.
 */
export async function GET(request: Request) {
  const [profile] = await db
    .select({ data: contentEntries.data, i18n: contentEntries.i18n })
    .from(contentEntries)
    .where(and(eq(contentEntries.collection, "profile"), eq(contentEntries.slug, "main")))
    .limit(1);
  const cv = typeof profile?.data?.["cv"] === "string" ? (profile.data["cv"] as string) : "";
  if (!cv) return new Response("CV not available yet.", { status: 404 });

  const mediaId = mediaIdFromUrl(cv);
  if (!mediaId) return Response.redirect(new URL(cv, request.url), 302);
  const media = await readMedia(mediaId);
  if (!media) return new Response("CV not available yet.", { status: 404 });

  const name = (profile?.i18n?.["en"]?.["name"] as string | undefined)?.trim() || "CV";
  const fileName = `${name.replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, "-")}-CV.pdf`;
  const inline = new URL(request.url).searchParams.get("inline") === "1";

  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(media.sizeBytes),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "public, max-age=0, must-revalidate",
      ETag: `"${media.sha256.slice(0, 32)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
