import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { mediaAssets } from "@/lib/db/schema";

/** Vercel rejects request bodies above 4.5 MB; stay safely under it. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "text/plain": "txt",
  "text/markdown": "md",
};

export class UploadError extends Error {}

/** Checks the file's real signature (magic bytes), not just the declared type. */
export function sniffType(bytes: Buffer, declared: string, fileName: string): string {
  const head = bytes.subarray(0, 12);
  if (head.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (head[0] === 0x89 && head.subarray(1, 4).toString("latin1") === "PNG") return "image/png";
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (
    head.subarray(0, 4).toString("latin1") === "RIFF" &&
    head.subarray(8, 12).toString("latin1") === "WEBP"
  )
    return "image/webp";
  if (head.subarray(4, 12).toString("latin1").startsWith("ftypavi")) return "image/avif";
  if (head.subarray(0, 4).toString("latin1") === "GIF8") return "image/gif";
  const text = /\.(md|markdown)$/i.test(fileName) ? "text/markdown" : "text/plain";
  if (
    (declared.startsWith("text/") || /\.(txt|md|markdown)$/i.test(fileName)) &&
    !bytes.subarray(0, 4096).includes(0)
  )
    return text;
  throw new UploadError("Unsupported file type. Use PDF, PNG, JPG, WEBP, AVIF, GIF, TXT or MD.");
}

export interface StoredMedia {
  id: string;
  url: string;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
}

export async function storeMedia(
  file: File,
  options: { accept?: "image" | "document" | "any" } = {},
): Promise<StoredMedia> {
  if (file.size === 0) throw new UploadError("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("The file is larger than 4 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = sniffType(bytes, file.type, file.name);
  if (options.accept === "image" && !mimeType.startsWith("image/"))
    throw new UploadError("Please choose an image.");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const fileName =
    file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 150) ||
    `file.${ALLOWED_TYPES[mimeType] ?? "bin"}`;

  const [existing] = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.sha256, sha256))
    .limit(1);
  const id =
    existing?.id ??
    (
      await db
        .insert(mediaAssets)
        .values({ sha256, fileName, mimeType, sizeBytes: bytes.length, data: bytes })
        .returning({ id: mediaAssets.id })
    )[0]?.id;
  if (!id) throw new UploadError("Could not save the file.");
  return { id, url: `/media/${id}`, mimeType, fileName, sizeBytes: bytes.length };
}

export async function readMedia(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return row ?? null;
}

export function mediaIdFromUrl(url: string): string | null {
  const match = /^\/media\/([0-9a-f-]{36})/i.exec(url);
  return match?.[1] ?? null;
}
