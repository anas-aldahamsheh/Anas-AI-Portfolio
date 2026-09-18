import { AdminPageItem, ContentCenterSummary } from "../domain/content-center";

export const BASELINE_ADMIN_PAGES: AdminPageItem[] = [
  {
    id: "page-home",
    slug: "home",
    status: "PUBLISHED",
    isHome: true,
    orderIndex: 0,
    translations: {
      ar: {
        title: "الرئيسية | أنس - مهندس ذكاء اصطناعي",
        metaDescription: "معرض أعمال وهندسة أنظمة الذكاء الاصطناعي التوليدي والبحث الدلالي",
      },
      en: {
        title: "Home | Anas - AI Engineer & Systems Architect",
        metaDescription: "Production portfolio featuring end-to-end generative AI and vector retrieval",
      },
    },
    sectionsCount: 5,
    updatedAt: "2026-09-18T12:00:00Z",
  },
  {
    id: "page-projects",
    slug: "projects",
    status: "PUBLISHED",
    isHome: false,
    orderIndex: 1,
    translations: {
      ar: {
        title: "المشاريع الهندسية",
        metaDescription: "استكشف المشاريع المتقدمة في معالجة اللغات الطبيعية والرؤية الحاسوبية",
      },
      en: {
        title: "Engineering Projects",
        metaDescription: "Explore production deep dives across NLP, computer vision, and distributed systems",
      },
    },
    sectionsCount: 3,
    updatedAt: "2026-09-18T14:30:00Z",
  },
  {
    id: "page-cv",
    slug: "cv",
    status: "PUBLISHED",
    isHome: false,
    orderIndex: 2,
    translations: {
      ar: {
        title: "السيرة الذاتية المعتمدة",
        metaDescription: "استعراض وتحميل السيرة الذاتية الهندسية المحدثة",
      },
      en: {
        title: "Verified Curriculum Vitae",
        metaDescription: "View and download verified engineering resume and career track record",
      },
    },
    sectionsCount: 2,
    updatedAt: "2026-09-18T15:00:00Z",
  },
  {
    id: "page-lab",
    slug: "lab",
    status: "PUBLISHED",
    isHome: false,
    orderIndex: 3,
    translations: {
      ar: {
        title: "مختبر الذكاء الاصطناعي التفاعلي",
        metaDescription: "تجارب حية على استرجاع المتجهات، خوارزميات BM25، وإعادة الترتيب",
      },
      en: {
        title: "Interactive AI Lab",
        metaDescription: "Live benchmarks across vector retrieval, BM25, and cross-encoder rerankers",
      },
    },
    sectionsCount: 2,
    updatedAt: "2026-09-18T16:00:00Z",
  },
  {
    id: "page-evaluation",
    slug: "evaluation",
    status: "PUBLISHED",
    isHome: false,
    orderIndex: 4,
    translations: {
      ar: {
        title: "لوحة تقييم النماذج وجودة الاسترجاع",
        metaDescription: "معايير الأداء والشفافية لنظام RAG ومقاييس الأمانة والاستشهادات",
      },
      en: {
        title: "AI Evaluation & RAG Transparency Dashboard",
        metaDescription: "Benchmark metrics, faithfulness scores, and bilingual parity",
      },
    },
    sectionsCount: 3,
    updatedAt: "2026-09-18T16:30:00Z",
  },
  {
    id: "page-job-fit",
    slug: "job-fit",
    status: "PUBLISHED",
    isHome: false,
    orderIndex: 5,
    translations: {
      ar: {
        title: "محلل الملاءمة الوظيفية الذكي",
        metaDescription: "مطابقة متطلبات الوظيفة مع أدلة وخبرات معرض الأعمال بدقة وأمانة",
      },
      en: {
        title: "AI Job Fit Analyzer",
        metaDescription: "Deterministic evidence matching between job descriptions and portfolio achievements",
      },
    },
    sectionsCount: 2,
    updatedAt: "2026-09-18T17:00:00Z",
  },
];

export const BASELINE_CONTENT_SUMMARY: ContentCenterSummary = {
  pages: BASELINE_ADMIN_PAGES,
  totalPublishedPages: 6,
  totalDraftPages: 0,
  totalSections: 17,
  totalProjects: 4,
  pendingDraftCount: 0,
};
