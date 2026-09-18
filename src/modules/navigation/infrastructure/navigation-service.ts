import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { systemSettings } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import type { UserRole } from "@/modules/auth/domain/roles";
import {
  type NavigationItem,
  navigationConfigSchema,
  isNavigationItemVisible,
} from "../domain/types";
import { DEFAULT_NAVIGATION_ITEMS } from "./default-navigation";

interface CacheEntry {
  items: NavigationItem[];
  cachedAt: number;
}

const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache
const DB_TIMEOUT_MS = 300; // 300ms bounded timeout for resilience

class NavigationService {
  private cache: CacheEntry | null = null;

  /**
   * Helper to bound database query latency
   */
  private async queryWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

  /**
   * Clears the in-memory cache
   */
  public invalidateCache(): void {
    this.cache = null;
  }

  /**
   * Retrieves all navigation items from database or cache, falling back to defaults.
   */
  public async getAllItems(): Promise<NavigationItem[]> {
    const now = Date.now();
    if (this.cache && now - this.cache.cachedAt < CACHE_TTL_MS) {
      return this.cache.items;
    }

    try {
      const query = db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, "navigation_config"))
        .limit(1);

      const rows = await this.queryWithTimeout(query, DB_TIMEOUT_MS);

      if (rows.length > 0 && rows[0]?.value) {
        const parsed = navigationConfigSchema.safeParse(rows[0].value);
        if (parsed.success && parsed.data.items.length > 0) {
          const items = parsed.data.items as NavigationItem[];
          this.cache = {
            items,
            cachedAt: now,
          };
          return items;
        }
      }
    } catch (error) {
      logger.warn("Failed to load dynamic navigation from database, using defaults", {
        metadata: { error: String(error) },
      });
    }

    this.cache = {
      items: DEFAULT_NAVIGATION_ITEMS,
      cachedAt: now,
    };
    return DEFAULT_NAVIGATION_ITEMS;
  }

  /**
   * Retrieves filtered and sorted navigation items for a specific placement and user role.
   */
  public async getNavigationItems(
    placement: "header" | "footer",
    role?: UserRole,
  ): Promise<NavigationItem[]> {
    const allItems = await this.getAllItems();

    return allItems
      .filter((item) => isNavigationItemVisible(item, placement, role))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  /**
   * Updates navigation items configuration (Admin action).
   */
  public async updateNavigationItems(items: NavigationItem[]): Promise<NavigationItem[]> {
    const validated = navigationConfigSchema.parse({
      items,
      updatedAt: new Date().toISOString(),
    });

    await db
      .insert(systemSettings)
      .values({
        key: "navigation_config",
        value: validated,
        description: "Dynamic site navigation structure",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: validated,
          updatedAt: new Date(),
        },
      });

    this.invalidateCache();
    logger.info("Dynamic navigation items updated successfully", {
      metadata: { itemCount: items.length },
    });

    return items;
  }
}

export const navigationService = new NavigationService();
