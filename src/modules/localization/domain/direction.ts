export type Direction = "rtl" | "ltr" | "auto";

/**
 * Directional icons that represent forward/backward progression,
 * sequential navigation, or asymmetric orientation.
 * MUST mirror horizontally in RTL layouts per docs/frontend/02_BILINGUAL_RTL_LTR.md.
 */
export const DIRECTIONAL_ICONS = [
  "arrow-left",
  "arrow-right",
  "chevron-left",
  "chevron-right",
  "chevron-start",
  "chevron-end",
  "arrow-start",
  "arrow-end",
  "back",
  "forward",
  "undo",
  "redo",
  "reply",
  "navigate-next",
  "navigate-before",
] as const;

export type DirectionalIconName = (typeof DIRECTIONAL_ICONS)[number];

/**
 * Universal icons that must NEVER mirror in RTL.
 * Includes media controls (play/pause), search, external links, branding logos, etc.
 */
export const UNIVERSAL_NON_DIRECTIONAL_ICONS = [
  "external-link",
  "play",
  "pause",
  "stop",
  "search",
  "settings",
  "check",
  "close",
  "copy",
  "eye",
  "download",
  "github",
  "linkedin",
  "twitter",
  "refresh",
  "star",
  "heart",
  "user",
  "lock",
  "calendar",
  "clock",
  "filter",
  "share",
  "file",
  "code",
] as const;

/**
 * Determines whether an icon should mirror in RTL direction.
 */
export function isDirectionalIcon(iconName: string): boolean {
  const normalized = iconName.toLowerCase().trim();
  return (
    DIRECTIONAL_ICONS.includes(normalized as DirectionalIconName) ||
    normalized.includes("arrow-left") ||
    normalized.includes("arrow-right") ||
    normalized.includes("chevron-left") ||
    normalized.includes("chevron-right") ||
    normalized.includes("back") ||
    normalized.includes("forward")
  );
}

/**
 * Returns the appropriate Tailwind mirroring utility class for an icon.
 */
export function getIconDirectionClass(iconName: string): string {
  if (isDirectionalIcon(iconName)) {
    return "rtl:-scale-x-100 transform-gpu";
  }
  return "";
}

/**
 * Detects the script direction of dynamic text based on Arabic Unicode character block frequency.
 * Used for mixed content (chat messages, user input, citations, pasted job descriptions).
 */
export function detectScriptDirection(text: string): "rtl" | "ltr" {
  if (!text || text.trim().length === 0) {
    return "ltr";
  }

  // Arabic, Arabic Supplement, Arabic Extended-A, Arabic Presentation Forms A & B
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const latinRegex = /[a-zA-Z]/g;

  const arabicMatches = text.match(arabicRegex);
  const latinMatches = text.match(latinRegex);

  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  const latinCount = latinMatches ? latinMatches.length : 0;

  if (arabicCount > latinCount) {
    return "rtl";
  }

  return "ltr";
}
