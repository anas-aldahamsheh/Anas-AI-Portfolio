import type { CertificateRelease } from "@/content/certificates";

/**
 * Work experience and education versioned with the code. A content release
 * (src/server/content/release.ts) makes both collections match these lists.
 */
type Entry = Omit<CertificateRelease, "orderIndex">;

const EXPERIENCE: Entry[] = [
  {
    slug: "itc-international-ai-engineer",
    data: {
      startDate: "2025-12",
      endDate: "",
      current: true,
      companyUrl: "",
      logo: "",
      technologies: [],
    },
    i18n: {
      en: {
        role: "AI Engineer",
        company: "ITC International",
        location: "",
        summary:
          "Build AI projects, chatbots and automation, red-team and evaluate AI models, and create training data.",
        highlights: [
          "Build LLM-powered applications, chatbots and Python automation workflows end to end, from prompt and pipeline design to integration and testing.",
          "Create training and evaluation datasets for AI models, writing challenging multilingual prompts across formats, languages and Arabic dialects to target known and new failure modes.",
          "Design adversarial test scenarios (AI red teaming) that probe LLM reliability, factual accuracy, hallucination, bias and unsafe behavior.",
          "Evaluate model outputs against a structured rubric (accuracy, relevance, completeness, neutrality, safety, source validation) and trace the root cause of each failure with supporting evidence.",
          "Deliver reproducible defect reports (prompt, response, weakness, recommended correction) that drive model improvements and technical investigation.",
        ],
      },
      ar: {
        role: "مهندس ذكاء اصطناعي",
        company: "ITC International",
        location: "",
        summary:
          "بناء مشاريع ذكاء اصطناعي وروبوتات محادثة وأدوات أتمتة، واختبار نماذج الذكاء الاصطناعي اختبارًا عدائيًا وتقييمها، وإعداد بيانات التدريب.",
        highlights: [
          "بناء تطبيقات وروبوتات محادثة تعتمد على النماذج اللغوية الكبيرة ومسارات أتمتة بلغة Python من البداية إلى النهاية، من تصميم الأوامر والمسارات إلى الدمج والاختبار.",
          "إعداد بيانات تدريب وتقييم لنماذج الذكاء الاصطناعي، بكتابة أوامر صعبة متعددة اللغات بصيغ ولغات ولهجات عربية مختلفة تستهدف مواطن الخلل المعروفة والجديدة.",
          "تصميم سيناريوهات اختبار عدائية (AI Red Teaming) تفحص موثوقية النماذج اللغوية ودقتها في الحقائق، وميلها إلى الهلوسة والتحيز والسلوك غير الآمن.",
          "تقييم مخرجات النماذج وفق معايير منظمة (الدقة، والصلة، والشمول، والحياد، والسلامة، وصحة المصادر)، وتتبّع السبب الجذري لكل خلل مع الأدلة الداعمة.",
          "تقديم تقارير أخطاء قابلة لإعادة التكرار (الأمر، والإجابة، ونقطة الضعف، والتصحيح المقترح) تقود تحسين النماذج والتحقيق التقني.",
        ],
      },
    },
  },
  {
    slug: "bigo-live-content-security-moderator",
    data: {
      startDate: "2023-04",
      endDate: "2025-12",
      current: false,
      companyUrl: "",
      logo: "",
      technologies: [],
    },
    i18n: {
      en: {
        role: "Content Security Moderator",
        company: "BIGO Live",
        location: "",
        summary:
          "Kept the platform safe by reviewing live-stream and user-generated content against community guidelines.",
        highlights: [
          "Reviewed live-stream and user-generated content, identifying harmful material and policy violations and applying community guidelines to keep the platform safe.",
          "Worked with the team to sharpen policy interpretation and reporting practices, experience that now underpins AI safety and evaluation work.",
        ],
      },
      ar: {
        role: "مشرف أمن المحتوى",
        company: "BIGO Live",
        location: "",
        summary:
          "الحفاظ على سلامة المنصة بمراجعة البث المباشر والمحتوى الذي ينشئه المستخدمون وفق إرشادات المجتمع.",
        highlights: [
          "مراجعة البث المباشر والمحتوى الذي ينشئه المستخدمون، وكشف المواد الضارة ومخالفات السياسات، وتطبيق إرشادات المجتمع للحفاظ على سلامة المنصة.",
          "العمل مع الفريق على تحسين تفسير السياسات وممارسات الإبلاغ، وهي خبرة يقوم عليها اليوم العمل في سلامة الذكاء الاصطناعي وتقييمه.",
        ],
      },
    },
  },
];

const EDUCATION: Entry[] = [
  {
    slug: "bsc-computer-engineering",
    data: { startDate: "", endDate: "2025", url: "" },
    i18n: {
      en: {
        degree: "Bachelor of Science in Computer Engineering",
        institution: "Al-Balqa Applied University, Faculty of Engineering Technology",
        location: "Amman, Jordan",
        summary: "",
        highlights: [],
      },
      ar: {
        degree: "بكالوريوس العلوم في هندسة الحاسوب",
        institution: "جامعة البلقاء التطبيقية، كلية الهندسة التكنولوجية",
        location: "عمّان، الأردن",
        summary: "",
        highlights: [],
      },
    },
  },
];

const withOrder = (entries: Entry[]) =>
  entries.map((entry, orderIndex) => ({ ...entry, orderIndex }));

export const experienceEntries = () => withOrder(EXPERIENCE);
export const educationEntries = () => withOrder(EDUCATION);
