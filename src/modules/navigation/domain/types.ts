import { z } from "zod";
import type { UserRole } from "@/modules/auth/domain/roles";

export type NavigationDestinationType = "internal" | "external" | "action";
export type NavigationPlacement = "header" | "footer" | "both";
export type AuthVisibilityRule = "all" | "guests_only" | "authenticated_only" | "admin_only";

export interface NavigationItem {
  id: string;
  destinationType: NavigationDestinationType;
  target: string;
  labelKey: string;
  iconKey?: string | undefined;
  orderIndex: number;
  isVisible: boolean;
  openInNewTab: boolean;
  authVisibility: AuthVisibilityRule;
  placement: NavigationPlacement;
  badge?: string | undefined;
}

export const navigationItemSchema = z.object({
  id: z.string().min(1),
  destinationType: z.enum(["internal", "external", "action"]),
  target: z.string().min(1),
  labelKey: z.string().min(1),
  iconKey: z.string().optional(),
  orderIndex: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  openInNewTab: z.boolean().default(false),
  authVisibility: z.enum(["all", "guests_only", "authenticated_only", "admin_only"]).default("all"),
  placement: z.enum(["header", "footer", "both"]).default("both"),
  badge: z.string().optional(),
});

export const navigationConfigSchema = z.object({
  items: z.array(navigationItemSchema),
  updatedAt: z.string().datetime().optional(),
});

export type NavigationConfig = z.infer<typeof navigationConfigSchema>;

/**
 * Filter navigation items by placement and role.
 */
export function isNavigationItemVisible(
  item: NavigationItem,
  placement: "header" | "footer",
  role?: UserRole,
): boolean {
  if (!item.isVisible) return false;

  if (item.placement !== "both" && item.placement !== placement) {
    return false;
  }

  const effectiveRole: UserRole = role || "GUEST";

  switch (item.authVisibility) {
    case "all":
      return true;
    case "guests_only":
      return effectiveRole === "GUEST";
    case "authenticated_only":
      return effectiveRole === "USER" || effectiveRole === "ADMIN";
    case "admin_only":
      return effectiveRole === "ADMIN";
    default:
      return true;
  }
}
