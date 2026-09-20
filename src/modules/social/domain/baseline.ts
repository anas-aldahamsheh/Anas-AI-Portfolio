import { DEVELOPER_PROFILE } from "@/lib/config/developer-profile";
import type { SocialProfile } from "./types";

export const BASELINE_GITHUB_PROFILE: SocialProfile = {
  id: "social-github-default",
  platform: "github",
  url: DEVELOPER_PROFILE.github.url,
  handle: DEVELOPER_PROFILE.github.handle,
  iconName: "github",
  displayName: "GitHub",
  description: "Open-source software, agentic systems & AI engineering",
  orderIndex: 1,
  isVisible: true,
};

export const BASELINE_LINKEDIN_PROFILE: SocialProfile = {
  id: "social-linkedin-default",
  platform: "linkedin",
  url: DEVELOPER_PROFILE.linkedin.url,
  handle: DEVELOPER_PROFILE.linkedin.handle,
  iconName: "linkedin",
  displayName: "LinkedIn",
  description: "Connect on LinkedIn for AI leadership & engineering collaborations",
  orderIndex: 2,
  isVisible: true,
};

export const BASELINE_SOCIAL_PROFILES: SocialProfile[] = [
  BASELINE_GITHUB_PROFILE,
  BASELINE_LINKEDIN_PROFILE,
];

