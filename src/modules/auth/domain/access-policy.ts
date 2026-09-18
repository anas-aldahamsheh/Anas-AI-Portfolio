import { isAdmin, type Role } from "./roles";

/**
 * All public capabilities that must be available to guests without authentication.
 * Defined strictly according to docs/features/01_GUEST_ACCESS.md and MASTER_BUILD_SPEC.md.
 */
export const PUBLIC_FEATURES = [
  "PAGES",
  "PROJECTS",
  "DEEP_DIVES",
  "CV_VIEW",
  "CV_DOWNLOAD",
  "AI_CHAT",
  "CONVERSATION_MODE",
  "PROJECT_SCOPED_AI",
  "JOB_FIT_ANALYZER",
  "AI_LAB_DEMOS",
  "EVALUATION_DASHBOARD",
  "SOCIAL_ACTIONS",
] as const;

export type PublicFeature = (typeof PUBLIC_FEATURES)[number];

/**
 * Features restricted exclusively to administrators.
 */
export const ADMIN_ONLY_FEATURES = [
  "ADMIN_DASHBOARD",
  "ADMIN_CONTENT_MUTATION",
  "ADMIN_LOCALIZATION",
  "ADMIN_CV_MUTATION",
  "ADMIN_PROJECT_MUTATION",
  "ADMIN_KNOWLEDGE_SYNC",
  "ADMIN_SOCIAL_MUTATION",
  "ADMIN_INBOX",
  "ADMIN_AUDIT_LOGS",
  "ADMIN_CONFIG",
] as const;

export type AdminOnlyFeature = (typeof ADMIN_ONLY_FEATURES)[number];

export type Feature = PublicFeature | AdminOnlyFeature;

/**
 * Verifies if a given feature is part of the guest-first public capabilities.
 */
export function isPublicFeature(feature: string): feature is PublicFeature {
  return PUBLIC_FEATURES.includes(feature as PublicFeature);
}

/**
 * Checks whether a given role can access a feature.
 * Invariant: Every public feature must return true for GUEST, USER, and ADMIN.
 */
export function canAccessFeature(role: Role | null | undefined, feature: Feature): boolean {
  if (isPublicFeature(feature)) {
    return true;
  }

  if (ADMIN_ONLY_FEATURES.includes(feature as AdminOnlyFeature)) {
    return isAdmin(role);
  }

  return false;
}

/**
 * Invariant guard asserting that a feature is public.
 * Throws an error if core portfolio functionality is mistakenly gated.
 */
export function assertPublicFeature(feature: Feature): asserts feature is PublicFeature {
  if (!isPublicFeature(feature)) {
    throw new Error(
      `Access policy violation: Feature '${feature}' is restricted and not accessible to guests.`,
    );
  }
}
