import { db } from "@/lib/db/client";
import { featureFlags, auditEvents } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import type {
  FeatureFlag,
  FeatureFlagCategory,
  UpdateFeatureFlagInput,
} from "../domain/feature-flags";
import { BASELINE_FEATURE_FLAGS } from "./baseline-feature-flags";

async function withTimeout<T>(promise: Promise<T>, ms = 300): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function computeSimpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export class FeatureFlagService {
  private cache: Map<string, FeatureFlag> = new Map();
  private overrides: Map<string, Partial<FeatureFlag>> = new Map();
  private lastFetch = 0;
  private readonly TTL_MS = 60 * 1000;

  public invalidateCache(): void {
    this.cache.clear();
    this.lastFetch = 0;
  }

  /**
   * Retrieves all feature flags with TTL caching and baseline fallback.
   */
  async listFlags(): Promise<FeatureFlag[]> {
    const now = Date.now();
    if (this.cache.size > 0 && now - this.lastFetch < this.TTL_MS) {
      return Array.from(this.cache.values());
    }

    try {
      const rows = await withTimeout(
        db.select().from(featureFlags),
        300,
      );

      const dbMap = new Map(rows.map((r) => [r.key, r]));

      const flags: FeatureFlag[] = BASELINE_FEATURE_FLAGS.map((base) => {
        const row = dbMap.get(base.key);
        const override = this.overrides.get(base.key);
        const isEnabled = override?.isEnabled !== undefined ? override.isEnabled : (row ? row.isEnabled : base.isEnabled);
        const description = override?.description ?? row?.description ?? base.description;
        const targetRolloutPercentage = override?.targetRolloutPercentage ?? base.targetRolloutPercentage ?? 100;

        return {
          key: base.key,
          isEnabled,
          description,
          category: base.category,
          targetRolloutPercentage,
          updatedAt: row ? row.updatedAt.toISOString() : new Date().toISOString(),
        };
      });

      this.cache.clear();
      for (const flag of flags) {
        this.cache.set(flag.key, flag);
      }
      this.lastFetch = now;

      return flags;
    } catch {
      // Fallback to baselines overlaid with in-memory overrides
      return BASELINE_FEATURE_FLAGS.map((base) => {
        const override = this.overrides.get(base.key);
        if (!override) return base;
        return {
          ...base,
          ...override,
          updatedAt: new Date().toISOString(),
        };
      });
    }
  }

  /**
   * Retrieves a single feature flag by key.
   */
  async getFlag(key: string): Promise<FeatureFlag | null> {
    const flags = await this.listFlags();
    return flags.find((f) => f.key === key) || null;
  }

  /**
   * Evaluates whether a feature flag is active for a given execution context.
   * Supports deterministic canary percentage rollout.
   */
  async isEnabled(
    key: string,
    context?: { userId?: string | undefined; clientIp?: string | undefined },
  ): Promise<boolean> {
    const flag = await this.getFlag(key);
    if (!flag) return false;
    if (!flag.isEnabled) return false;

    const rollout = flag.targetRolloutPercentage ?? 100;
    if (rollout >= 100) return true;
    if (rollout <= 0) return false;

    // Deterministic hash based on identifier
    const identifier = context?.userId || context?.clientIp || "anonymous";
    const bucket = computeSimpleHash(`${key}:${identifier}`) % 100;
    return bucket < rollout;
  }

  /**
   * Updates or toggles a feature flag in the authoritative database.
   */
  async updateFlag(
    key: string,
    input: UpdateFeatureFlagInput,
    adminUserId: string,
  ): Promise<FeatureFlag> {
    const flags = await this.listFlags();
    const existing = flags.find((f) => f.key === key);
    const category: FeatureFlagCategory = existing?.category || "experimental";
    const description = input.description || existing?.description || `Feature flag ${key}`;

    try {
      await withTimeout(
        db
          .insert(featureFlags)
          .values({
            key,
            isEnabled: input.isEnabled,
            description,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: featureFlags.key,
            set: {
              isEnabled: input.isEnabled,
              description,
              updatedAt: new Date(),
            },
          }),
        300,
      );

      // Log immutable audit event
      await withTimeout(
        db.insert(auditEvents).values({
          action: "feature_flag_change",
          entityType: "feature_flag",
          entityId: key,
          userId: adminUserId,
          previousState: existing ? { isEnabled: existing.isEnabled } : null,
          newState: {
            isEnabled: input.isEnabled,
            targetRolloutPercentage: input.targetRolloutPercentage ?? 100,
          },
        }),
        300,
      ).catch(() => {});
    } catch (err) {
      logger.warn("Failed to persist feature flag update to DB", {
        metadata: { key, error: String(err) },
      });
    }

    this.overrides.set(key, {
      isEnabled: input.isEnabled,
      description,
      targetRolloutPercentage: input.targetRolloutPercentage ?? existing?.targetRolloutPercentage ?? 100,
    });

    this.invalidateCache();

    return {
      key,
      isEnabled: input.isEnabled,
      description,
      category,
      targetRolloutPercentage: input.targetRolloutPercentage ?? existing?.targetRolloutPercentage ?? 100,
      updatedAt: new Date().toISOString(),
    };
  }

  public resetInMemoryOverrides(): void {
    this.overrides.clear();
    this.invalidateCache();
  }

  /**
   * Resets all feature flags to verified production defaults.
   */
  async resetToDefaults(adminUserId: string): Promise<void> {
    this.overrides.clear();
    this.invalidateCache();

    try {
      await withTimeout(
        db.delete(featureFlags),
        300,
      );

      await withTimeout(
        db.insert(auditEvents).values({
          action: "feature_flag_reset",
          entityType: "feature_flag",
          entityId: "all",
          userId: adminUserId,
          previousState: null,
          newState: { status: "reset_to_baseline" },
        }),
        300,
      ).catch(() => {});
    } catch {
      // Offline fallback
    }
  }
}

export const featureFlagService = new FeatureFlagService();
