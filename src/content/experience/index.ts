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
          "Responsible for designing adversarial test scenarios, evaluating model responses, and identifying safety, bias, and accuracy vulnerabilities to improve AI system reliability and robustness.",
        highlights: [
          "Create sophisticated questions and test scenarios to assess AI system behavior across realistic use cases.",
          "Evaluate model responses and assign scores using structured criteria for accuracy, relevance, and safety.",
          "Test model behavior on topics such as religion, politics, intelligence, and general knowledge to identify gaps in response quality.",
          "Apply AI red teaming and software testing techniques to reveal vulnerabilities that do not appear in standard evaluations.",
          "Use adversarial prompts and realistic situations to expose unsafe, biased, or inaccurate outputs and support problem decomposition during investigations.",
          "Measure each interaction for accuracy, relevance, comprehensiveness, neutrality, and source validation before accepting results.",
          "Document issues with the original prompt, model answer, identified problem, evidence, and recommended solution to support clear technical follow-up.",
          "Repeat attempts in different formats, languages, and dialects to ensure thorough coverage.",
        ],
      },
      ar: {
        role: "مهندس ذكاء اصطناعي",
        company: "ITC International",
        location: "",
        summary:
          "مسؤول عن تصميم سيناريوهات اختبار عدائية، وتقييم إجابات النماذج، وكشف الثغرات المتعلقة بالسلامة والتحيز والدقة، بهدف رفع موثوقية أنظمة الذكاء الاصطناعي ومتانتها.",
        highlights: [
          "إعداد أسئلة وسيناريوهات اختبار متقدمة لتقييم سلوك أنظمة الذكاء الاصطناعي في حالات استخدام واقعية.",
          "تقييم إجابات النماذج ومنحها درجات وفق معايير منظمة للدقة والصلة بالسؤال والسلامة.",
          "اختبار سلوك النماذج في موضوعات مثل الدين والسياسة والذكاء والمعرفة العامة لكشف مواطن الضعف في جودة الإجابات.",
          "تطبيق أساليب الاختبار العدائي للذكاء الاصطناعي (AI Red Teaming) واختبار البرمجيات لكشف ثغرات لا تظهر في التقييمات المعتادة.",
          "استخدام أوامر عدائية ومواقف واقعية لكشف المخرجات غير الآمنة أو المتحيزة أو غير الدقيقة، ودعم تفكيك المشكلات أثناء التحقيق فيها.",
          "قياس كل تفاعل من حيث الدقة والصلة والشمول والحياد وصحة المصادر قبل اعتماد النتائج.",
          "توثيق المشكلات بالأمر الأصلي وإجابة النموذج والمشكلة المكتشفة والدليل والحل المقترح، بما يتيح متابعة تقنية واضحة.",
          "إعادة المحاولات بصيغ ولغات ولهجات مختلفة لضمان تغطية شاملة.",
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
          "Responsible for moderating content and ensuring compliance with community guidelines on the BIGO (Net Star) platform.",
        highlights: [
          "Monitored and reviewed user-generated content, addressing violations related to inappropriate behavior, harmful content, and community standards.",
          "Collaborated with the team to improve content policies and reporting mechanisms.",
          "Ensured the overall safety and quality of the user experience on the platform.",
        ],
      },
      ar: {
        role: "مشرف أمن المحتوى",
        company: "BIGO Live",
        location: "",
        summary:
          "مسؤول عن الإشراف على المحتوى وضمان الالتزام بإرشادات المجتمع على منصة BIGO (Net Star).",
        highlights: [
          "مراقبة المحتوى الذي ينشئه المستخدمون ومراجعته، ومعالجة المخالفات المتعلقة بالسلوك غير اللائق والمحتوى الضار ومعايير المجتمع.",
          "التعاون مع الفريق لتحسين سياسات المحتوى وآليات الإبلاغ.",
          "ضمان سلامة تجربة المستخدم وجودتها على المنصة بوجه عام.",
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
        degree: "Bachelor's Degree, Computer Engineering",
        institution: "Al-Balqa Applied University, Faculty of Engineering Technology",
        location: "",
        summary: "",
        highlights: [],
      },
      ar: {
        degree: "بكالوريوس هندسة الحاسوب",
        institution: "جامعة البلقاء التطبيقية، كلية الهندسة التكنولوجية",
        location: "",
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
