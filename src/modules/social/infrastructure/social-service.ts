import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { socialProfiles, socialProfileTranslations } from "@/lib/db/schema/social";
import { auditEvents } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import {
  type SocialProfile,
  type SocialPlatform,
  type SocialProfileUpdateInput,
  BASELINE_GITHUB_PROFILE,
  BASELINE_LINKEDIN_PROFILE,
  BASELINE_SOCIAL_PROFILES,
} from "../domain/types";
export { BASELINE_GITHUB_PROFILE, BASELINE_LINKEDIN_PROFILE, BASELINE_SOCIAL_PROFILES };

export class SocialService {
  private cache: Map<string, SocialProfile[]> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_TTL_MS = 60 * 1000;

  public invalidateCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Retrieves a single social profile by platform identifier.
   */
  async getProfile(platform: SocialPlatform, locale = "en"): Promise<SocialProfile> {
    const all = await this.listProfiles(locale);
    const found = all.find((p) => p.platform === platform && p.isVisible);
    if (found) return found;

    if (platform === "github") {
      return BASELINE_GITHUB_PROFILE;
    }
    if (platform === "linkedin") {
      return BASELINE_LINKEDIN_PROFILE;
    }

    return {
      id: `social-${platform}-default`,
      platform,
      url: `https://${platform}.com`,
      handle: `${platform}-user`,
      iconName: platform,
      displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
      orderIndex: 99,
      isVisible: true,
    };
  }

  /**
   * Lists all active social profiles.
   */
  async listProfiles(locale = "en"): Promise<SocialProfile[]> {
    const now = Date.now();
    const cached = this.cache.get(locale);
    const timestamp = this.cacheTimestamps.get(locale) ?? 0;

    if (cached && now - timestamp < this.CACHE_TTL_MS) {
      return cached;
    }

    try {
      const rows = await db
        .select({
          id: socialProfiles.id,
          platform: socialProfiles.platform,
          url: socialProfiles.url,
          handle: socialProfiles.handle,
          iconName: socialProfiles.iconName,
          orderIndex: socialProfiles.orderIndex,
          isVisible: socialProfiles.isVisible,
          transDisplayName: socialProfileTranslations.displayName,
          transDescription: socialProfileTranslations.description,
        })
        .from(socialProfiles)
        .leftJoin(
          socialProfileTranslations,
          and(
            eq(socialProfileTranslations.socialProfileId, socialProfiles.id),
            eq(socialProfileTranslations.localeCode, locale),
          ),
        )
        .where(eq(socialProfiles.isVisible, true))
        .orderBy(asc(socialProfiles.orderIndex));

      if (rows.length > 0) {
        const result: SocialProfile[] = rows.map((r) => ({
          id: r.id,
          platform: r.platform as SocialPlatform,
          url: r.url,
          handle: r.handle || "",
          iconName: r.iconName || r.platform,
          displayName: r.transDisplayName || r.platform,
          description: r.transDescription,
          orderIndex: r.orderIndex,
          isVisible: r.isVisible,
        }));

        this.cache.set(locale, result);
        this.cacheTimestamps.set(locale, now);
        return result;
      }
    } catch (err) {
      logger.warn("Failed to query social profiles from database, using baseline fallback", {
        module: "social",
        metadata: { error: String(err) },
      });
    }

    const baseline = [...BASELINE_SOCIAL_PROFILES];
    this.cache.set(locale, baseline);
    this.cacheTimestamps.set(locale, now);
    return baseline;
  }

  /**
   * Updates an existing social profile or creates it if absent.
   */
  async updateProfile(
    platform: SocialPlatform,
    input: SocialProfileUpdateInput,
    adminUserId: string,
    locale = "en",
  ): Promise<SocialProfile> {
    try {
      const existing = await db
        .select()
        .from(socialProfiles)
        .where(eq(socialProfiles.platform, platform))
        .limit(1);

      let profileId: string;

      if (existing.length > 0 && existing[0]) {
        profileId = existing[0].id;
        await db
          .update(socialProfiles)
          .set({
            url: input.url,
            handle: input.handle,
            isVisible: input.isVisible,
            orderIndex: input.orderIndex ?? existing[0].orderIndex,
            updatedAt: new Date(),
          })
          .where(eq(socialProfiles.id, profileId));
      } else {
        const [created] = await db
          .insert(socialProfiles)
          .values({
            platform,
            url: input.url,
            handle: input.handle,
            iconName: platform,
            orderIndex: input.orderIndex ?? 1,
            isVisible: input.isVisible,
          })
          .returning();
        profileId = created ? created.id : `social-${platform}-1`;
      }

      // Upsert translations
      const existingTrans = await db
        .select()
        .from(socialProfileTranslations)
        .where(
          and(
            eq(socialProfileTranslations.socialProfileId, profileId),
            eq(socialProfileTranslations.localeCode, locale),
          ),
        )
        .limit(1);

      if (existingTrans.length > 0) {
        await db
          .update(socialProfileTranslations)
          .set({
            displayName: input.displayName,
            description: input.description ?? null,
          })
          .where(
            and(
              eq(socialProfileTranslations.socialProfileId, profileId),
              eq(socialProfileTranslations.localeCode, locale),
            ),
          );
      } else {
        await db.insert(socialProfileTranslations).values({
          socialProfileId: profileId,
          localeCode: locale,
          displayName: input.displayName,
          description: input.description ?? null,
        });
      }

      // Write audit event
      try {
        await db.insert(auditEvents).values({
          userId: adminUserId,
          action: "social_profile_updated",
          entityType: "social_profile",
          entityId: profileId,
          newState: input,
        });
      } catch (auditErr) {
        logger.warn("Failed to write audit event for social profile update", {
          module: "social",
          metadata: { error: String(auditErr) },
        });
      }

      this.invalidateCache();

      return {
        id: profileId,
        platform,
        url: input.url,
        handle: input.handle,
        iconName: platform,
        displayName: input.displayName,
        description: input.description,
        orderIndex: input.orderIndex ?? 1,
        isVisible: input.isVisible,
      };
    } catch (err) {
      logger.error("Failed to update social profile", {
        module: "social",
        metadata: { platform, error: String(err) },
      });
      throw new Error("Failed to persist social profile update");
    }
  }
}

export const socialService = new SocialService();
