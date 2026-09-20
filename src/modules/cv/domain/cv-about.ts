import { z } from "zod";

export interface CvAboutItem {
  badge: string;
  name: string;
  headline: string;
  paragraphs: string[];
}

export interface CvAboutConfig {
  en: CvAboutItem;
  ar: CvAboutItem;
  updatedAt?: string | undefined;
}

export const cvAboutItemSchema = z.object({
  badge: z.string().min(1, "Badge is required"),
  name: z.string().min(1, "Name is required"),
  headline: z.string().min(1, "Headline is required"),
  paragraphs: z.array(z.string().min(1, "Paragraph cannot be empty")).min(1, "At least one paragraph is required"),
});

export const cvAboutConfigSchema = z.object({
  en: cvAboutItemSchema,
  ar: cvAboutItemSchema,
  updatedAt: z.string().optional(),
});

export const DEFAULT_CV_ABOUT: CvAboutConfig = {
  en: {
    badge: "About Me",
    name: "Anas Al Dahamsheh",
    headline: "AI & Software Engineer focused on reliable, production-grade intelligence",
    paragraphs: [
      "I am an AI & Software Engineer with a Computer Engineering foundation. My primary focus is bridging the gap between cutting-edge AI research and building reliable, latency-bounded, and cost-efficient production software.",
      "In building LLM applications and agentic workflows, I believe the real engineering challenge is not making API calls — it is ensuring strict evidence grounding, eliminating hallucinations, minimizing retrieval latency, and building reproducible evaluation suites that prove system reliability.",
      "I value simplicity, clean architecture, and rigorous testing. Whether engineering a hybrid dense/sparse RAG pipeline, writing low-latency edge daemons in Rust, or crafting accessible bilingual interfaces, my goal is to deliver durable engineering solutions that solve concrete business challenges.",
    ],
  },
  ar: {
    badge: "نبذة عني",
    name: "أنس الدحامشة",
    headline: "مهندس ذكاء اصطناعي وبرمجيات شغوف بالأنظمة الإنتاجية عالية الاعتمادية",
    paragraphs: [
      "أنا مهندس برمجيات وذكاء اصطناعي بخلفية في هندسة الحاسوب. أركز جهودي على الجسر الفاصل بين أحدث أبحاث نماذج الذكاء الاصطناعي وبين تحويلها إلى أنظمة برمجية متكاملة، آمنة، وعالية الأداء تعمل بكفاءة على أرض الواقع.",
      "خلال عملي على الأنظمة المعتمدة على النماذج اللغوية الكبيرة (LLMs)، لاحظت أن التحدي الحقيقي ليس مجرد استدعاء واجهات الـ API، بل في ضمان ربط الإجابات بالحقائق (Grounding)، منع الهلوسة، تقليص أزمنة الاستجابة، وبناء مسارات تقييم قطعية تضمن الجودة قبل النشر إلى المستخدمين.",
      "أؤمن بأن الكود الممتاز هو الكود البسيط، الموثق، والمختبر جيداً. سواء كنت أصمم محرك استرجاع هجين (Hybrid RAG)، أو أبني خادم حافة عالي الأداء بلغة Rust، أو أطور واجهات تفاعلية متجاوبة ثنائية اللغة، فإن هدفي الدائم هو تقديم حلول برمجية مستدامة تضيف قيمة مباشرة للأعمال.",
    ],
  },
};
