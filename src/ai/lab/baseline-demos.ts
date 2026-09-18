import { AiLabDemoConfig } from "@/ai/contracts/ai-lab";

export const BASELINE_AI_LAB_DEMOS: AiLabDemoConfig[] = [
  {
    id: "demo-hybrid-search-001",
    slug: "hybrid-search",
    type: "hybrid_search",
    titleEn: "Hybrid Search Explorer",
    titleAr: "مستكشف البحث الهجين",
    descriptionEn:
      "Interactive Reciprocal Rank Fusion (RRF) combining dense semantic vectors (BGE-M3) with sparse lexical tokens (BM25).",
    descriptionAr:
      "دمج تفاعلي متقدم لخوارزمية RRF يجمع بين المتجهات الدلالية (BGE-M3) والبحث النصي اللغوي (BM25).",
    isPublished: true,
    rateLimitRpm: 60,
    timeoutMs: 10000,
    sortOrder: 1,
  },
  {
    id: "demo-reranking-002",
    slug: "reranking",
    type: "reranking",
    titleEn: "Cross-Encoder Reranker Sandbox",
    titleAr: "مختبر إعادة الترتيب بالمرمّز المتقاطع",
    descriptionEn:
      "Cross-attention relevance scoring over candidate chunks to maximize precision before LLM context packing.",
    descriptionAr:
      "حساب درجات الصلة عبر الانتباه المتقاطع على المقاطع المرشحة لتحقيق أقصى درجات الدقة قبل تجهيز السياق.",
    isPublished: true,
    rateLimitRpm: 60,
    timeoutMs: 10000,
    sortOrder: 2,
  },
  {
    id: "demo-retrieval-comparison-003",
    slug: "retrieval-comparison",
    type: "retrieval_comparison",
    titleEn: "Retrieval Architecture Benchmark",
    titleAr: "مقارنة وتصنيف معماريات الاسترجاع",
    descriptionEn:
      "Side-by-side comparison of Dense Vector vs Lexical Sparse vs Hybrid RRF latency, score curves, and hit overlaps.",
    descriptionAr:
      "مقارنة متوازية حية بين زمن استجابة المتجهات الكثيفة، البحث المعجمي، والبحث الهجين ومنحنيات الدقة.",
    isPublished: true,
    rateLimitRpm: 45,
    timeoutMs: 12000,
    sortOrder: 3,
  },
  {
    id: "demo-structured-extraction-004",
    slug: "structured-extraction",
    type: "structured_extraction",
    titleEn: "Structured Entity & Skill Extractor",
    titleAr: "مستخرج الكيانات والمهارات المهيكلة",
    descriptionEn:
      "Deterministic schema extraction pulling technologies, project metrics, and technical competencies into strict JSON.",
    descriptionAr:
      "استخراج محكم للمخططات يستخرج التقنيات والمقاييس والمهارات التقنية ضمن كائنات JSON متطابقة بنسبة 100%.",
    isPublished: true,
    rateLimitRpm: 30,
    timeoutMs: 15000,
    sortOrder: 4,
  },
  {
    id: "demo-citation-verification-005",
    slug: "citation-verification",
    type: "citation_verification",
    titleEn: "Grounded Citation & Hallucination Guard",
    titleAr: "مدقق التوثيق واكتشاف الادعاءات غير المسندة",
    descriptionEn:
      "Evaluates factual claims against portfolio ground truth chunks to detect unsupported assertions or hallucinations.",
    descriptionAr:
      "فحص حقيقي للادعاءات ومطابقتها مع مقاطع المحفظة المعتمدة لكشف الهلوسة والادعاءات غير المسندة بدقة.",
    isPublished: true,
    rateLimitRpm: 30,
    timeoutMs: 12000,
    sortOrder: 5,
  },
];
