import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { logger } from "@/lib/observability/logger";

export interface StorageResult {
  fileUrl: string;
  fileSize: number;
}

/**
 * Minimal valid PDF byte sequence representing an empty single-page document.
 * Starts with %PDF-1.4 header and ends with %%EOF.
 */
export const MINIMAL_VALID_PDF_BYTES = Buffer.from(
  "%PDF-1.4\n" +
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n" +
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <<>> >> endobj\n" +
    "xref\n" +
    "0 4\n" +
    "0000000000 65535 f \n" +
    "0000000009 00000 n \n" +
    "0000000058 00000 n \n" +
    "0000000115 00000 n \n" +
    "trailer << /Size 4 /Root 1 0 R >>\n" +
    "startxref\n" +
    "190\n" +
    "%%EOF\n",
  "utf-8",
);

export class CvStorageService {
  private inMemoryStore: Map<string, { buffer: Buffer; mimeType: string }> = new Map();
  private storageDir: string;

  constructor(customStorageDir?: string) {
    this.storageDir = customStorageDir || path.join(process.cwd(), "public", "uploads", "cv");
    // Seed in-memory store with default minimal valid PDF for instant access
    this.inMemoryStore.set("default-cv.pdf", {
      buffer: MINIMAL_VALID_PDF_BYTES,
      mimeType: "application/pdf",
    });
  }

  /**
   * Save a PDF buffer to storage.
   */
  async savePdf(fileName: string, buffer: Buffer): Promise<StorageResult> {
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${fileHash}-${sanitizedName}`;

    // Store in memory map for ultra-fast, zero-IO reads
    this.inMemoryStore.set(uniqueFileName, {
      buffer,
      mimeType: "application/pdf",
    });

    // Also persist to disk if filesystem write is available
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      const targetPath = path.join(this.storageDir, uniqueFileName);
      await fs.writeFile(targetPath, buffer);
    } catch (err) {
      logger.warn("cv_disk_write_warning_fallback_to_memory", {
        module: "cv_storage",
        metadata: { error: String(err) },
      });
    }

    return {
      fileUrl: `/api/cv/download?file=${encodeURIComponent(uniqueFileName)}`,
      fileSize: buffer.length,
    };
  }

  /**
   * Retrieve PDF binary buffer by filename or URL identifier.
   */
  async getPdfBuffer(fileIdentifier?: string | null): Promise<Buffer> {
    if (!fileIdentifier) {
      return MINIMAL_VALID_PDF_BYTES;
    }

    const cleanName = path.basename(fileIdentifier.replace("/api/cv/download?file=", ""));

    // Check memory store first
    const mem = this.inMemoryStore.get(cleanName);
    if (mem) {
      return mem.buffer;
    }

    // Check disk storage
    try {
      const diskPath = path.join(this.storageDir, cleanName);
      const data = await fs.readFile(diskPath);
      this.inMemoryStore.set(cleanName, {
        buffer: data,
        mimeType: "application/pdf",
      });
      return data;
    } catch {
      // Return baseline valid PDF buffer
      return MINIMAL_VALID_PDF_BYTES;
    }
  }
}

export const cvStorageService = new CvStorageService();
