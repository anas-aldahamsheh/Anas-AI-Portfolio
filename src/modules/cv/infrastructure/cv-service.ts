import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cvVersions, cvPublications } from "@/lib/db/schema/cv";
import { auditEvents } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import { validatePdfBytes, type CvVersion, type PublishedCv } from "../domain/cv";
import { cvStorageService } from "./storage-service";

export const BASELINE_PUBLISHED_CV: PublishedCv = {
  id: "pub-baseline-1",
  cvVersionId: "ver-baseline-1",
  versionNumber: 1,
  fileUrl: "/api/cv/download",
  fileName: "Anas_Software_AI_Engineer_CV.pdf",
  fileSize: 462 * 1024,
  mimeType: "application/pdf",
  changelog: "Verified production baseline release",
  publishedAt: new Date("2026-09-01T00:00:00Z").toISOString(),
};

export class CvService {
  private cachedPublishedCv: PublishedCv | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory TTL

  public invalidateCache(): void {
    this.cachedPublishedCv = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Retrieves the currently active published CV document.
   */
  async getPublishedCv(): Promise<PublishedCv> {
    const now = Date.now();
    if (this.cachedPublishedCv && now - this.cacheTimestamp < this.CACHE_TTL_MS) {
      return this.cachedPublishedCv;
    }

    try {
      const rows = await db
        .select({
          pubId: cvPublications.id,
          versionId: cvVersions.id,
          versionNumber: cvVersions.versionNumber,
          fileUrl: cvVersions.fileUrl,
          fileName: cvVersions.fileName,
          fileSize: cvVersions.fileSize,
          mimeType: cvVersions.mimeType,
          changelog: cvVersions.changelog,
          publishedAt: cvPublications.publishedAt,
        })
        .from(cvPublications)
        .innerJoin(cvVersions, eq(cvPublications.cvVersionId, cvVersions.id))
        .where(eq(cvPublications.isCurrent, true))
        .limit(1);

      const activeRow = rows[0];
      if (activeRow) {
        const published: PublishedCv = {
          id: activeRow.pubId,
          cvVersionId: activeRow.versionId,
          versionNumber: activeRow.versionNumber,
          fileUrl: activeRow.fileUrl,
          fileName: activeRow.fileName,
          fileSize: activeRow.fileSize,
          mimeType: activeRow.mimeType,
          changelog: activeRow.changelog,
          publishedAt: activeRow.publishedAt.toISOString(),
        };

        this.cachedPublishedCv = published;
        this.cacheTimestamp = now;
        return published;
      }
    } catch (err) {
      logger.warn("Failed to load published CV from database, using baseline fallback", {
        module: "cv",
        metadata: { error: String(err) },
      });
    }

    this.cachedPublishedCv = BASELINE_PUBLISHED_CV;
    this.cacheTimestamp = now;
    return BASELINE_PUBLISHED_CV;
  }

  /**
   * List all versions ordered by version number descending for admin inspection.
   */
  async listVersions(): Promise<CvVersion[]> {
    try {
      const rows = await db.select().from(cvVersions).orderBy(desc(cvVersions.versionNumber));

      return rows.map((r) => ({
        id: r.id,
        versionNumber: r.versionNumber,
        fileUrl: r.fileUrl,
        fileName: r.fileName,
        fileSize: r.fileSize,
        mimeType: r.mimeType,
        changelog: r.changelog,
        createdBy: r.createdBy,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      logger.error("Failed to list CV versions", {
        module: "cv",
        metadata: { error: String(err) },
      });
      return [
        {
          id: BASELINE_PUBLISHED_CV.cvVersionId,
          versionNumber: BASELINE_PUBLISHED_CV.versionNumber,
          fileUrl: BASELINE_PUBLISHED_CV.fileUrl,
          fileName: BASELINE_PUBLISHED_CV.fileName,
          fileSize: BASELINE_PUBLISHED_CV.fileSize,
          mimeType: BASELINE_PUBLISHED_CV.mimeType,
          changelog: BASELINE_PUBLISHED_CV.changelog,
          createdAt: BASELINE_PUBLISHED_CV.publishedAt,
        },
      ];
    }
  }

  /**
   * Upload and register a new CV version.
   */
  async createVersion(
    fileName: string,
    fileBuffer: Buffer,
    changelog: string | undefined,
    adminUserId: string,
  ): Promise<CvVersion> {
    // 1. Validate magic bytes
    if (!validatePdfBytes(fileBuffer)) {
      throw new Error("Invalid file content: Not a valid PDF document");
    }

    // 2. Validate max file size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      throw new Error("File exceeds maximum allowed size of 10MB");
    }

    // 3. Persist file to storage
    const storageRes = await cvStorageService.savePdf(fileName, fileBuffer);

    // 4. Determine next version number
    let nextVersionNum = 1;
    try {
      const latest = await db
        .select({ versionNumber: cvVersions.versionNumber })
        .from(cvVersions)
        .orderBy(desc(cvVersions.versionNumber))
        .limit(1);

      if (latest[0]) {
        nextVersionNum = latest[0].versionNumber + 1;
      }
    } catch {
      nextVersionNum = 2;
    }

    // 5. Insert record into cvVersions
    const [newVersion] = await db
      .insert(cvVersions)
      .values({
        versionNumber: nextVersionNum,
        fileUrl: storageRes.fileUrl,
        fileName,
        fileSize: storageRes.fileSize,
        mimeType: "application/pdf",
        changelog: changelog || null,
        createdBy: adminUserId,
      })
      .returning();

    // 6. Record audit event
    try {
      await db.insert(auditEvents).values({
        userId: adminUserId,
        action: "cv_version_created",
        entityType: "cv_version",
        entityId: newVersion?.id,
        newState: {
          versionNumber: nextVersionNum,
          fileName,
          fileSize: storageRes.fileSize,
        },
      });
    } catch (auditErr) {
      logger.warn("Failed to write audit event for cv upload", {
        module: "cv",
        metadata: { error: String(auditErr) },
      });
    }

    return {
      id: newVersion ? newVersion.id : `ver-${nextVersionNum}`,
      versionNumber: nextVersionNum,
      fileUrl: storageRes.fileUrl,
      fileName,
      fileSize: storageRes.fileSize,
      mimeType: "application/pdf",
      changelog: changelog || null,
      createdBy: adminUserId,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Publish a specific CV version, making it current.
   */
  async publishVersion(versionId: string, adminUserId: string): Promise<boolean> {
    try {
      // 1. Deactivate existing current publications
      await db
        .update(cvPublications)
        .set({ isCurrent: false })
        .where(eq(cvPublications.isCurrent, true));

      // 2. Insert new current publication
      await db.insert(cvPublications).values({
        cvVersionId: versionId,
        isCurrent: true,
        publishedBy: adminUserId,
      });

      // 3. Record audit event
      await db.insert(auditEvents).values({
        userId: adminUserId,
        action: "cv_version_published",
        entityType: "cv_publication",
        entityId: versionId,
      });

      this.invalidateCache();
      return true;
    } catch (err) {
      logger.error("Failed to publish CV version", {
        module: "cv",
        metadata: { versionId, error: String(err) },
      });
      throw new Error("Failed to publish CV version");
    }
  }

  /**
   * Rollback to an older CV version.
   */
  async rollbackVersion(versionId: string, adminUserId: string): Promise<boolean> {
    return this.publishVersion(versionId, adminUserId);
  }
}

export const cvService = new CvService();
