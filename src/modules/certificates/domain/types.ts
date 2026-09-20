import { z } from "zod";

export interface CertificateItem {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  issuer: {
    en: string;
    ar: string;
  };
  issueDate: string;
  description: {
    en: string;
    ar: string;
  };
  imageUrl: string;
  credentialUrl?: string | undefined;
  credentialId?: string | undefined;
  skills: string[];
  isFeatured?: boolean | undefined;
  orderIndex: number;
}

export interface CertificatesConfig {
  certificates: CertificateItem[];
  updatedAt?: string | undefined;
}

export const certificateItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.object({
    en: z.string().min(1, "English title is required"),
    ar: z.string().min(1, "Arabic title is required"),
  }),
  issuer: z.object({
    en: z.string().min(1, "English issuer is required"),
    ar: z.string().min(1, "Arabic issuer is required"),
  }),
  issueDate: z.string().min(1, "Issue date is required"),
  description: z.object({
    en: z.string().min(1, "English description is required"),
    ar: z.string().min(1, "Arabic description is required"),
  }),
  imageUrl: z.string().min(1, "Certificate image URL is required"),
  credentialUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  credentialId: z.string().optional(),
  skills: z.array(z.string()).default([]),
  isFeatured: z.boolean().optional(),
  orderIndex: z.number().int().default(0),
});

export const certificatesConfigSchema = z.object({
  certificates: z.array(certificateItemSchema),
  updatedAt: z.string().optional(),
});

export const DEFAULT_CERTIFICATES: CertificateItem[] = [
  {
    id: "cert-rag-deeplearning",
    title: {
      en: "Building Multimodal Search & Hybrid RAG Systems",
      ar: "بناء أنظمة البحث متعدد الوسائط والاسترجاع المعزز بالتوليد (Hybrid RAG)",
    },
    issuer: {
      en: "DeepLearning.AI",
      ar: "ديب ليرنينغ دوت إيه آي (DeepLearning.AI)",
    },
    issueDate: "2024",
    description: {
      en: "Comprehensive mastery of advanced retrieval architectures, sparse and dense hybrid fusion (BGE-M3 + BM25), semantic reranking algorithms, and evaluation suites for production LLM applications.",
      ar: "إتقان متقدم لمعماريات الاسترجاع، دمج الفهارس الشعاعية والمعجمية (BGE-M3 و BM25)، خوارزميات إعادة الترتيب الدلالي (Reranking)، ومسارات التقييم المعياري لتطبيقات النماذج اللغوية الإنتاجية.",
    },
    imageUrl: "/images/certificates/cert-rag-systems.svg",
    credentialUrl: "https://www.deeplearning.ai/courses/",
    credentialId: "DLAI-RAG-2024-9981",
    skills: ["Hybrid RAG", "Vector Databases", "BGE-M3", "Dense Embeddings", "Evaluation"],
    isFeatured: true,
    orderIndex: 10,
  },
  {
    id: "cert-agentic-llms",
    title: {
      en: "Agentic AI Architectures & Autonomous LLM Workflows",
      ar: "معماريات الوكلاء الأذكياء ومسارات عمل نماذج اللغات المؤتمتة",
    },
    issuer: {
      en: "DeepLearning.AI & OpenAI",
      ar: "ديب ليرنينغ وأوبن إيه آي (DeepLearning.AI & OpenAI)",
    },
    issueDate: "2024",
    description: {
      en: "In-depth training on tool-calling, reflection loops, deterministic safety guardrails, state machine orchestration, and low-latency multi-agent collaboration frameworks.",
      ar: "تدريب مكثف على استدعاء الأدوات البرمجية، حلقات التفكير والتصحيح الذاتي، سياجات الأمان القطعية، وإدارة التعاون متعدد الوكلاء بزمن استجابة منخفض.",
    },
    imageUrl: "/images/certificates/cert-agentic-ai.svg",
    credentialUrl: "https://www.deeplearning.ai/",
    credentialId: "DLAI-AGENTIC-2024-4420",
    skills: ["AI Agents", "Tool Calling", "LangGraph", "Guardrails", "Python"],
    isFeatured: true,
    orderIndex: 20,
  },
  {
    id: "cert-deep-learning-stanford",
    title: {
      en: "Machine Learning & Deep Neural Networks Specialization",
      ar: "تخصص تعلّم الآلة والشبكات العصبية العميقة",
    },
    issuer: {
      en: "Stanford Online & Coursera",
      ar: "جامعة ستانفورد وكورسيرا (Stanford & Coursera)",
    },
    issueDate: "2023",
    description: {
      en: "Rigorous mathematical and practical grounding in deep neural architectures, gradient descent optimization, backpropagation, convolutional networks, and sequence models.",
      ar: "تأسيس رياضي وعملي معمق في الشبكات العصبية، خوارزميات تحسين الانحدار التدريجي، الانتشار العكسي، الشبكات الالتفافية ونماذج التسلسل الزمني.",
    },
    imageUrl: "/images/certificates/cert-machine-learning.svg",
    credentialUrl: "https://www.coursera.org/",
    credentialId: "COURSERA-ML-STANFORD-781",
    skills: ["Machine Learning", "Neural Networks", "PyTorch", "Mathematics", "Model Optimization"],
    isFeatured: true,
    orderIndex: 30,
  },
  {
    id: "cert-cloud-ai-architecture",
    title: {
      en: "Cloud Systems Architecture & Scalable AI Infrastructure",
      ar: "معمارية الأنظمة السحابية والبنى التحتية التوسعية للذكاء الاصطناعي",
    },
    issuer: {
      en: "Cloud Engineering Academy",
      ar: "أكاديمية الهندسة السحابية",
    },
    issueDate: "2023",
    description: {
      en: "Architecting resilient, latency-bounded cloud platforms, container orchestration, microservices communication, caching hierarchies, and continuous integration pipelines.",
      ar: "تصميم وإدارة منصات سحابية عالية الاعتمادية ومحدودة التأخير، تنسيق الحاويات، الاتصال بين الخدمات المصغرة، طبقات التخزين المؤقت، ومسارات النشر المؤتمتة.",
    },
    imageUrl: "/images/certificates/cert-cloud-systems.svg",
    credentialUrl: "https://aws.amazon.com/certification/",
    credentialId: "AWS-ARCH-2023-5519",
    skills: ["Cloud Architecture", "Docker", "PostgreSQL", "Redis", "Microservices", "CI/CD"],
    isFeatured: false,
    orderIndex: 40,
  },
];
