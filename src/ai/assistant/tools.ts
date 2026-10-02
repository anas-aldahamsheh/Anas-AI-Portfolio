import type { GeminiFunctionDeclaration } from "@/ai/gemini/types";
import { hybridSearch } from "@/ai/knowledge/retriever";
import { KNOWLEDGE_KINDS, type KnowledgeKind } from "@/ai/knowledge/config";
import type { Entry, Locale } from "@/server/content/collections";
import { listPublishedFresh } from "@/server/content/repository";
import { entryUrl, formatPeriod } from "@/server/content/knowledge-sources";
import type { SourceRegistry } from "./sources";

export interface ToolContext {
  locale: Locale;
  registry: SourceRegistry;
  rerank: boolean;
  signal?: AbortSignal;
}

type ToolResult = Record<string, unknown>;

interface ToolDefinition {
  declaration: GeminiFunctionDeclaration;
  /** Short progress label shown to the visitor while the tool runs. */
  label: { en: string; ar: string };
  run: (args: Record<string, unknown>, ctx: ToolContext) => Promise<ToolResult>;
}

const str = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const lower = (value: string) => value.toLowerCase();

async function profileOf(locale: Locale): Promise<Entry<"profile"> | null> {
  const [profile] = await listPublishedFresh("profile", locale);
  return profile ?? null;
}

function cite(
  ctx: ToolContext,
  key: string,
  title: string,
  kind: string,
  url: string | null,
): number {
  return ctx.registry.register(key, { title, kind, url });
}

// ---------------------------------------------------------------------------------------------

const searchKnowledge: ToolDefinition = {
  label: { en: "Searching his knowledge base", ar: "بدوّر بالمعلومات" },
  declaration: {
    name: "search_knowledge",
    description:
      "Hybrid semantic + keyword search over EVERYTHING known about Anas: CV text, projects, experience, " +
      "education, certificates, skills, uploaded documents and private notes. Use for open questions, " +
      "specific details, or anything not covered by the structured tools. Works across Arabic and English. " +
      "Write the query as a focused description of the facts you need (you may call it several times with different queries).",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to look for, in any language." },
        kinds: {
          type: "array",
          description: "Optional filter by source type.",
          items: { type: "string", enum: [...KNOWLEDGE_KINDS] },
        },
      },
      required: ["query"],
    },
  },
  async run(args, ctx) {
    const query = str(args["query"], 400);
    if (!query) return { error: "query is required" };
    const kinds = Array.isArray(args["kinds"])
      ? (args["kinds"] as unknown[]).filter((k): k is KnowledgeKind =>
          (KNOWLEDGE_KINDS as readonly string[]).includes(String(k)),
        )
      : [];
    const hits = await hybridSearch({
      query,
      ...(kinds.length ? { kinds } : {}),
      preferLocale: ctx.locale,
      limit: 8,
      rerank: ctx.rerank,
      ...(ctx.signal ? { signal: ctx.signal } : {}),
    });
    if (hits.length === 0) return { results: [], note: "Nothing relevant found for this query." };
    return {
      results: hits.map((hit) => ({
        ref: cite(
          ctx,
          hit.entryId ?? hit.sourceKey,
          hit.title,
          hit.kind,
          hit.kind === "note" ? null : hit.url,
        ),
        kind: hit.kind,
        source: hit.title,
        section: hit.heading,
        text: hit.text,
        page: hit.kind === "note" ? null : hit.url,
      })),
    };
  },
};

const getProfile: ToolDefinition = {
  label: { en: "Reading his profile", ar: "بقرأ ملفه الشخصي" },
  declaration: {
    name: "get_profile",
    description:
      "Anas's profile: name, headline, summary, about, location, availability, and contact details " +
      "(email, phone if public, LinkedIn, GitHub, website) plus the CV download link.",
  },
  async run(_args, ctx) {
    const profile = await profileOf(ctx.locale);
    if (!profile) return { error: "Profile not set up yet." };
    const { t, data } = profile;
    return {
      ref: cite(ctx, profile.id, t.name, "profile", `/${ctx.locale}/cv`),
      name: t.name,
      headline: t.headline,
      roles: t.roles,
      tagline: t.tagline,
      summary: t.summary,
      about: t.about,
      location: t.location,
      openToWork: data.openToWork,
      availability: t.availability,
      contact: {
        email: data.email || null,
        phone: data.showPhone && data.phone ? data.phone : null,
        linkedin: data.linkedin || null,
        github: data.github || null,
        website: data.website || null,
        contactPage: `/${ctx.locale}/contact`,
      },
      cv: data.cv ? { download: "/api/cv", page: `/${ctx.locale}/cv` } : null,
    };
  },
};

const listProjects: ToolDefinition = {
  label: { en: "Looking through his projects", ar: "بستعرض مشاريعه" },
  declaration: {
    name: "list_projects",
    description:
      "All of Anas's projects (the complete list) with one-line summaries, technologies and links. Use it for any " +
      "general question about his projects or work. Optionally filter by a " +
      "technology or keyword (matches title, summary and tags).",
    parameters: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Optional technology or keyword, e.g. 'RAG' or 'Python'.",
        },
      },
    },
  },
  async run(args, ctx) {
    const filter = lower(str(args["filter"], 80));
    const projects = await listPublishedFresh("project", ctx.locale);
    const matches = projects.filter((p) => {
      if (!filter) return true;
      const haystack = lower([p.t.title, p.t.summary, p.data.category, ...p.data.tags].join(" "));
      return haystack.includes(filter);
    });
    const shown = matches.length || !filter ? matches : projects;
    return {
      total: projects.length,
      ...(shown.length === projects.length
        ? { note: `These are all ${projects.length} projects; mention every one of them.` }
        : {}),
      projects: shown.map((p) => ({
        ref: cite(ctx, p.id, p.t.title, "project", entryUrl("project", p.slug, ctx.locale)),
        slug: p.slug,
        title: p.t.title,
        summary: p.t.summary,
        technologies: p.data.tags,
        featured: p.data.featured,
        period: formatPeriod(ctx.locale, p.data.startDate, p.data.endDate),
        page: entryUrl("project", p.slug, ctx.locale),
        demo: p.data.demoUrl || null,
        repository: p.data.repoUrl || (p.data.repoPrivate ? "private (not public)" : null),
      })),
      ...(filter && matches.length === 0
        ? { filterNote: `No project mentions "${filter}"; showing all.` }
        : {}),
    };
  },
};

/** Letters and digits only, so "Abu Jbara", "abu_jbara" and "abu-jbara" compare equal. */
const compact = (value: string) => lower(value).replace(/[^\p{L}\p{N}]+/gu, "");

function editDistance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(
        row[j]! + 1,
        next[j - 1]! + 1,
        row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    row = next;
  }
  return row[b.length]!;
}

/**
 * Resolves the model's project reference: the exact slug, then the slug or title written another
 * way, then a near-miss spelling of the slug (models often transliterate names differently).
 */
export function findProject<T extends { slug: string; t: { title: string } }>(
  projects: T[],
  query: string,
): T | undefined {
  const key = compact(query);
  if (!key) return undefined;
  const exact =
    projects.find((p) => p.slug === query) ??
    projects.find((p) => compact(p.slug) === key || compact(p.t.title) === key) ??
    projects.find((p) => compact(p.t.title).includes(key) || key.includes(compact(p.slug)));
  if (exact) return exact;
  const ranked = projects
    .map((p) => ({ p, d: editDistance(key, compact(p.slug)) }))
    .sort((a, b) => a.d - b.d);
  const [best, second] = ranked;
  if (!best || best.d > Math.max(1, Math.floor(key.length / 4))) return undefined;
  return second && second.d === best.d ? undefined : best.p;
}

const getProject: ToolDefinition = {
  label: { en: "Opening the project case study", ar: "بفتح تفاصيل المشروع" },
  declaration: {
    name: "get_project",
    description:
      "Full case study of one project (problem, role, solution, architecture, decisions, results, key " +
      "numbers) and what its screenshots and recorded runs show.",
    parameters: {
      type: "object",
      properties: { slug: { type: "string", description: "Project slug from list_projects." } },
      required: ["slug"],
    },
  },
  async run(args, ctx) {
    const slug = str(args["slug"], 200);
    const projects = await listPublishedFresh("project", ctx.locale);
    const project = findProject(projects, slug);
    if (!project) return { error: `No project "${slug}". Call list_projects to see valid slugs.` };
    const { t, data } = project;
    return {
      ref: cite(ctx, project.id, t.title, "project", entryUrl("project", project.slug, ctx.locale)),
      title: t.title,
      summary: t.summary,
      role: t.role,
      problem: t.problem,
      solution: t.solution,
      architecture: t.architecture,
      challenges: t.challenges,
      decisions: t.decisions,
      results: t.results,
      keyNumbers: t.metrics.map((line) => line.replace(/\s*\|\s*/, " — ")),
      highlights: t.highlights,
      technologies: data.tags,
      category: data.category,
      period: formatPeriod(ctx.locale, data.startDate, data.endDate),
      page: entryUrl("project", project.slug, ctx.locale),
      demo: data.demoUrl || null,
      repository: data.repoUrl || (data.repoPrivate ? "private (not public)" : null),
      media: {
        screenshots: data.showcase.filter((item) => item.kind === "image").length,
        recordings: data.showcase.filter((item) => item.kind === "video").length,
        captions: data.showcase
          .map(
            (item) => (ctx.locale === "ar" ? item.caption.ar : item.caption.en) || item.caption.en,
          )
          .filter(Boolean),
      },
    };
  },
};

const listExperience: ToolDefinition = {
  label: { en: "Checking his work experience", ar: "بشوف خبراته العملية" },
  declaration: {
    name: "list_experience",
    description:
      "Anas's work history, most recent first: role, company, dates, location, summary, achievements, technologies.",
  },
  async run(_args, ctx) {
    const items = await listPublishedFresh("experience", ctx.locale);
    return {
      experience: items.map((e) => ({
        ref: cite(
          ctx,
          e.id,
          `${e.t.role} — ${e.t.company}`,
          "experience",
          entryUrl("experience", e.slug, ctx.locale),
        ),
        role: e.t.role,
        company: e.t.company,
        period: formatPeriod(ctx.locale, e.data.startDate, e.data.endDate, e.data.current),
        current: e.data.current,
        location: e.t.location,
        summary: e.t.summary,
        achievements: e.t.highlights,
        technologies: e.data.technologies,
      })),
    };
  },
};

const listCredentials: ToolDefinition = {
  label: { en: "Reviewing education and certificates", ar: "بشوف التعليم والشهادات" },
  declaration: {
    name: "list_education_and_certificates",
    description:
      "All of Anas's degrees and professional certificates/courses (the complete list, with verification links).",
  },
  async run(_args, ctx) {
    const [education, certificates] = await Promise.all([
      listPublishedFresh("education", ctx.locale),
      listPublishedFresh("certificate", ctx.locale),
    ]);
    return {
      totalCertificates: certificates.length,
      note: `These are all ${certificates.length} certificates; when asked about his certificates, mention every one of them.`,
      education: education.map((e) => ({
        ref: cite(
          ctx,
          e.id,
          `${e.t.degree} — ${e.t.institution}`,
          "education",
          entryUrl("education", e.slug, ctx.locale),
        ),
        degree: e.t.degree,
        institution: e.t.institution,
        period: formatPeriod(ctx.locale, e.data.startDate, e.data.endDate),
        summary: e.t.summary,
        highlights: e.t.highlights,
      })),
      certificates: certificates.map((c) => ({
        ref: cite(
          ctx,
          c.id,
          `${c.t.title} — ${c.t.issuer}`,
          "certificate",
          entryUrl("certificate", c.slug, ctx.locale),
        ),
        title: c.t.title,
        issuer: c.t.issuer,
        issued: c.data.issueDate,
        skills: c.data.skills,
        description: c.t.description,
        verify: c.data.credentialUrl || null,
      })),
    };
  },
};

const getSkills: ToolDefinition = {
  label: { en: "Mapping his skills to evidence", ar: "بربط مهاراته بالأدلة" },
  declaration: {
    name: "get_skills",
    description:
      "Anas's skills: the groups he lists, plus an evidence map showing which projects and roles used each " +
      "technology (so claims can be backed by real work).",
  },
  async run(_args, ctx) {
    const [groups, projects, experience, certificates] = await Promise.all([
      listPublishedFresh("skill_group", ctx.locale),
      listPublishedFresh("project", ctx.locale),
      listPublishedFresh("experience", ctx.locale),
      listPublishedFresh("certificate", ctx.locale),
    ]);
    const evidence = new Map<
      string,
      { name: string; projects: string[]; roles: string[]; certificates: string[] }
    >();
    const add = (tech: string, kind: "projects" | "roles" | "certificates", label: string) => {
      const key = lower(tech.trim());
      if (!key) return;
      const item = evidence.get(key) ?? {
        name: tech.trim(),
        projects: [],
        roles: [],
        certificates: [],
      };
      if (!item[kind].includes(label)) item[kind].push(label);
      evidence.set(key, item);
    };
    for (const p of projects) for (const tag of p.data.tags) add(tag, "projects", p.t.title);
    for (const e of experience)
      for (const tech of e.data.technologies) add(tech, "roles", `${e.t.role} — ${e.t.company}`);
    for (const c of certificates)
      for (const skill of c.data.skills) add(skill, "certificates", c.t.title);
    const map = [...evidence.values()].sort(
      (a, b) =>
        b.projects.length +
        b.roles.length +
        b.certificates.length -
        (a.projects.length + a.roles.length + a.certificates.length),
    );
    return {
      groups: groups.map((g) => ({
        ref: cite(ctx, g.id, g.t.title, "skills", entryUrl("skill_group", g.slug, ctx.locale)),
        title: g.t.title,
        description: g.t.description,
        skills: g.data.items,
      })),
      evidence: map.slice(0, 40),
    };
  },
};

const matchJob: ToolDefinition = {
  label: { en: "Matching the role against his evidence", ar: "بطابق متطلبات الوظيفة مع خبراته" },
  declaration: {
    name: "match_job_requirements",
    description:
      "For a job description or role: pass its key requirements (you extract them) and get, for each one, " +
      "the strongest evidence from Anas's projects, experience, CV and certificates. Use the result to give an " +
      "honest fit assessment.",
    parameters: {
      type: "object",
      properties: {
        role: { type: "string", description: "Job title, if known." },
        requirements: {
          type: "array",
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              requirement: { type: "string" },
              importance: { type: "string", enum: ["must", "nice"] },
            },
            required: ["requirement", "importance"],
          },
        },
      },
      required: ["requirements"],
    },
  },
  async run(args, ctx) {
    const raw = Array.isArray(args["requirements"]) ? (args["requirements"] as unknown[]) : [];
    const requirements = raw
      .map((r) => {
        const item = (r ?? {}) as Record<string, unknown>;
        return {
          requirement: str(item["requirement"], 300),
          importance: item["importance"] === "nice" ? "nice" : "must",
        };
      })
      .filter((r) => r.requirement)
      .slice(0, 12);
    if (requirements.length === 0) return { error: "requirements are required" };

    const results = await Promise.all(
      requirements.map(async (req) => {
        const hits = await hybridSearch({
          query: req.requirement,
          preferLocale: ctx.locale,
          limit: 3,
          // Many requirements are searched at once; the model judges the evidence itself.
          rerank: false,
          ...(ctx.signal ? { signal: ctx.signal } : {}),
        });
        const relevant = hits;
        return {
          requirement: req.requirement,
          importance: req.importance,
          evidence: relevant.map((hit) => ({
            ref: cite(
              ctx,
              hit.entryId ?? hit.sourceKey,
              hit.title,
              hit.kind,
              hit.kind === "note" ? null : hit.url,
            ),
            source: hit.title,
            text: hit.text.slice(0, 600),
            page: hit.kind === "note" ? null : hit.url,
          })),
        };
      }),
    );
    return {
      role: str(args["role"], 200) || null,
      requirements: results,
      guidance:
        "Judge each requirement strictly from its evidence text: 'strong' only if the text explicitly shows it, " +
        "'partial' if it shows something adjacent, otherwise it is a gap. Say gaps plainly; never infer skills " +
        "the evidence does not mention.",
    };
  },
};

export const TOOLS: ToolDefinition[] = [
  searchKnowledge,
  getProfile,
  listProjects,
  getProject,
  listExperience,
  listCredentials,
  getSkills,
  matchJob,
];

const byName = new Map(TOOLS.map((tool) => [tool.declaration.name, tool]));

export function toolDeclarations(): GeminiFunctionDeclaration[] {
  return TOOLS.map((tool) => tool.declaration);
}

export function toolLabel(name: string, locale: Locale): string {
  return byName.get(name)?.label[locale] ?? (locale === "ar" ? "بشتغل على جوابك" : "Working on it");
}

/** Runs one tool call safely: unknown tools, bad args and timeouts become error results. */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolResult> {
  const tool = byName.get(name);
  if (!tool) return { error: `Unknown tool "${name}".` };
  try {
    return await Promise.race([
      tool.run(args ?? {}, ctx),
      new Promise<ToolResult>((resolve) =>
        setTimeout(
          () => resolve({ error: "The lookup took too long; try a narrower request." }),
          20_000,
        ),
      ),
    ]);
  } catch (error) {
    console.error("assistant_tool_failed", name, error instanceof Error ? error.message : error);
    return {
      error: "This lookup failed. Answer from other results or say the information is unavailable.",
    };
  }
}
