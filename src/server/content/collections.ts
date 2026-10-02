import { z } from "zod";
import { LOCALES, type Locale } from "@/i18n/config";

export { LOCALES, type Locale };

/**
 * The single source of truth for every piece of editable content on the site.
 * Each collection declares:
 *   - `data`: locale-neutral fields (urls, dates, tags, media)
 *   - `i18n`: fields written once per language
 *   - `fields`: how the admin editor renders each field (drives the generic edit form)
 */

const optionalText = z.string().trim().max(20_000).optional().default("");
const requiredText = (max = 400) => z.string().trim().min(1).max(max);
const url = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) => v === "" || /^(https?:\/\/|mailto:|tel:|\/)/i.test(v),
    "Must be a link (https://...)",
  )
  .optional()
  .default("");
const stringList = z.array(z.string().trim().min(1).max(600)).max(60).optional().default([]);
const yearMonth = z
  .string()
  .trim()
  .regex(/^$|^\d{4}(-\d{2})?$/, "Use YYYY or YYYY-MM")
  .optional()
  .default("");
/** A media reference is either an uploaded asset (`/media/<id>`) or an external/static URL. */
const media = z.string().trim().max(2000).optional().default("");

const caption = z
  .object({
    en: z.string().trim().max(400).optional().default(""),
    ar: z.string().trim().max(400).optional().default(""),
  })
  .optional()
  .default({});

/**
 * One item of a project's showcase: a screenshot (with an optional larger variant for sharp
 * screens) or a screen recording (with its poster frame and a light preview loop for cards).
 */
export const showcaseItemSchema = z.object({
  kind: z.enum(["image", "video"]),
  device: z.enum(["desktop", "mobile"]).default("desktop"),
  src: z.string().trim().min(1).max(2000),
  srcLarge: z.string().trim().max(2000).optional().default(""),
  poster: z.string().trim().max(2000).optional().default(""),
  preview: z.string().trim().max(2000).optional().default(""),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  duration: z.number().nonnegative().optional().default(0),
  caption,
});

export type ShowcaseItem = z.infer<typeof showcaseItemSchema>;

export type FieldKind =
  | "text"
  | "textarea"
  | "richtext"
  | "list"
  | "tags"
  | "url"
  | "email"
  | "date"
  | "boolean"
  | "media"
  | "file"
  | "select";

export interface FieldSpec {
  name: string;
  kind: FieldKind;
  label: { en: string; ar: string };
  help?: { en: string; ar: string };
  /** true = one value per language (lives in `i18n`), false = shared (lives in `data`). */
  localized: boolean;
  required?: boolean;
  options?: { value: string; label: { en: string; ar: string } }[];
  accept?: string;
}

export interface CollectionSpec<D extends z.ZodTypeAny, I extends z.ZodTypeAny> {
  name: string;
  label: { en: string; ar: string };
  singleton?: boolean;
  data: D;
  i18n: I;
  fields: FieldSpec[];
  /** The i18n field used as the display title in lists. */
  titleField: string;
}

const L = (en: string, ar: string) => ({ en, ar });

// ---------------------------------------------------------------------------------------------
// Profile (singleton): identity, contact, hero, about.
// ---------------------------------------------------------------------------------------------
export const profileCollection = {
  name: "profile",
  label: L("Profile", "الملف الشخصي"),
  singleton: true,
  titleField: "name",
  data: z.object({
    email: z.string().trim().max(320).optional().default(""),
    phone: z.string().trim().max(40).optional().default(""),
    showPhone: z.boolean().optional().default(true),
    github: url,
    linkedin: url,
    website: url,
    avatar: media,
    cv: media,
    cvFileName: z.string().trim().max(200).optional().default(""),
    openToWork: z.boolean().optional().default(true),
  }),
  i18n: z.object({
    name: requiredText(120),
    headline: requiredText(160),
    roles: stringList,
    tagline: optionalText,
    summary: optionalText,
    about: stringList,
    location: optionalText,
    availability: optionalText,
  }),
  fields: [
    {
      name: "name",
      kind: "text",
      localized: true,
      required: true,
      label: L("Full name", "الاسم الكامل"),
    },
    {
      name: "headline",
      kind: "text",
      localized: true,
      required: true,
      label: L("Headline", "المسمى المهني"),
    },
    {
      name: "roles",
      kind: "list",
      localized: true,
      label: L("Rotating roles (hero)", "الأدوار المتغيرة (الواجهة)"),
      help: L("Shown one after another under your name.", "بتظهر ورا بعض تحت اسمك."),
    },
    { name: "tagline", kind: "textarea", localized: true, label: L("Tagline", "الجملة التعريفية") },
    {
      name: "summary",
      kind: "textarea",
      localized: true,
      label: L("Professional summary", "الملخص المهني"),
    },
    { name: "about", kind: "list", localized: true, label: L("About paragraphs", "فقرات النبذة") },
    { name: "location", kind: "text", localized: true, label: L("Location", "الموقع") },
    {
      name: "availability",
      kind: "text",
      localized: true,
      label: L("Availability note", "ملاحظة التوفر"),
    },
    { name: "email", kind: "email", localized: false, label: L("Email", "البريد الإلكتروني") },
    { name: "phone", kind: "text", localized: false, label: L("Phone", "الهاتف") },
    {
      name: "showPhone",
      kind: "boolean",
      localized: false,
      label: L("Show phone publicly", "إظهار الهاتف للعامة"),
    },
    { name: "github", kind: "url", localized: false, label: L("GitHub URL", "رابط GitHub") },
    { name: "linkedin", kind: "url", localized: false, label: L("LinkedIn URL", "رابط LinkedIn") },
    { name: "website", kind: "url", localized: false, label: L("Website", "الموقع الشخصي") },
    {
      name: "avatar",
      kind: "media",
      localized: false,
      label: L("Photo", "الصورة"),
      accept: "image/*",
    },
    {
      name: "openToWork",
      kind: "boolean",
      localized: false,
      label: L("Open to opportunities", "متاح لفرص عمل"),
    },
  ],
} satisfies CollectionSpec<z.ZodTypeAny, z.ZodTypeAny>;

// ---------------------------------------------------------------------------------------------
export const projectCollection = {
  name: "project",
  label: L("Projects", "المشاريع"),
  titleField: "title",
  data: z.object({
    cover: media,
    repoUrl: url,
    demoUrl: url,
    tags: stringList,
    category: z.string().trim().max(80).optional().default(""),
    featured: z.boolean().optional().default(false),
    /** The source exists but is not public: the site says so instead of linking it. */
    repoPrivate: z.boolean().optional().default(false),
    startDate: yearMonth,
    endDate: yearMonth,
    /** Screenshots and screen recordings, in display order (written by `pnpm media:import`). */
    showcase: z.array(showcaseItemSchema).max(60).optional().default([]),
  }),
  i18n: z.object({
    title: requiredText(160),
    summary: requiredText(600),
    /** Headline numbers, one per line as "value | label" (e.g. "54 ms | median search time"). */
    metrics: stringList,
    role: optionalText,
    problem: optionalText,
    solution: optionalText,
    architecture: optionalText,
    challenges: optionalText,
    decisions: optionalText,
    results: optionalText,
    highlights: stringList,
  }),
  fields: [
    { name: "title", kind: "text", localized: true, required: true, label: L("Title", "العنوان") },
    {
      name: "summary",
      kind: "textarea",
      localized: true,
      required: true,
      label: L("One-line summary", "ملخص بسطر"),
    },
    { name: "role", kind: "textarea", localized: true, label: L("My role", "دوري") },
    { name: "problem", kind: "textarea", localized: true, label: L("Problem", "المشكلة") },
    { name: "solution", kind: "textarea", localized: true, label: L("What I built", "شو بنيت") },
    {
      name: "architecture",
      kind: "textarea",
      localized: true,
      label: L("Architecture", "المعمارية"),
    },
    { name: "challenges", kind: "textarea", localized: true, label: L("Challenges", "التحديات") },
    {
      name: "decisions",
      kind: "textarea",
      localized: true,
      label: L("Key decisions", "القرارات الهندسية"),
    },
    {
      name: "results",
      kind: "textarea",
      localized: true,
      label: L("Results & impact", "النتائج والأثر"),
    },
    { name: "highlights", kind: "list", localized: true, label: L("Highlights", "أبرز النقاط") },
    {
      name: "metrics",
      kind: "list",
      localized: true,
      label: L("Key numbers", "أرقام رئيسية"),
      help: L(
        'One per line as "value | label", e.g. "54 ms | median search time".',
        'كل سطر بالشكل "القيمة | الوصف"، مثلاً "54 ms | متوسط زمن البحث".',
      ),
    },
    {
      name: "cover",
      kind: "media",
      localized: false,
      label: L("Cover image", "صورة الغلاف"),
      accept: "image/*",
    },
    { name: "tags", kind: "tags", localized: false, label: L("Technologies", "التقنيات") },
    { name: "category", kind: "text", localized: false, label: L("Category", "التصنيف") },
    { name: "repoUrl", kind: "url", localized: false, label: L("Repository", "المستودع") },
    {
      name: "repoPrivate",
      kind: "boolean",
      localized: false,
      label: L("Private source code", "الكود المصدري خاص"),
    },
    { name: "demoUrl", kind: "url", localized: false, label: L("Live demo", "النسخة الحية") },
    { name: "startDate", kind: "date", localized: false, label: L("Start (YYYY-MM)", "البداية") },
    { name: "endDate", kind: "date", localized: false, label: L("End (YYYY-MM)", "النهاية") },
    { name: "featured", kind: "boolean", localized: false, label: L("Featured", "مميز") },
  ],
} satisfies CollectionSpec<z.ZodTypeAny, z.ZodTypeAny>;

// ---------------------------------------------------------------------------------------------
export const experienceCollection = {
  name: "experience",
  label: L("Experience", "الخبرات"),
  titleField: "role",
  data: z.object({
    startDate: yearMonth,
    endDate: yearMonth,
    current: z.boolean().optional().default(false),
    companyUrl: url,
    logo: media,
    technologies: stringList,
  }),
  i18n: z.object({
    role: requiredText(160),
    company: requiredText(160),
    location: optionalText,
    summary: optionalText,
    highlights: stringList,
  }),
  fields: [
    { name: "role", kind: "text", localized: true, required: true, label: L("Role", "المسمى") },
    {
      name: "company",
      kind: "text",
      localized: true,
      required: true,
      label: L("Company", "الشركة"),
    },
    { name: "location", kind: "text", localized: true, label: L("Location", "الموقع") },
    { name: "summary", kind: "textarea", localized: true, label: L("Summary", "الملخص") },
    { name: "highlights", kind: "list", localized: true, label: L("Achievements", "الإنجازات") },
    { name: "startDate", kind: "date", localized: false, label: L("Start (YYYY-MM)", "البداية") },
    { name: "endDate", kind: "date", localized: false, label: L("End (YYYY-MM)", "النهاية") },
    {
      name: "current",
      kind: "boolean",
      localized: false,
      label: L("I work here now", "بشتغل هون حالياً"),
    },
    {
      name: "companyUrl",
      kind: "url",
      localized: false,
      label: L("Company website", "موقع الشركة"),
    },
    {
      name: "logo",
      kind: "media",
      localized: false,
      label: L("Logo", "الشعار"),
      accept: "image/*",
    },
    { name: "technologies", kind: "tags", localized: false, label: L("Technologies", "التقنيات") },
  ],
} satisfies CollectionSpec<z.ZodTypeAny, z.ZodTypeAny>;

// ---------------------------------------------------------------------------------------------
export const educationCollection = {
  name: "education",
  label: L("Education", "التعليم"),
  titleField: "degree",
  data: z.object({ startDate: yearMonth, endDate: yearMonth, url }),
  i18n: z.object({
    degree: requiredText(200),
    institution: requiredText(200),
    location: optionalText,
    summary: optionalText,
    highlights: stringList,
  }),
  fields: [
    {
      name: "degree",
      kind: "text",
      localized: true,
      required: true,
      label: L("Degree", "الشهادة"),
    },
    {
      name: "institution",
      kind: "text",
      localized: true,
      required: true,
      label: L("Institution", "الجامعة"),
    },
    { name: "location", kind: "text", localized: true, label: L("Location", "الموقع") },
    { name: "summary", kind: "textarea", localized: true, label: L("Summary", "الملخص") },
    { name: "highlights", kind: "list", localized: true, label: L("Highlights", "أبرز النقاط") },
    { name: "startDate", kind: "date", localized: false, label: L("Start (YYYY-MM)", "البداية") },
    { name: "endDate", kind: "date", localized: false, label: L("End (YYYY-MM)", "النهاية") },
    { name: "url", kind: "url", localized: false, label: L("Link", "رابط") },
  ],
} satisfies CollectionSpec<z.ZodTypeAny, z.ZodTypeAny>;

// ---------------------------------------------------------------------------------------------
export const certificateCollection = {
  name: "certificate",
  label: L("Certificates", "الشهادات"),
  titleField: "title",
  data: z.object({
    issueDate: yearMonth,
    credentialId: z.string().trim().max(200).optional().default(""),
    credentialUrl: url,
    image: media,
    file: media,
    skills: stringList,
    featured: z.boolean().optional().default(false),
  }),
  i18n: z.object({
    title: requiredText(200),
    issuer: requiredText(200),
    description: optionalText,
  }),
  fields: [
    { name: "title", kind: "text", localized: true, required: true, label: L("Title", "العنوان") },
    {
      name: "issuer",
      kind: "text",
      localized: true,
      required: true,
      label: L("Issuer", "الجهة المانحة"),
    },
    { name: "description", kind: "textarea", localized: true, label: L("Description", "الوصف") },
    {
      name: "image",
      kind: "media",
      localized: false,
      label: L("Certificate image", "صورة الشهادة"),
      accept: "image/*",
    },
    {
      name: "file",
      kind: "media",
      localized: false,
      label: L("Certificate file (PDF)", "ملف الشهادة (PDF)"),
      accept: "application/pdf",
    },
    {
      name: "issueDate",
      kind: "date",
      localized: false,
      label: L("Issued (YYYY-MM)", "تاريخ الإصدار"),
    },
    {
      name: "credentialId",
      kind: "text",
      localized: false,
      label: L("Credential ID", "رقم الشهادة"),
    },
    {
      name: "credentialUrl",
      kind: "url",
      localized: false,
      label: L("Verification link", "رابط التحقق"),
    },
    { name: "skills", kind: "tags", localized: false, label: L("Skills", "المهارات") },
    { name: "featured", kind: "boolean", localized: false, label: L("Featured", "مميزة") },
  ],
} satisfies CollectionSpec<z.ZodTypeAny, z.ZodTypeAny>;

// ---------------------------------------------------------------------------------------------
export const skillGroupCollection = {
  name: "skill_group",
  label: L("Skills", "المهارات"),
  titleField: "title",
  data: z.object({
    icon: z.string().trim().max(40).optional().default("sparkles"),
    items: stringList,
  }),
  i18n: z.object({ title: requiredText(120), description: optionalText }),
  fields: [
    {
      name: "title",
      kind: "text",
      localized: true,
      required: true,
      label: L("Group title", "عنوان المجموعة"),
    },
    { name: "description", kind: "textarea", localized: true, label: L("Description", "الوصف") },
    { name: "items", kind: "tags", localized: false, label: L("Skills", "المهارات") },
    {
      name: "icon",
      kind: "select",
      localized: false,
      label: L("Icon", "الأيقونة"),
      options: [
        "sparkles",
        "code",
        "cpu",
        "database",
        "layers",
        "shield",
        "rocket",
        "globe",
        "terminal",
        "briefcase",
      ].map((value) => ({ value, label: L(value, value) })),
    },
  ],
} satisfies CollectionSpec<z.ZodTypeAny, z.ZodTypeAny>;

// ---------------------------------------------------------------------------------------------
// Knowledge documents: the CV and any file the owner uploads for the assistant to learn from.
// ---------------------------------------------------------------------------------------------
export const documentCollection = {
  name: "document",
  label: L("Knowledge files", "ملفات المعرفة"),
  titleField: "title",
  data: z.object({
    file: media,
    fileName: z.string().trim().max(300).optional().default(""),
    mimeType: z.string().trim().max(120).optional().default(""),
    sizeBytes: z.number().int().nonnegative().optional().default(0),
    role: z.enum(["cv", "document"]).optional().default("document"),
    extractedText: z.string().max(400_000).optional().default(""),
    extractedAt: z.string().optional().default(""),
    extractionError: z.string().optional().default(""),
  }),
  i18n: z.object({ title: requiredText(200), description: optionalText }),
  fields: [
    { name: "title", kind: "text", localized: true, required: true, label: L("Title", "العنوان") },
    { name: "description", kind: "textarea", localized: true, label: L("Description", "الوصف") },
    {
      name: "file",
      kind: "file",
      localized: false,
      label: L("File", "الملف"),
      accept: ".pdf,.txt,.md,image/*",
    },
  ],
} satisfies CollectionSpec<z.ZodTypeAny, z.ZodTypeAny>;

// ---------------------------------------------------------------------------------------------
// Private notes: facts the assistant may use but the site never shows (preferences, FAQs...).
// ---------------------------------------------------------------------------------------------
export const noteCollection = {
  name: "note",
  label: L("Assistant notes", "ملاحظات للمساعد"),
  titleField: "title",
  data: z.object({}),
  i18n: z.object({ title: requiredText(200), body: requiredText(20_000) }),
  fields: [
    { name: "title", kind: "text", localized: true, required: true, label: L("Title", "العنوان") },
    {
      name: "body",
      kind: "textarea",
      localized: true,
      required: true,
      label: L("What the assistant should know", "شو لازم يعرف المساعد"),
    },
  ],
} satisfies CollectionSpec<z.ZodTypeAny, z.ZodTypeAny>;

export const COLLECTIONS = {
  profile: profileCollection,
  project: projectCollection,
  experience: experienceCollection,
  education: educationCollection,
  certificate: certificateCollection,
  skill_group: skillGroupCollection,
  document: documentCollection,
  note: noteCollection,
} as const;

export type CollectionName = keyof typeof COLLECTIONS;
export const COLLECTION_NAMES = Object.keys(COLLECTIONS) as CollectionName[];

export type DataOf<C extends CollectionName> = z.infer<(typeof COLLECTIONS)[C]["data"]>;
export type I18nOf<C extends CollectionName> = z.infer<(typeof COLLECTIONS)[C]["i18n"]>;

export type EntryStatus = "published" | "draft" | "hidden";

/** A content entry resolved for one locale (falls back to the other language field by field). */
export interface Entry<C extends CollectionName = CollectionName> {
  id: string;
  collection: C;
  slug: string;
  status: EntryStatus;
  orderIndex: number;
  version: number;
  updatedAt: string;
  data: DataOf<C>;
  t: I18nOf<C>;
  /** Locales in which this entry was actually written (vs. falling back). */
  locales: Locale[];
}

export function isCollectionName(value: string): value is CollectionName {
  // Own keys only: `in` also accepts inherited names such as "constructor".
  return Object.hasOwn(COLLECTIONS, value);
}

/** Collections that hold exactly one entry (slug "main"). */
export function isSingleton(collection: CollectionName): boolean {
  return collection === "profile";
}
