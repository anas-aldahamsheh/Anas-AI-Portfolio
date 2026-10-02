import { readFileSync, statSync } from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { appSettings, contentEntries } from "@/lib/db/schema";
import { certificateEntries } from "@/content/certificates";
import { educationEntries, experienceEntries } from "@/content/experience";
import { CV_FILE, CV_FILE_NAME, CV_TEXT_FILE, PROFILE, skillGroupEntries } from "@/content/profile";
import { projectEntries, type ProjectRelease } from "@/content/projects";
import { COLLECTIONS, LOCALES, type CollectionName } from "./collections";
import { applyContentCorrections } from "./corrections";
import { createEntry, deleteEntry, reorderEntries, updateEntry } from "./mutations";
import { listAllRows } from "./repository";

/**
 * Content releases bring content that is versioned with the code (src/content) into the
 * database. Each release runs once per database: it is recorded in `app_settings`, so edits the
 * owner makes afterwards in the admin are never overwritten by a later deploy. Bump the id to
 * publish a new version of the projects or certificates.
 */
export const PROJECTS_RELEASE_ID = "content-2026-10-11";

const releaseKey = (id: string) => `content_release:${id}`;
const ACTOR = "content-release";

type Changes = { created: string[]; updated: string[]; removed: string[] };

export interface ReleaseResult {
  release: string;
  skipped?: "already_applied";
  created: string[];
  updated: string[];
  removed: string[];
  /** Profile and experience entries cleaned of text about the placeholder projects. */
  corrected?: string[];
  certificates?: Changes;
  experience?: Changes;
  education?: Changes;
  skills?: Changes;
  profile?: string;
  cv?: string;
}

/** Checks every entry against the collection schema before anything is written. */
export function validateProjectRelease(entries: ProjectRelease[]): string[] {
  return [
    ...validateEntries("project", entries),
    ...validateEntries("certificate", certificateEntries()),
    ...validateEntries("experience", experienceEntries()),
    ...validateEntries("education", educationEntries()),
    ...validateEntries("skill_group", skillGroupEntries()),
    ...validateEntries("profile", [{ slug: "main", orderIndex: 0, ...PROFILE }]),
  ];
}

function validateEntries(collection: CollectionName, entries: ProjectRelease[]): string[] {
  const problems: string[] = [];
  const spec = COLLECTIONS[collection];
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.slug)) problems.push(`${entry.slug}: duplicate slug`);
    slugs.add(entry.slug);
    const data = spec.data.safeParse(entry.data);
    if (!data.success) problems.push(`${entry.slug}: ${data.error.issues[0]?.message}`);
    for (const locale of LOCALES) {
      const i18n = spec.i18n.safeParse(entry.i18n[locale] ?? {});
      if (!i18n.success) {
        const issue = i18n.error.issues[0];
        problems.push(`${entry.slug} (${locale}): ${issue?.path.join(".")} ${issue?.message}`);
      }
    }
  }
  return problems;
}

export async function releaseApplied(id = PROJECTS_RELEASE_ID): Promise<boolean> {
  const [row] = await db
    .select({ key: appSettings.key })
    .from(appSettings)
    .where(eq(appSettings.key, releaseKey(id)))
    .limit(1);
  return Boolean(row);
}

/**
 * Makes the project collection exactly the release: entries are created or replaced by slug
 * (keeping their ids, so links and history survive), projects that are not in the release are
 * deleted (a revision is kept, so they can be restored from the admin) and the order follows
 * the release. The certificates, experience and education are synced the same way, and text about the placeholder
 * projects is taken out of the profile and experience entries. The caller rebuilds the assistant's index afterwards.
 */
export async function applyProjectsRelease(
  options: { force?: boolean; id?: string; entries?: ProjectRelease[] } = {},
): Promise<ReleaseResult> {
  const id = options.id ?? PROJECTS_RELEASE_ID;
  const entries = options.entries ?? projectEntries();
  const result: ReleaseResult = { release: id, created: [], updated: [], removed: [] };
  const problems = validateProjectRelease(entries);
  if (problems.length) throw new Error(`Invalid project content:\n- ${problems.join("\n- ")}`);
  if (entries.length === 0) throw new Error("The release has no projects.");

  // Two deployments (Vercel and Netlify) build from the same push against the same database:
  // the first one to claim the release applies it, the other skips it.
  const claimed = await db
    .insert(appSettings)
    .values({ key: releaseKey(id), value: { claimedAt: new Date().toISOString() } })
    .onConflictDoNothing()
    .returning({ key: appSettings.key });
  if (!options.force && claimed.length === 0) return { ...result, skipped: "already_applied" };
  try {
    await applyRelease(result, entries);
  } catch (error) {
    if (claimed.length) await db.delete(appSettings).where(eq(appSettings.key, releaseKey(id)));
    throw error;
  }

  const value = { appliedAt: new Date().toISOString(), ...result };
  await db
    .insert(appSettings)
    .values({ key: releaseKey(id), value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } });
  return result;
}

async function applyRelease(result: ReleaseResult, entries: ProjectRelease[]) {
  Object.assign(result, await syncCollection("project", entries));
  result.certificates = await syncCollection("certificate", certificateEntries());
  result.experience = await syncCollection("experience", experienceEntries());
  result.education = await syncCollection("education", educationEntries());
  result.skills = await syncCollection("skill_group", skillGroupEntries());
  result.profile = await syncProfile();
  result.cv = await syncCvDocument();
  result.corrected = await applyContentCorrections(ACTOR);
}

/**
 * Makes one collection exactly the given entries: created or replaced by slug (keeping ids),
 * entries not in the list deleted (a revision is kept), and the order taken from the list.
 */
async function syncCollection(collection: CollectionName, entries: ProjectRelease[]) {
  const changes: Changes = { created: [], updated: [], removed: [] };
  const existing = await listAllRows(collection);
  const bySlug = new Map(existing.map((row) => [row.slug, row]));
  const keep = new Set(entries.map((entry) => entry.slug));

  const orderedIds: string[] = [];
  for (const entry of entries) {
    const current = bySlug.get(entry.slug);
    const patch = { data: entry.data, i18n: entry.i18n, status: "published" as const };
    if (current) {
      const row = await updateEntry(current.id, { ...patch, replace: true }, ACTOR);
      orderedIds.push(row.id);
      changes.updated.push(entry.slug);
    } else {
      const row = await createEntry(collection, { ...patch, slug: entry.slug }, ACTOR);
      orderedIds.push(row.id);
      changes.created.push(row.slug);
    }
  }
  for (const row of existing) {
    if (keep.has(row.slug)) continue;
    await deleteEntry(row.id, ACTOR);
    changes.removed.push(row.slug);
  }
  await reorderEntries(collection, orderedIds);
  return changes;
}

/**
 * Brings the profile in line with the CV: contact details, texts and the CV download. Fields
 * the release does not set (the photo) keep their current value.
 */
async function syncProfile(): Promise<string> {
  const [current] = await listAllRows("profile");
  const patch = { data: PROFILE.data, i18n: PROFILE.i18n, status: "published" as const };
  if (current) {
    await updateEntry(current.id, patch, ACTOR);
    return "updated";
  }
  await createEntry("profile", { ...patch, slug: "main" }, ACTOR);
  return "created";
}

/** Makes the CV the assistant's "cv" knowledge document, with its text already extracted. */
async function syncCvDocument(): Promise<string> {
  const text = readFileSync(CV_TEXT_FILE, "utf8").trim();
  const patch = {
    data: {
      file: CV_FILE,
      fileName: CV_FILE_NAME,
      mimeType: "application/pdf",
      sizeBytes: statSync(`public${CV_FILE}`).size,
      role: "cv",
      extractedText: text,
      extractedAt: new Date().toISOString(),
      extractionError: "",
    },
    i18n: { en: { title: "Curriculum Vitae (CV)" }, ar: { title: "السيرة الذاتية" } },
    status: "published" as const,
  };
  const current = (await listAllRows("document")).find((row) => row.data["role"] === "cv");
  if (current) {
    await updateEntry(current.id, patch, ACTOR);
    return "updated";
  }
  await createEntry("document", { ...patch, slug: "cv" }, ACTOR);
  return "created";
}

/** Slugs of the projects currently in the database (for checks and logs). */
export async function projectSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: contentEntries.slug })
    .from(contentEntries)
    .where(eq(contentEntries.collection, "project"));
  return rows.map((row) => row.slug);
}
