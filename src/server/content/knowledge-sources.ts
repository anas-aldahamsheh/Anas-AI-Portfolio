import type { KnowledgeSection } from "@/ai/knowledge/chunker";
import type { KnowledgeSourceInput } from "@/ai/knowledge/indexer";
import type { KnowledgeKind } from "@/ai/knowledge/config";
import { LOCALES, type CollectionName, type Entry, type Locale } from "./collections";
import { resolveEntry, type EntryRow } from "./repository";

const KIND: Record<CollectionName, KnowledgeKind> = {
  profile: "profile",
  project: "project",
  experience: "experience",
  education: "education",
  certificate: "certificate",
  skill_group: "skills",
  document: "document",
  note: "note",
};

const L = (locale: Locale, en: string, ar: string) => (locale === "ar" ? ar : en);

export function formatPeriod(
  locale: Locale,
  start?: string,
  end?: string,
  current?: boolean,
): string {
  const s = start?.trim();
  const e = current ? L(locale, "present", "حتى الآن") : end?.trim();
  if (!s && !e) return "";
  if (s && e) return `${s} – ${e}`;
  return s ?? e ?? "";
}

function section(heading: string, text: string | string[] | undefined): KnowledgeSection | null {
  if (!text) return null;
  const body = Array.isArray(text)
    ? text
        .filter(Boolean)
        .map((t) => `- ${t}`)
        .join("\n")
    : text.trim();
  return body ? { heading, text: body } : null;
}

function compact(sections: (KnowledgeSection | null)[]): KnowledgeSection[] {
  return sections.filter((s): s is KnowledgeSection => s !== null);
}

/** Public URL a citation should open, or null for private knowledge. */
export function entryUrl(
  collection: CollectionName,
  slug: string,
  locale: Locale,
  role?: string,
): string | null {
  switch (collection) {
    case "project":
      return `/${locale}/projects/${slug}`;
    case "experience":
      return `/${locale}/experience#${slug}`;
    case "certificate":
      return `/${locale}/certificates#${slug}`;
    case "profile":
    case "education":
    case "skill_group":
      return `/${locale}/cv`;
    case "document":
      return role === "cv" ? `/${locale}/cv` : null;
    case "note":
      return null;
  }
}

/** Splits extracted document text (markdown-ish) into heading sections. */
export function splitDocument(text: string): KnowledgeSection[] {
  const out: KnowledgeSection[] = [];
  let heading: string | undefined;
  let buffer: string[] = [];
  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body) out.push({ ...(heading ? { heading } : {}), text: body });
    buffer = [];
  };
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s{0,3}#{1,4}\s+(.+?)\s*#*\s*$/.exec(line);
    if (match?.[1]) {
      flush();
      heading = match[1].trim();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return out;
}

function sectionsFor(
  entry: Entry,
  locale: Locale,
): { title: string; sections: KnowledgeSection[] } {
  switch (entry.collection) {
    case "profile": {
      const { t, data } = entry as Entry<"profile">;
      const contact = [
        data.email && `${L(locale, "Email", "البريد")}: ${data.email}`,
        data.showPhone && data.phone && `${L(locale, "Phone", "الهاتف")}: ${data.phone}`,
        data.linkedin && `LinkedIn: ${data.linkedin}`,
        data.github && `GitHub: ${data.github}`,
        data.website && `${L(locale, "Website", "الموقع")}: ${data.website}`,
      ].filter(Boolean) as string[];
      return {
        title: `${t.name} — ${L(locale, "profile", "الملف الشخصي")}`,
        sections: compact([
          section(L(locale, "Headline", "المسمى"), [t.headline, ...t.roles].join(" · ")),
          section(L(locale, "Tagline", "الجملة التعريفية"), t.tagline),
          section(L(locale, "Summary", "الملخص"), t.summary),
          section(L(locale, "About", "نبذة"), t.about.join("\n\n")),
          section(L(locale, "Location", "الموقع"), t.location),
          section(
            L(locale, "Availability", "التوفر"),
            [
              data.openToWork ? L(locale, "Open to new opportunities.", "متاح لفرص جديدة.") : "",
              t.availability,
            ]
              .filter(Boolean)
              .join(" "),
          ),
          section(L(locale, "Contact", "التواصل"), contact),
        ]),
      };
    }
    case "project": {
      const { t, data } = entry as Entry<"project">;
      const links = [
        data.demoUrl && `Live demo: ${data.demoUrl}`,
        data.repoUrl && `Repository: ${data.repoUrl}`,
      ]
        .filter(Boolean)
        .join("\n");
      return {
        title: t.title,
        sections: compact([
          section(L(locale, "Overview", "نظرة عامة"), t.summary),
          section(L(locale, "Role", "الدور"), t.role),
          section(L(locale, "Problem", "المشكلة"), t.problem),
          section(L(locale, "What was built", "ما تم بناؤه"), t.solution),
          section(L(locale, "Architecture", "المعمارية"), t.architecture),
          section(L(locale, "Challenges", "التحديات"), t.challenges),
          section(L(locale, "Key decisions", "القرارات"), t.decisions),
          section(L(locale, "Results", "النتائج"), t.results),
          section(L(locale, "Highlights", "أبرز النقاط"), t.highlights),
          section(
            L(locale, "Technologies", "التقنيات"),
            [
              data.tags.join(", "),
              data.category,
              formatPeriod(locale, data.startDate, data.endDate),
            ]
              .filter(Boolean)
              .join(" · "),
          ),
          section(L(locale, "Links", "الروابط"), links),
        ]),
      };
    }
    case "experience": {
      const { t, data } = entry as Entry<"experience">;
      return {
        title: `${t.role} — ${t.company}`,
        sections: compact([
          section(
            L(locale, "Position", "المنصب"),
            [
              `${t.role} ${L(locale, "at", "في")} ${t.company}`,
              formatPeriod(locale, data.startDate, data.endDate, data.current),
              t.location,
            ]
              .filter(Boolean)
              .join(" · "),
          ),
          section(L(locale, "Summary", "الملخص"), t.summary),
          section(L(locale, "Achievements", "الإنجازات"), t.highlights),
          section(L(locale, "Technologies", "التقنيات"), data.technologies.join(", ")),
        ]),
      };
    }
    case "education": {
      const { t, data } = entry as Entry<"education">;
      return {
        title: `${t.degree} — ${t.institution}`,
        sections: compact([
          section(
            L(locale, "Education", "التعليم"),
            [
              t.degree,
              t.institution,
              t.location,
              formatPeriod(locale, data.startDate, data.endDate),
            ]
              .filter(Boolean)
              .join(" · "),
          ),
          section(L(locale, "Summary", "الملخص"), t.summary),
          section(L(locale, "Highlights", "أبرز النقاط"), t.highlights),
        ]),
      };
    }
    case "certificate": {
      const { t, data } = entry as Entry<"certificate">;
      return {
        title: `${t.title} — ${t.issuer}`,
        sections: compact([
          section(
            L(locale, "Certificate", "الشهادة"),
            [t.title, t.issuer, data.issueDate, data.credentialId && `ID ${data.credentialId}`]
              .filter(Boolean)
              .join(" · "),
          ),
          section(L(locale, "Description", "الوصف"), t.description),
          section(L(locale, "Skills", "المهارات"), data.skills.join(", ")),
          section(L(locale, "Verification", "التحقق"), data.credentialUrl),
        ]),
      };
    }
    case "skill_group": {
      const { t, data } = entry as Entry<"skill_group">;
      return {
        title: `${L(locale, "Skills", "المهارات")}: ${t.title}`,
        sections: compact([
          section(t.title, [t.description, data.items.join(", ")].filter(Boolean).join("\n")),
        ]),
      };
    }
    case "document": {
      const { t, data } = entry as Entry<"document">;
      const body = splitDocument(data.extractedText);
      return {
        title: t.title,
        sections: [
          ...compact([section(L(locale, "About this file", "عن الملف"), t.description)]),
          ...body,
        ],
      };
    }
    case "note": {
      const { t } = entry as Entry<"note">;
      return { title: t.title, sections: compact([section(t.title, t.body)]) };
    }
  }
}

/**
 * Knowledge sources for one entry: one per language it is written in.
 * Documents are language-agnostic text, so they are indexed once (under their own locale key).
 */
export function knowledgeInputsForRow(row: EntryRow): KnowledgeSourceInput[] {
  const collection = row.collection as CollectionName;
  if (row.status !== "published") return [];

  if (collection === "document") {
    const entry = resolveEntry<"document">(row, "en");
    if (!entry.data.extractedText.trim()) return [];
    const { title, sections } = sectionsFor(entry, "en");
    return [
      {
        key: `entry:${row.id}:doc`,
        entryId: row.id,
        kind: entry.data.role === "cv" ? "cv" : "document",
        locale: "any",
        title,
        url: entryUrl("document", row.slug, "en", entry.data.role),
        sections,
        metadata: { collection, slug: row.slug },
      },
    ];
  }

  const written = LOCALES.filter((locale) =>
    Object.values(row.i18n[locale] ?? {}).some((v) =>
      Array.isArray(v) ? v.length > 0 : Boolean(v),
    ),
  );
  return written.map((locale) => {
    const entry = resolveEntry(row, locale);
    const { title, sections } = sectionsFor(entry, locale);
    return {
      key: `entry:${row.id}:${locale}`,
      entryId: row.id,
      kind: KIND[collection],
      locale,
      title,
      url: entryUrl(collection, row.slug, locale),
      sections,
      metadata: { collection, slug: row.slug },
    };
  });
}
