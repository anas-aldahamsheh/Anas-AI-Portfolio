/**
 * Centralized Single Source of Truth for Developer Identity & Contact Channels.
 * Guarantees that all social profiles, handles, phone numbers, and emails across
 * the navbar, popovers, footer, contact page, and CV remain strictly interconnected and unified.
 */

export const DEVELOPER_PROFILE = {
  fullName: {
    en: "Anas Al Dahamsheh",
    ar: "أنس الدحامشة",
  },
  headline: {
    en: "AI & Full-Stack Software Engineer",
    ar: "مهندس ذكاء اصطناعي وبرمجيات",
  },
  phone: {
    display: "+962 789 495 167",
    href: "tel:+962789495167",
    raw: "+962789495167",
  },
  email: {
    address: "anashusam268@gmail.com",
    href: "mailto:anashusam268@gmail.com",
  },
  github: {
    handle: "anas-aldahamsheh",
    url: "https://github.com/anas-aldahamsheh",
    display: "github.com/anas-aldahamsheh",
  },
  linkedin: {
    handle: "anas-aldahamsheh",
    url: "https://www.linkedin.com/in/anas-aldahamsheh",
    display: "linkedin.com/in/anas-aldahamsheh",
  },
} as const;

export type DeveloperProfile = typeof DEVELOPER_PROFILE;
