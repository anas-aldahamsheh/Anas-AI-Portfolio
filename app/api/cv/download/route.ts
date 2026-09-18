import { NextRequest, NextResponse } from "next/server";
import { cvService } from "@/modules/cv/infrastructure/cv-service";
import { cvStorageService } from "@/modules/cv/infrastructure/storage-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileParam = searchParams.get("file");
    const isDownload = searchParams.get("download") === "1";

    const published = await cvService.getPublishedCv();
    const fileName = published.fileName || "Anas_Software_AI_Engineer_CV.pdf";

    const buffer = await cvStorageService.getPdfBuffer(fileParam || published.fileUrl);

    const dispositionType = isDownload ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename="${encodeURIComponent(fileName)}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    // Return baseline valid PDF
    const fallbackBuffer = await cvStorageService.getPdfBuffer(null);
    return new NextResponse(new Uint8Array(fallbackBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="Anas_Software_AI_Engineer_CV.pdf"',
        "Content-Length": fallbackBuffer.length.toString(),
      },
    });
  }
}
