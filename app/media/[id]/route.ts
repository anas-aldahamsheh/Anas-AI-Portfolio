import { readMedia } from "@/server/media/store";

/** Serves uploaded files. Ids are content-addressed and immutable, so caching is forever. */
export async function GET(request: Request, { params }: RouteContext<"/media/[id]">) {
  const { id } = await params;
  const media = await readMedia(id);
  if (!media) return new Response("Not found", { status: 404 });

  const etag = `"${media.sha256.slice(0, 32)}"`;
  if (request.headers.get("if-none-match") === etag)
    return new Response(null, { status: 304, headers: { ETag: etag } });

  const url = new URL(request.url);
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(media.sizeBytes),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(media.fileName)}`,
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
      // Uploaded files never run as pages on this origin.
      "Content-Security-Policy":
        "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
