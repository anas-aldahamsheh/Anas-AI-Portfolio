import type { Locale } from "@/i18n/config";
import type { MessageKey } from "@/i18n/messages";
import type { PageContext } from "./store";

type PageKind =
  "home" | "project" | "projects" | "experience" | "cv" | "certificates" | "contact" | "other";

function kindOf(path: string, locale: Locale): PageKind {
  const rest = path.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
  if (rest === "/") return "home";
  if (/^\/projects\/[^/]+/.test(rest)) return "project";
  for (const kind of ["projects", "experience", "cv", "certificates", "contact"] as const) {
    if (rest === `/${kind}` || rest.startsWith(`/${kind}/`)) return kind;
  }
  return "other";
}

/** The page's own name: the part of <title> before the site name ("Project X | Anas …"). */
function pageTitle(): string | undefined {
  const title = document.title.split(" | ")[0]?.replace(/\s+/g, " ").trim();
  return title ? title.slice(0, 140) : undefined;
}

/**
 * What the assistant is told about where the visitor is (read when they ask, not on render).
 * Nothing on the chat pages themselves: the page adds no information there.
 */
export function readPageContext(): PageContext | undefined {
  const path = window.location.pathname.slice(0, 200);
  if (/\/(chat|job-fit)(\/|$)/.test(path)) return undefined;
  const title = pageTitle();
  return { path, ...(title ? { title } : {}) };
}

const CONTEXT_PROMPTS: Partial<Record<PageKind, MessageKey[]>> = {
  project: ["chat.ctx.project", "chat.ctx.project2"],
  projects: ["chat.ctx.projects"],
  experience: ["chat.ctx.experience"],
  cv: ["chat.ctx.cv"],
  certificates: ["chat.ctx.certificates"],
  contact: ["chat.ctx.contact"],
};

/** Questions about the page the visitor is on ("Explain this project", …), if any. */
export function contextPrompts(
  path: string,
  locale: Locale,
  t: (key: MessageKey) => string,
): string[] {
  const keys = CONTEXT_PROMPTS[kindOf(path, locale)] ?? [];
  const title = typeof document === "undefined" ? undefined : pageTitle();
  return keys
    .map((key) => t(key))
    .filter((text) => !text.includes("{title}") || Boolean(title))
    .map((text) => text.replace("{title}", title ?? ""));
}
