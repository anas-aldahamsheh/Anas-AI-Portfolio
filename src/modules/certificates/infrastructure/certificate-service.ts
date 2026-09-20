import { db } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { auditEvents, systemSettings } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import {
  CertificateItem,
  CertificatesConfig,
  certificatesConfigSchema,
  DEFAULT_CERTIFICATES,
} from "../domain/types";

export class CertificateService {
  private cachedCertificates: CertificateItem[] | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 60_000; // 1 minute in-memory cache

  private async queryWithTimeout<T>(promise: Promise<T>, timeoutMs = 300): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Database operation timed out after ${timeoutMs}ms`)), timeoutMs),
      ),
    ]);
  }

  /**
   * Retrieves all certificates & courses, ordered by orderIndex ascending.
   */
  async getCertificates(): Promise<CertificateItem[]> {
    const now = Date.now();
    if (this.cachedCertificates && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedCertificates;
    }

    try {
      const rows = await this.queryWithTimeout(
        db
          .select({ value: systemSettings.value })
          .from(systemSettings)
          .where(eq(systemSettings.key, "certificates_courses"))
          .limit(1),
      );

      if (rows.length > 0 && rows[0]?.value) {
        const parsed = certificatesConfigSchema.safeParse(rows[0].value);
        if (parsed.success && parsed.data.certificates.length > 0) {
          const sorted = [...parsed.data.certificates].sort((a, b) => a.orderIndex - b.orderIndex);
          this.cachedCertificates = sorted;
          this.lastFetchTime = now;
          return sorted;
        }
      }
    } catch (err) {
      logger.warn("Failed to load certificates from database, using defaults", {
        module: "certificates",
        metadata: { error: String(err) },
      });
    }

    const defaultSorted = [...DEFAULT_CERTIFICATES].sort((a, b) => a.orderIndex - b.orderIndex);
    this.cachedCertificates = defaultSorted;
    this.lastFetchTime = now;
    return defaultSorted;
  }

  /**
   * Saves the entire certificates collection authoritatively.
   */
  async updateCertificates(
    certificates: CertificateItem[],
    adminUserId?: string,
  ): Promise<CertificateItem[]> {
    const sorted = [...certificates].sort((a, b) => a.orderIndex - b.orderIndex);
    const config: CertificatesConfig = {
      certificates: sorted,
      updatedAt: new Date().toISOString(),
    };

    const validated = certificatesConfigSchema.parse(config);
    this.cachedCertificates = validated.certificates;
    this.lastFetchTime = Date.now();

    try {
      await this.queryWithTimeout(
        db
          .insert(systemSettings)
          .values({
            key: "certificates_courses",
            value: validated,
            description: "Courses and verified professional certifications catalog",
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: systemSettings.key,
            set: {
              value: validated,
              updatedAt: new Date(),
            },
          }),
      );
    } catch (err) {
      logger.warn("Failed to persist certificates to database, retained in memory", {
        module: "certificates",
        metadata: { error: String(err) },
      });
    }

    if (adminUserId) {
      try {
        await db.insert(auditEvents).values({
          userId: adminUserId,
          action: "certificates_updated",
          entityType: "certificates",
          entityId: "certificates_courses",
          newState: {
            certificatesCount: validated.certificates.length,
            updatedAt: validated.updatedAt,
          },
        });
      } catch (auditErr) {
        logger.warn("Failed to record certificates audit event", {
          module: "certificates",
          metadata: { error: String(auditErr) },
        });
      }
    }

    return validated.certificates;
  }

  /**
   * Adds or updates a single certificate.
   */
  async saveCertificate(certificate: CertificateItem, adminUserId?: string): Promise<CertificateItem[]> {
    const current = await this.getCertificates();
    const existingIndex = current.findIndex((c) => c.id === certificate.id);
    let updated: CertificateItem[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = certificate;
    } else {
      updated = [...current, certificate];
    }

    return this.updateCertificates(updated, adminUserId);
  }

  /**
   * Deletes a certificate by id.
   */
  async deleteCertificate(certificateId: string, adminUserId?: string): Promise<CertificateItem[]> {
    const current = await this.getCertificates();
    const filtered = current.filter((c) => c.id !== certificateId);
    return this.updateCertificates(filtered, adminUserId);
  }
}

export const certificateService = new CertificateService();
