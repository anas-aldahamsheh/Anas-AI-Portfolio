import { z } from "zod";

export interface CvVersion {
  id: string;
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  changelog?: string | null | undefined;
  createdBy?: string | null | undefined;
  createdAt: string | Date;
}

export interface PublishedCv {
  id: string;
  cvVersionId: string;
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  changelog?: string | null | undefined;
  publishedAt: string | Date;
}

export const cvPublishInputSchema = z.object({
  versionId: z.string().uuid("Invalid version ID format"),
});

export type CvPublishInput = z.infer<typeof cvPublishInputSchema>;

export const cvRollbackInputSchema = z.object({
  versionId: z.string().uuid("Invalid version ID format"),
});

export type CvRollbackInput = z.infer<typeof cvRollbackInputSchema>;

/**
 * Validates whether binary buffer starts with valid PDF magic bytes (%PDF-).
 */
export function validatePdfBytes(buffer: Uint8Array): boolean {
  if (buffer.length < 5) return false;
  // %PDF- in ASCII is 0x25 0x50 0x44 0x46 0x2D
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

/**
 * Format raw byte size into human readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${val} ${units[i]}`;
}

export * from "./cv-boxes";
export * from "./cv-about";
