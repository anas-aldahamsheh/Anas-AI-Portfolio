import type { CertificateRelease } from "@/content/certificates";
import { OWNER_NAME } from "@/lib/owner-name";

/**
 * The profile, skills and CV versioned with the code, written from the current CV
 * (public/cv). A content release (src/server/content/release.ts) applies them.
 */

export const CV_FILE = "/cv/Anas_Al_Dahamsheh_AI_Engineer_CV.pdf";
export const CV_FILE_NAME = "Anas_Al_Dahamsheh_AI_Engineer_CV.pdf";
/** Text of the CV for the assistant, extracted from the PDF (regenerate with pdftotext). */
export const CV_TEXT_FILE = "src/content/profile/cv.txt";

export const PROFILE = {
  data: {
    email: "anasaldahamsheh@outlook.com",
    phone: "+962 789495167",
    showPhone: true,
    github: "https://github.com/anas-aldahamsheh",
    linkedin: "https://www.linkedin.com/in/anas-aldahamsheh",
    website: "",
    cv: CV_FILE,
    cvFileName: CV_FILE_NAME,
    openToWork: true,
  },
  i18n: {
    en: {
      name: OWNER_NAME.en,
      headline: "AI Engineer",
      roles: ["AI Engineer", "LLM, RAG & AI Agents", "Full-Stack Developer"],
      tagline:
        "I build production-ready LLM applications end to end: RAG, AI agents with tool calling, chatbots, automation and LLM evaluation.",
      summary:
        "I'm an AI Engineer who builds production-ready large language model (LLM) applications end to end: retrieval-augmented generation (RAG), AI agents with tool calling, chatbots, automation and LLM evaluation, backed by full-stack delivery in Python (FastAPI) and TypeScript (React, Next.js). At ITC International, I build AI projects, chatbots and automation, red-team and evaluate AI models, and create training data. I independently designed and shipped 10 bilingual (English/Arabic) applications. I work test-driven, with a trust-and-safety background that shapes reliable, responsible AI.",
      about: [
        "I'm an AI Engineer based in Amman, Jordan, with a Bachelor of Science in Computer Engineering from Al-Balqa Applied University (2025). I build large language model applications end to end: retrieval-augmented generation (RAG), AI agents with tool calling, chatbots, automation and LLM evaluation, with full-stack delivery in Python (FastAPI) and TypeScript (React, Next.js).",
        "At ITC International I build LLM-powered applications, chatbots and Python automation workflows, create training and evaluation datasets in several languages and Arabic dialects, and red-team and evaluate AI models against a structured rubric. Before that, I was a Content Security Moderator at BIGO Live from 2023 to 2025, a trust-and-safety background that now underpins my AI safety and evaluation work.",
        "On my own I designed and shipped 10 bilingual (English/Arabic) applications. They include Noesis, a hybrid-search research assistant that ranks the correct passage first 93.9% of the time with a 54 ms median search over about 97,000 passages, and Corpusforge, an agentic platform that generates verified fine-tuning datasets. I work test-driven.",
      ],
      location: "Amman, Jordan",
      availability: "Open to AI engineering roles, remote or hybrid.",
    },
    ar: {
      name: OWNER_NAME.ar,
      headline: "مهندس ذكاء اصطناعي",
      roles: [
        "مهندس ذكاء اصطناعي",
        "النماذج اللغوية وRAG ووكلاء الذكاء الاصطناعي",
        "مطور تطبيقات متكاملة (Full-Stack)",
      ],
      tagline:
        "أبني تطبيقات نماذج لغوية جاهزة للإنتاج من البداية إلى النهاية: RAG، ووكلاء ذكاء اصطناعي يستدعون الأدوات، وروبوتات محادثة، وأتمتة، وتقييم النماذج اللغوية.",
      summary:
        "مهندس ذكاء اصطناعي أبني تطبيقات النماذج اللغوية الكبيرة (LLM) الجاهزة للإنتاج من البداية إلى النهاية: التوليد المعزز بالاسترجاع (RAG)، ووكلاء الذكاء الاصطناعي الذين يستدعون الأدوات، وروبوتات المحادثة، والأتمتة، وتقييم النماذج اللغوية، مع تطوير متكامل بلغة Python (FastAPI) وTypeScript (React وNext.js). في ITC International أبني مشاريع ذكاء اصطناعي وروبوتات محادثة وأدوات أتمتة، وأختبر نماذج الذكاء الاصطناعي اختبارًا عدائيًا وأقيّمها، وأُعدّ بيانات التدريب. صمّمت وأطلقت بشكل مستقل 10 تطبيقات ثنائية اللغة (عربي/إنجليزي). أعمل بأسلوب يقوده الاختبار، وخلفيتي في الثقة والأمان تجعل ما أبنيه موثوقًا ومسؤولًا.",
      about: [
        "أنا مهندس ذكاء اصطناعي مقيم في عمّان، الأردن، وحاصل على بكالوريوس العلوم في هندسة الحاسوب من جامعة البلقاء التطبيقية (2025). أبني تطبيقات النماذج اللغوية الكبيرة من البداية إلى النهاية: التوليد المعزز بالاسترجاع (RAG)، ووكلاء الذكاء الاصطناعي الذين يستدعون الأدوات، وروبوتات المحادثة، والأتمتة، وتقييم النماذج اللغوية، مع تطوير متكامل بلغة Python (FastAPI) وTypeScript (React وNext.js).",
        "في ITC International أبني تطبيقات وروبوتات محادثة تعتمد على النماذج اللغوية وأتمتة بلغة Python، وأُعدّ بيانات تدريب وتقييم بعدة لغات ولهجات عربية، وأختبر نماذج الذكاء الاصطناعي اختبارًا عدائيًا وأقيّمها وفق معايير منظمة. وقبل ذلك عملت مشرفًا لأمن المحتوى في BIGO Live من 2023 إلى 2025، وهي خلفية في الثقة والأمان يقوم عليها اليوم عملي في سلامة الذكاء الاصطناعي وتقييمه.",
        "صمّمت وأطلقت بنفسي 10 تطبيقات ثنائية اللغة (عربي/إنجليزي)، منها Noesis، مساعد بحث يعتمد على البحث الهجين يضع المقطع الصحيح أولًا بنسبة 93.9% وبزمن بحث وسيط 54 مللي ثانية في حوالي 97 ألف مقطع، وCorpusforge، منصة وكلاء تولّد بيانات ضبط دقيق موثقة. وأعمل بأسلوب يقوده الاختبار.",
      ],
      location: "عمّان، الأردن",
      availability: "متاح لوظائف هندسة الذكاء الاصطناعي، عن بُعد أو بشكل هجين.",
    },
  },
};

type Entry = Omit<CertificateRelease, "orderIndex">;

const group = (slug: string, icon: string, en: string, ar: string, items: string[]): Entry => ({
  slug,
  data: { icon, items },
  i18n: { en: { title: en, description: "" }, ar: { title: ar, description: "" } },
});

/** The CV's Technical Skills section, group by group. */
const SKILL_GROUPS: Entry[] = [
  group("programming-languages", "code", "Programming Languages", "لغات البرمجة", [
    "Python",
    "TypeScript",
    "JavaScript",
    "SQL",
    "HTML",
    "CSS",
  ]),
  group(
    "generative-ai-llms",
    "sparkles",
    "Generative AI & LLMs",
    "الذكاء الاصطناعي التوليدي والنماذج اللغوية",
    [
      "LLM application development",
      "RAG",
      "AI agents",
      "Agentic workflows",
      "Tool/function calling",
      "Chatbots",
      "Prompt engineering",
      "Structured outputs",
      "LangChain",
      "LangGraph",
      "LlamaIndex",
      "Model Context Protocol (MCP)",
      "Gemini API",
      "OpenAI API",
      "Ollama",
    ],
  ),
  group("machine-learning", "cpu", "Machine Learning", "تعلّم الآلة", [
    "PyTorch",
    "Hugging Face Transformers",
    "scikit-learn",
    "Fine-tuning (LoRA)",
    "NumPy",
    "pandas",
  ]),
  group(
    "llm-evaluation-safety",
    "shield",
    "LLM Evaluation & Safety",
    "تقييم النماذج اللغوية وسلامتها",
    [
      "AI red teaming",
      "LLM evaluation",
      "Hallucination and grounding checks",
      "Citation verification",
      "Rubric-based scoring",
      "Bias and safety testing",
      "Training data creation",
    ],
  ),
  group(
    "retrieval-nlp-data",
    "database",
    "Retrieval, NLP & Data",
    "الاسترجاع ومعالجة اللغة والبيانات",
    [
      "Embeddings",
      "Vector search",
      "Hybrid search (BM25 + dense)",
      "HNSW",
      "pgvector",
      "RRF",
      "MMR",
      "Arabic NLP",
      "Language detection",
      "Near-duplicate detection",
      "Web scraping",
      "Fine-tuning dataset generation",
    ],
  ),
  group("backend", "terminal", "Backend", "الواجهات الخلفية", [
    "FastAPI",
    "Node.js",
    "REST APIs",
    "Async Python",
    "Pydantic",
    "SQLAlchemy",
    "Alembic",
    "WebSockets",
    "Server-sent events",
    "JWT authentication",
    "Rate limiting",
    "Automation",
  ]),
  group("frontend", "layers", "Frontend", "الواجهات الأمامية", [
    "React",
    "Next.js",
    "Tailwind CSS",
    "Zustand",
    "TanStack Query",
    "Responsive English/Arabic (RTL) interfaces",
  ]),
  group("databases-devops", "rocket", "Databases & DevOps", "قواعد البيانات وDevOps", [
    "PostgreSQL",
    "SQLite",
    "Redis",
    "Prisma",
    "Docker",
    "Docker Compose",
    "AWS (EC2, S3, Lambda)",
    "Git",
    "GitHub Actions (CI/CD)",
    "Netlify",
    "Vercel",
  ]),
  group("testing", "globe", "Testing", "الاختبار", [
    "pytest",
    "Vitest",
    "Playwright",
    "End-to-end testing",
    "Accessibility testing (axe-core)",
  ]),
];

export const skillGroupEntries = () =>
  SKILL_GROUPS.map((entry, orderIndex) => ({ ...entry, orderIndex }));
