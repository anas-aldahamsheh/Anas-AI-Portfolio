import type { SocialProfile } from "./types";

export const BASELINE_GITHUB_PROFILE: SocialProfile = {
  id: "social-github-default",
  platform: "github",
  url: "https://github.com/anas-ai-engineer",
  handle: "anas-ai-engineer",
  iconName: "github",
  displayName: "GitHub",
  description: "Open-source software, agentic systems & AI engineering",
  orderIndex: 1,
  isVisible: true,
};

export const BASELINE_LINKEDIN_PROFILE: SocialProfile = {
  id: "social-linkedin-default",
  platform: "linkedin",
  url: "https://linkedin.com/in/anas-ai-engineer",
  handle: "anas-ai-engineer",
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
