/**
 * Certificates versioned with the code. A content release (src/server/content/release.ts) makes
 * the certificate collection match this list. Each one links its original file and a preview.
 */
export interface CertificateRelease {
  slug: string;
  orderIndex: number;
  data: Record<string, unknown>;
  i18n: Record<string, Record<string, unknown>>;
}

const IBM_EN = "IBM SkillsBuild";
const IBM_AR = "IBM SkillsBuild";

const CERTIFICATES: Omit<CertificateRelease, "orderIndex">[] = [
  {
    slug: "dot-full-stack-development",
    data: {
      issueDate: "2026-05",
      credentialId: "DOT-AM-FS-2-25-YGA-An-0526",
      credentialUrl: "",
      image: "/images/certificates/dot-full-stack-development.webp",
      file: "/certificates/dot-full-stack-development.pdf",
      skills: [
        "Full-Stack Development",
        "Web Development",
        "Front-End Development",
        "Back-End Web Development",
        "HTML5",
        "Cascading Style Sheets (CSS)",
        "JavaScript",
        "React.js",
        "Node.js",
        "REST APIs",
        "API Development",
        "Database Development",
        "SQL",
        "NoSQL",
        "MongoDB",
        "Database Management System (DBMS)",
        "Git",
        "GitHub",
        "Version Control",
        "Responsive Web Design",
        "Object-Oriented Programming (OOP)",
        "Tailwind CSS",
        "Bootstrap (Framework)",
      ],
      featured: true,
    },
    i18n: {
      en: {
        title: "Full Stack Development Training (130 Hours)",
        issuer: "Digital Opportunity Trust (DOT) Jordan",
        description:
          "Certificate of Completion for 130 hours of Full Stack Development Training, implemented by Digital Opportunity Trust (DOT) Jordan.",
      },
      ar: {
        title: "تدريب تطوير تطبيقات الويب المتكاملة (Full Stack) بواقع 130 ساعة",
        issuer: "منظمة الثقة للفرص الرقمية (DOT) في الأردن",
        description:
          "شهادة إتمام 130 ساعة من التدريب على تطوير تطبيقات الويب المتكاملة (Full Stack)، نفّذته منظمة الثقة للفرص الرقمية (DOT) في الأردن.",
      },
    },
  },
  {
    slug: "ibm-rag-enhanced-ai-outputs",
    data: {
      issueDate: "2026-09",
      credentialId: "8f0ec5ed-e956-4c75-b13b-4a054eea8746",
      credentialUrl: "https://www.credly.com/go/34c3Hpqa",
      image: "/images/certificates/ibm-rag-enhanced-ai-outputs.webp",
      file: "/certificates/ibm-rag-enhanced-ai-outputs.pdf",
      skills: [
        "Retrieval-augmented Generation (RAG)",
        "RAG Workflow",
        "RAG Implementation Techniques",
        "RAG Best Practices",
        "RAG Metrics",
        "Text Generation",
        "Generative AI",
        "Analytical Thinking",
        "Problem Solving",
      ],
      featured: true,
    },
    i18n: {
      en: {
        title: "Retrieval-Augmented Generation for Enhanced AI Outputs",
        issuer: IBM_EN,
        description:
          "Implementing a document-based RAG system that improves LLM responses with dynamic knowledge sources: the RAG workflow for content generation, the differences between naive, advanced and modular RAG, and best practices for better outputs and for overcoming common RAG challenges.",
      },
      ar: {
        title: "التوليد المعزز بالاسترجاع (RAG) لتحسين مخرجات الذكاء الاصطناعي",
        issuer: IBM_AR,
        description:
          "بناء نظام RAG قائم على المستندات يحسّن إجابات النماذج اللغوية الكبيرة بمصادر معرفة متجددة، مع فهم مسار عمل RAG في توليد المحتوى، والفرق بين أساليب RAG البسيطة والمتقدمة والمعيارية، وأفضل الممارسات لتحسين المخرجات وتجاوز تحديات هذه الأنظمة.",
      },
    },
  },
  {
    slug: "ibm-craft-precise-prompts",
    data: {
      issueDate: "2026-09",
      credentialId: "052423f8-2571-4179-9526-b7ef6541cab8",
      credentialUrl: "https://www.credly.com/go/z4uIiwVL",
      image: "/images/certificates/ibm-craft-precise-prompts.webp",
      file: "/certificates/ibm-craft-precise-prompts.pdf",
      skills: [
        "Prompt Engineering",
        "Prompt Engineering Techniques",
        "Prompt Engineering Best Practices",
        "Prompt Templates",
        "Prompt Variables",
        "Generative AI",
        "Analytical Thinking",
        "Problem Solving",
      ],
      featured: false,
    },
    i18n: {
      en: {
        title: "Craft Precise Prompts for AI Models",
        issuer: IBM_EN,
        description:
          "Writing prompts that get reliable output from large language models: identifying use cases for prompt engineering, choosing the right technique, applying best practices, and building reusable prompt templates with variables.",
      },
      ar: {
        title: "صياغة أوامر دقيقة لنماذج الذكاء الاصطناعي",
        issuer: IBM_AR,
        description:
          "كتابة أوامر (Prompts) تحصل على مخرجات موثوقة من النماذج اللغوية الكبيرة: تحديد حالات استخدام هندسة الأوامر، واختيار الأسلوب المناسب، وتطبيق أفضل الممارسات، وبناء قوالب أوامر قابلة لإعادة الاستخدام باستخدام المتغيرات.",
      },
    },
  },
  {
    slug: "ibm-generative-ai-essentials-llms-data",
    data: {
      issueDate: "2026-09",
      credentialId: "7bd3cedb-1625-43e5-9447-cee368d52dec",
      credentialUrl: "https://www.credly.com/go/bO6uJzyH",
      image: "/images/certificates/ibm-generative-ai-essentials-llms-data.webp",
      file: "/certificates/ibm-generative-ai-essentials-llms-data.pdf",
      skills: [
        "Large Language Models (LLMs)",
        "Data Classification",
        "Sentiment Analysis",
        "Data Analysis",
        "Generative AI",
        "AI Prompting Techniques",
        "IBM watsonx",
        "IBM Granite",
        "Analytical Thinking",
        "Problem Solving",
      ],
      featured: false,
    },
    i18n: {
      en: {
        title: "Generative AI Essentials: Using LLMs to Work with Data",
        issuer: IBM_EN,
        description:
          "The fundamentals of data classification with IBM tools, and applying large language models to practical tasks such as summarizing meetings and classifying customer reviews.",
      },
      ar: {
        title:
          "أساسيات الذكاء الاصطناعي التوليدي: استخدام النماذج اللغوية الكبيرة في التعامل مع البيانات",
        issuer: IBM_AR,
        description:
          "أساسيات تصنيف البيانات باستخدام أدوات IBM، وتطبيق النماذج اللغوية الكبيرة على مهام عملية مثل تلخيص الاجتماعات وتصنيف تقييمات العملاء.",
      },
    },
  },
  {
    slug: "ibm-getting-started-with-generative-ai",
    data: {
      issueDate: "2026-09",
      credentialId: "55c6381d-9295-4400-b95e-898084a44558",
      credentialUrl: "https://www.credly.com/go/ol1N0OcM",
      image: "/images/certificates/ibm-getting-started-with-generative-ai.webp",
      file: "/certificates/ibm-getting-started-with-generative-ai.pdf",
      skills: [
        "Generative AI",
        "Large Language Models",
        "AI Ethics",
        "AI Prompting Techniques",
        "IBM Granite",
        "IBM AI Risk Atlas",
        "Manage Risk",
        "Analytical Thinking",
        "Problem Solving",
      ],
      featured: false,
    },
    i18n: {
      en: {
        title: "Getting Started with Generative AI",
        issuer: IBM_EN,
        description:
          "Foundational concepts of generative AI, AI ethics as they relate to it and its risks and remedies in the IBM AI Risk Atlas, and using large language models in practical scenarios such as customer service and content creation, with a focus on guiding IBM Granite models.",
      },
      ar: {
        title: "مدخل إلى الذكاء الاصطناعي التوليدي",
        issuer: IBM_AR,
        description:
          "المفاهيم الأساسية للذكاء الاصطناعي التوليدي، وأخلاقياته ومخاطره وسبل معالجتها وفق أطلس مخاطر الذكاء الاصطناعي من IBM، واستخدام النماذج اللغوية الكبيرة في سيناريوهات عملية مثل خدمة العملاء وصناعة المحتوى، مع التركيز على توجيه نماذج IBM Granite بفعالية.",
      },
    },
  },
];

export function certificateEntries(): CertificateRelease[] {
  return CERTIFICATES.map((entry, orderIndex) => ({ ...entry, orderIndex }));
}
