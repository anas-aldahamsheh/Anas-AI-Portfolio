import type { SectionData } from "../domain/sections";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

export function getDefaultHomeSections(locale: SupportedLocale): SectionData[] {
  const isAr = locale === "ar";

  return [
    // 1. Hero Section
    {
      id: "sec-hero",
      pageId: "page-home",
      sectionType: "hero",
      orderIndex: 10,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "أنس الدحامشة" : "Anas Al Dahamsheh",
      subtitle: isAr ? "مهندس ذكاء اصطناعي وبرمجيات" : "AI & Software Engineer",
      blocks: [
        {
          id: "blk-hero-heading",
          blockType: "heading",
          orderIndex: 10,
          isVisible: true,
          config: { level: "h1", align: "start" },
          content: {
            text: isAr ? "أنس الدحامشة" : "Anas Al Dahamsheh",
            subtitle: isAr
              ? "مهندس برمجيات متخصص في بناء وتطوير أنظمة الذكاء الاصطناعي الإنتاجية، مسارات تقييم النماذج (Evaluation)، أدوات الأتمتة، وتطبيقات الويب السحابية القابلة للتوسع."
              : "I build production-grade AI systems, evaluation pipelines, automation tools, and scalable, resilient web applications.",
          },
        },
        {
          id: "blk-hero-cta",
          blockType: "cta",
          orderIndex: 20,
          isVisible: true,
          config: { align: "start" },
          content: {
            items: [
              {
                label: isAr ? "استكشف المشاريع" : "View Projects",
                url: "/projects",
                variant: "primary",
              },
              {
                label: isAr ? "السيرة الذاتية" : "Download Resume",
                url: "/cv",
                variant: "secondary",
              },
              {
                label: isAr ? "تواصل معي" : "Contact Me",
                url: "/contact",
                variant: "outline",
              },
            ],
          },
        },
      ],
    },

    // 2. Featured Projects Section
    {
      id: "sec-featured-projects",
      pageId: "page-home",
      sectionType: "projects",
      orderIndex: 20,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "مشاريع هندسية مختارة" : "Selected Projects",
      subtitle: isAr
        ? "مشاريع إنتاجية واقعية تثبت القدرة على حل مشكلات الاسترجاع، زمن استجابة الحافة، والتدفق الصوتي."
        : "Production architectures built to solve real-world retrieval, edge latency, and speech streaming challenges.",
      blocks: [
        {
          id: "blk-featured-cards",
          blockType: "card_collection",
          orderIndex: 10,
          isVisible: true,
          config: { columns: "3" },
          content: {
            columns: "3",
            items: [
              {
                id: "card-rag-engine",
                title: isAr
                  ? "محرك استرجاع متعدد الوسائط مؤتمت (RAG)"
                  : "Autonomous Multimodal RAG Engine",
                description: isAr
                  ? "بحث هجين يدمج التضمين الشعاعي الكثيف (BGE-M3) والفهرسة المعجمية مع دقة اقتباس 99.4% وزمن استجابة 180ms."
                  : "Hybrid vector search combining dense embeddings (BGE-M3), lexical index, and RRF reranking. 99.4% citation accuracy, 180ms P95 latency.",
                badge: "RAG / AI",
                url: "/projects/autonomous-rag-engine",
                icon: "folder-git-2",
              },
              {
                id: "card-edge-router",
                title: isAr
                  ? "بوابة الطرفية المؤسسية وموجّه السياسات"
                  : "Enterprise Edge Gateway & Policy Router",
                description: isAr
                  ? "خادم مصغر بلغة Rust يطبق ضوابط الوصول المشفرة Ed25519 بزمن قرار يقل عن 3ms تحت 50,000 طلب/ثانية."
                  : "Embedded Rust daemon enforcing cryptographic RBAC with sub-3ms P99 decision latency under 50,000 requests/sec.",
                badge: "Rust / Systems",
                url: "/projects/enterprise-policy-router",
                icon: "folder-git-2",
              },
              {
                id: "card-speech-stream",
                title: isAr
                  ? "منظومة معالجة وتوليد الصوت العصبي الحي"
                  : "Real-Time Neural Speech & Synthesis Pipeline",
                description: isAr
                  ? "تدفق صوتي ثنائي الاتجاه بزمن استجابة أقل من 150ms يدمج WebRTC مع نماذج التوليد الصوتي العصبي."
                  : "Sub-150ms bidirectional voice conversation stream integrating WebRTC with low-latency neural speech models.",
                badge: "Audio / Real-Time",
                url: "/projects/neural-speech-pipeline",
                icon: "folder-git-2",
              },
            ],
          },
        },
      ],
    },

    // 3. Core Capabilities / What I Build
    {
      id: "sec-capabilities",
      pageId: "page-home",
      sectionType: "capabilities",
      orderIndex: 30,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "مجالات التركيز والخبرة الهندسية" : "What I Build",
      subtitle: isAr
        ? "بناء وتطوير حلول برمجية وذكاء اصطناعي متكاملة تلبي معايير الإنتاج الحقيقية."
        : "Core engineering strengths focused on delivering robust, high-impact software solutions.",
      blocks: [
        {
          id: "blk-capabilities-cards",
          blockType: "card_collection",
          orderIndex: 10,
          isVisible: true,
          config: { columns: "2" },
          content: {
            columns: "2",
            items: [
              {
                id: "cap-rag",
                title: isAr
                  ? "أنظمة RAG والبحث الدلالي الهجين"
                  : "RAG & Hybrid Retrieval Pipelines",
                description: isAr
                  ? "تصميم خطوط أنابيب استرجاع تدمج التضمين الشعاعي، الفهرسة المعجمية، إعادة الترتيب (Reranking)، وربط الإجابات بالبراهين المعتمدة."
                  : "Engineering multi-stage retrieval pipelines combining dense vectors, BM25 lexical indexing, reciprocal rank fusion, and verifiable citations.",
                badge: "Retrieval",
                url: "/projects",
                icon: "sparkles",
              },
              {
                id: "cap-eval",
                title: isAr
                  ? "تقييم واختبار النماذج (LLM Evaluation)"
                  : "LLM Evaluation & Red Teaming",
                description: isAr
                  ? "بناء مسارات تقييم قطعية واختبارات معيارية لقياس دقة النماذج، تجنب الهلوسة، ومراقبة زمن الاستجابة وجودة الإجابات."
                  : "Building deterministic benchmark suites and rubrics to measure grounding quality, hallucination prevention, relevance, and latency.",
                badge: "Evaluation",
                url: "/evaluation",
                icon: "chart-bar",
              },
              {
                id: "cap-agents",
                title: isAr ? "الوكلاء الأذكياء والأتمتة" : "AI Agents & Autonomous Workflows",
                description: isAr
                  ? "تطوير وكلاء برمجيات مستقلين قادرين على استدعاء الأدوات الخارجية، الحفاظ على سياق الحالة، وتنفيذ المهام متعددة المراحل."
                  : "Developing autonomous agent workflows utilizing function calling, stateful context persistence, and resilient error recovery.",
                badge: "Agents",
                url: "/lab",
                icon: "flask-conical",
              },
              {
                id: "cap-fullstack",
                title: isAr
                  ? "هندسة البرمجيات وتطبيقات الويب"
                  : "Production Full-Stack Engineering",
                description: isAr
                  ? "تطوير تطبيقات الويب السحابية باستخدام Next.js، TypeScript، PostgreSQL/pgvector، وتطبيق معايير الأمان وإمكانية الوصول WCAG 2.2 AA."
                  : "Architecting modern web platforms with Next.js, TypeScript, PostgreSQL/pgvector, Redis caching, and WCAG 2.2 AA accessibility.",
                badge: "Full-Stack",
                url: "/cv",
                icon: "file-text",
              },
            ],
          },
        },
      ],
    },

    // 4. Interactive Technical Demos (Evidence of Craft)
    {
      id: "sec-technical-demos",
      pageId: "page-home",
      sectionType: "demos",
      orderIndex: 40,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "تجارب وبراهين هندسية حية" : "Interactive Proof of Capability",
      subtitle: isAr
        ? "أدوات وأنظمة تفاعلية طورها أنس لإثبات جودة وكفاءة التنفيذ الهندسي عملياً."
        : "Live interactive tools built by Anas to demonstrate retrieval, evaluation, and AI automation in action.",
      blocks: [
        {
          id: "blk-demos-cards",
          blockType: "card_collection",
          orderIndex: 10,
          isVisible: true,
          config: { columns: "2" },
          content: {
            columns: "2",
            items: [
              {
                id: "demo-chat",
                title: isAr
                  ? "اسأل عن أنس (المساعد الذكي)"
                  : "Ask About Anas (Recruiter Assistant)",
                description: isAr
                  ? "مساعد محادثة ذكي يستند إلى قاعدة بيانات RAG دقيقة للإجابة عن مهارات أنس، مشاريعه، وخبراته الوظيفية."
                  : "Conversational RAG assistant grounded in Anas's verified skills, project decisions, and career milestones.",
                badge: "Interactive",
                url: "/chat",
                icon: "sparkles",
              },
              {
                id: "demo-jobfit",
                title: isAr ? "محلل مطابقة الوظائف (ATS Matcher)" : "Job Fit & ATS Match Analyzer",
                description: isAr
                  ? "أداة هندسية تقارن متطلبات الوظيفة مع مهارات ومشاريع أنس وتنتج تقييماً تحليلياً مدعوماً بالأدلة."
                  : "Engineering tool evaluating role requirements against Anas's skills and project evidence with deterministic scoring.",
                badge: "Tool",
                url: "/job-fit",
                icon: "briefcase",
              },
              {
                id: "demo-lab",
                title: isAr ? "مختبر التجارب الهندسية (AI Lab)" : "AI Engineering Experiments Lab",
                description: isAr
                  ? "بيئة تفاعلية لاختبار بارامترات التوليد، سرعة الاسترجاع، وخوارزميات إعادة الترتيب (Reranking)."
                  : "Interactive sandbox testing generative parameters, retrieval latency, and semantic reranking algorithms.",
                badge: "Lab",
                url: "/lab",
                icon: "flask-conical",
              },
              {
                id: "demo-eval",
                title: isAr
                  ? "لوحة التقييم المعياري (Evaluation)"
                  : "LLM Evaluation Benchmarking Console",
                description: isAr
                  ? "منصة تقييم شاملة تقيس دقة الاسترجاع، الربط بالحقائق، وزمن الاستجابة لمسارات الذكاء الاصطناعي."
                  : "Evaluation console measuring grounding fidelity, context recall, and response latency across benchmark datasets.",
                badge: "Benchmarks",
                url: "/evaluation",
                icon: "chart-bar",
              },
            ],
          },
        },
      ],
    },

    // 5. About Anas Section
    {
      id: "sec-about",
      pageId: "page-home",
      sectionType: "about",
      orderIndex: 50,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "عن أنس الدحامشة" : "About Anas",
      subtitle: isAr
        ? "خلفية أكاديمية في هندسة الحاسوب، مع تركيز دائم على بناء أنظمة ذكاء اصطناعي إنتاجية حقيقية."
        : "Computer Engineering foundation, passionate about building reliable production AI software.",
      blocks: [
        {
          id: "blk-about-quote",
          blockType: "quote",
          orderIndex: 10,
          isVisible: true,
          config: {},
          content: {
            quote: isAr
              ? "أركز على تحويل أبحاث ونماذج الذكاء الاصطناعي المعقدة إلى برمجيات إنتاجية عملية وموثوقة. في كل نظام أقوم بهندسته، أولي أهمية قصوى لسرعة الاستجابة، ربط الإجابات بالحقائق، نظافة البنية المعمارية، وتقديم نتائج قابلة للقياس."
              : "I focus on transforming complex AI models into practical, reliable, and high-impact production software. Every system I design prioritizes sub-second latency, strict evidence grounding, clean architecture, and measurable outcomes.",
            author: isAr ? "أنس الدحامشة" : "Anas Al Dahamsheh",
            role: isAr ? "مهندس ذكاء اصطناعي وبرمجيات" : "AI & Software Engineer",
          },
        },
      ],
    },

    // 6. Direct Contact Section
    {
      id: "sec-contact",
      pageId: "page-home",
      sectionType: "contact",
      orderIndex: 60,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "تواصل معي مباشرة" : "Get in Touch",
      subtitle: isAr
        ? "متاح لفرص العمل كمهندس ذكاء اصطناعي، والتعاون في بناء مشاريع برمجية متقدمة."
        : "Open for AI Engineer roles, technical collaborations, and ambitious software engineering opportunities.",
      blocks: [
        {
          id: "blk-contact-cta",
          blockType: "cta",
          orderIndex: 10,
          isVisible: true,
          config: { variant: "primary", align: "start" },
          content: {
            label: isAr ? "صفحة التواصل الكاملة" : "Contact Details & Resume",
            url: "/contact",
            openInNewTab: false,
          },
        },
      ],
    },
  ];
}
