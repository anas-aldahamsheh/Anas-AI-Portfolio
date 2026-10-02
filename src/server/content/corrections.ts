import type { CollectionName } from "./collections";
import { updateEntry } from "./mutations";
import { listAllRows } from "./repository";

/**
 * Text that described the placeholder projects the site launched with. A release takes it out of
 * the profile and experience entries already in the database (and the seed no longer has it).
 * Only exact matches are touched, so anything the owner has rewritten in the admin stays as is.
 */
const COLLECTIONS: CollectionName[] = ["profile", "experience"];

/** List items (highlights, technologies) to drop. */
const REMOVE_ITEMS = new Set([
  "Engineered autonomous multimodal RAG pipeline combining BGE-M3 dense embeddings and BM25 lexical search, achieving 99.4% citation accuracy and 180ms P95 latency.",
  "Constructed embedded Rust edge policy consensus daemon with Ed25519 token verification, maintaining sub-3ms P99 latency under 50,000 requests/second.",
  "Built real-time bidirectional neural speech stream utilizing WebRTC and low-latency chunked audio inference, reducing conversational lag to 125ms.",
  "Engineered zero-runtime-overhead bilingual design systems strictly compliant with WCAG 2.2 AA accessibility standards across both light and dark themes.",
  "تصميم محرك RAG هجين يدمج التضمين الشعاعي والفهرسة المعجمية محققاً دقة اقتباس 99.4% وزمن استجابة 180ms.",
  "تطوير خادم حافة بلغة Rust للتحقق المشفر من الصلاحيات بزمن استجابة P99 يقل عن 3ms تحت ضغط 50,000 طلب/ثانية.",
  "بناء مسار تدفق صوتي عصبي ثنائي الاتجاه عبر WebRTC، مقلصاً زمن التأخر للمحادثة الحية إلى 125ms.",
  "بناء أنظمة تصميم ثنائية اللغة متوافقة تماماً مع معايير إمكانية الوصول WCAG 2.2 AA في الوضعين الليلي والنهاري.",
  "Rust",
  "Qdrant",
  "WebRTC",
]);

/** Phrases to rewrite inside longer text. */
const REPLACE: [string, string][] = [
  [
    "hybrid RAG retrieval pipelines, edge policy consensus systems, and automated evaluation workflows",
    "hybrid RAG retrieval pipelines and automated evaluation workflows",
  ],
  ["مسارات استرجاع هجينة (RAG)، بوابات حافة موزعة، ومسارات", "مسارات استرجاع هجينة (RAG)، ومسارات"],
  [
    "Whether engineering a hybrid dense/sparse RAG pipeline, writing low-latency edge daemons in Rust, or crafting accessible bilingual interfaces,",
    "Whether engineering a hybrid dense/sparse RAG pipeline or crafting accessible bilingual interfaces,",
  ],
  [
    "سواء كنت أصمم محرك استرجاع هجين (Hybrid RAG)، أو أبني خادم حافة عالي الأداء بلغة Rust، أو أطور",
    "سواء كنت أصمم محرك استرجاع هجين (Hybrid RAG) أو أطور",
  ],
];

function clean(value: unknown): unknown {
  if (typeof value === "string") {
    return REPLACE.reduce((text, [from, to]) => text.split(from).join(to), value);
  }
  if (Array.isArray(value)) {
    return value.filter((item) => !(typeof item === "string" && REMOVE_ITEMS.has(item))).map(clean);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clean(item)]));
  }
  return value;
}

/** Applies the corrections; returns the slugs of the entries that changed. */
export async function applyContentCorrections(actor: string): Promise<string[]> {
  const changed: string[] = [];
  for (const collection of COLLECTIONS) {
    for (const row of await listAllRows(collection)) {
      const data = clean(row.data) as Record<string, unknown>;
      const i18n = clean(row.i18n) as Record<string, Record<string, unknown>>;
      if (JSON.stringify(data) === JSON.stringify(row.data)) {
        if (JSON.stringify(i18n) === JSON.stringify(row.i18n)) continue;
      }
      await updateEntry(row.id, { data, i18n }, actor);
      changed.push(`${collection}/${row.slug}`);
    }
  }
  return changed;
}
