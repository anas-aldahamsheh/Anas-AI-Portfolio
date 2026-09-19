import type { Project, ProjectCategory, ProjectTag } from "./types";

export const BASELINE_CATEGORIES: ProjectCategory[] = [
  { id: "cat-agentic-ai", slug: "agentic-ai", name: "Agentic AI" },
  { id: "cat-enterprise-systems", slug: "enterprise-systems", name: "Enterprise Systems" },
  { id: "cat-fullstack-edge", slug: "fullstack-edge", name: "Full Stack & Edge" },
];

export const BASELINE_TAGS: ProjectTag[] = [
  { id: "tag-typescript", slug: "typescript", name: "TypeScript" },
  { id: "tag-python", slug: "python", name: "Python" },
  { id: "tag-rag", slug: "rag", name: "RAG" },
  { id: "tag-pgvector", slug: "pgvector", name: "pgvector" },
  { id: "tag-rust", slug: "rust", name: "Rust" },
  { id: "tag-nextjs", slug: "nextjs", name: "Next.js" },
  { id: "tag-webrtc", slug: "webrtc", name: "WebRTC" },
  { id: "tag-fastapi", slug: "fastapi", name: "FastAPI" },
  { id: "tag-tailwindcss", slug: "tailwindcss", name: "TailwindCSS" },
];

export const BASELINE_PROJECTS_EN: Project[] = [
  {
    id: "proj-rag-engine",
    slug: "autonomous-rag-engine",
    status: "PUBLISHED",
    orderIndex: 1,
    isFeatured: true,
    coverImageUrl: "/images/projects/rag-engine.svg",
    repoUrl: "https://github.com/anas-ai-engineer/multimodal-rag-engine",
    demoUrl: "https://rag-demo.anas-ai.dev",
    title: "Autonomous Multimodal RAG Engine",
    summary:
      "Production-grade agentic retrieval-augmented generation engine with hybrid dense/sparse vector search and dynamic reranking.",
    problem:
      "Traditional semantic vector search struggles with domain-specific jargon, dense contextual shifts, and hallucinated source claims in high-stakes enterprise workflows.",
    constraints:
      "Sub-250ms retrieval latency budget, strict evidence grounding without chain-of-thought leakage, and deterministic bilingual citation boundaries across Arabic and English.",
    solution:
      "Engineered a multi-stage hybrid retrieval pipeline combining dense vector embeddings (BGE-M3), sparse lexical indexing, and reciprocal rank fusion with contextual reranking.",
    architecture:
      "Asynchronous ingestion workers tokenize and chunk multimodal markdown documents into vector stores, while a Query Router evaluates intent before dispatching parallel hybrid queries.",
    implementation:
      "Built with TypeScript, Python microservices, pgvector for vector indexing, FastAPI streaming endpoints, and verifiable citation bounding algorithms.",
    challenges:
      "Handling vocabulary mismatch in technical Arabic terminology while maintaining sub-second latency across 100k+ document chunks.",
    decisionsTradeoffs:
      "Adopted Reciprocal Rank Fusion over simple score averaging to normalize non-linear scoring variances between dense embedding distances and BM25 lexical matches.",
    results:
      "Achieved 99.4% citation accuracy, eliminated hallucinations on verified evaluation datasets, and reduced P95 query latency to 180ms.",
    categories: ["Agentic AI"],
    tags: ["TypeScript", "pgvector", "RAG", "Python"],
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "proj-policy-router",
    slug: "enterprise-policy-router",
    status: "PUBLISHED",
    orderIndex: 2,
    isFeatured: true,
    coverImageUrl: "/images/projects/policy-router.svg",
    repoUrl: "https://github.com/anas-ai-engineer/edge-policy-router",
    demoUrl: null,
    title: "Enterprise Edge Gateway & Policy Router",
    summary:
      "Ultra-low latency edge gateway enforcing cryptographic RBAC, rate-limiting, and distributed session consensus.",
    problem:
      "Centralized authorization lookups introduce latency bottlenecks and single points of failure across globally distributed edge worker nodes.",
    constraints:
      "Zero-allocation token verification, sub-5ms policy decision latency, and resilience against Byzantine network partition states.",
    solution:
      "Constructed an embedded policy enforcement daemon in Rust utilizing memory-mapped local state with cryptographic token verification.",
    architecture:
      "Stateless edge interceptors communicate with an ephemeral Redis replica ring, delegating audit events asynchronously while approving authorized requests immediately.",
    implementation:
      "Rust Tokio async runtime, Tower middleware stack, Ed25519 cryptographic token parsing, and Next.js management UI.",
    challenges:
      "Synchronizing policy revocation events across distributed nodes without introducing synchronous round-trip latency.",
    decisionsTradeoffs:
      "Selected Rust over Go for deterministic sub-millisecond memory footprint and zero garbage-collection pause times under high request concurrency.",
    results:
      "Maintained sub-3ms P99 verification latency under 50,000 requests per second with zero memory leaks across 90-day soak tests.",
    categories: ["Enterprise Systems"],
    tags: ["Rust", "Next.js", "TypeScript"],
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "proj-speech-stream",
    slug: "neural-speech-pipeline",
    status: "PUBLISHED",
    orderIndex: 3,
    isFeatured: false,
    coverImageUrl: "/images/projects/speech-stream.svg",
    repoUrl: "https://github.com/anas-ai-engineer/neural-speech-stream",
    demoUrl: "https://voice-demo.anas-ai.dev",
    title: "Real-Time Neural Speech & Synthesis Pipeline",
    summary:
      "Sub-150ms bidirectional voice conversation stream integrating WebRTC with low-latency streaming speech models.",
    problem:
      "Voice interfaces suffer from awkward turn-taking delays and audio dropouts when processing live continuous audio streams over variable internet connections.",
    constraints:
      "Total roundtrip latency from voice utterance to synthesized audio playback must remain under 150ms with jitter buffering.",
    solution:
      "Implemented a chunked streaming pipeline using WebRTC data channels, real-time Voice Activity Detection (VAD), and streaming neural audio synthesis.",
    architecture:
      "Client audio streams directly over WebRTC to Python audio workers; VAD triggers partial sentence inference before the speaker finishes speaking.",
    implementation:
      "Python 3.12, FastAPI, WebRTC, ONNX Runtime for edge VAD inference, and custom audio PCM streaming buffers.",
    challenges:
      "Managing audio echo cancellation and false-positive interruptions in noisy acoustic environments.",
    decisionsTradeoffs:
      "Traded small phoneme precision nuances for immediate chunked audio delivery to optimize human-perceived conversational responsiveness.",
    results:
      "Reduced conversational latency to 125ms average, enabling natural, interruptible voice interactions with human-like turn-taking.",
    categories: ["Agentic AI", "Full Stack & Edge"],
    tags: ["Python", "WebRTC", "FastAPI"],
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-03-12T00:00:00.000Z",
  },
  {
    id: "proj-bilingual-studio",
    slug: "adaptive-design-studio",
    status: "PUBLISHED",
    orderIndex: 4,
    isFeatured: false,
    coverImageUrl: "/images/projects/bilingual-platform.svg",
    repoUrl: "https://github.com/anas-ai-engineer/bilingual-design-studio",
    demoUrl: null,
    title: "Adaptive Bilingual Design System & Component Studio",
    summary:
      "Zero-runtime overhead design system strictly adhering to WCAG 2.2 AA standards with bidirectional RTL/LTR layout.",
    problem:
      "Most web applications treat Arabic RTL support as a visual hack, resulting in awkward chevron directions, clipped numerals, and broken logical flow.",
    constraints:
      "Zero CSS runtime overhead, WCAG 2.2 AA contrast compliance across both light and dark themes, and complete bi-directional typography isolation.",
    solution:
      "Built a component system utilizing CSS logical properties, script direction detection, and custom Radix primitives with zero native select leaks.",
    architecture:
      "SSR direction extraction via path parameters, DirectionProvider context propagation for portals, and isolated inline code tokenization.",
    implementation:
      "TypeScript, TailwindCSS with logical utilities, Radix UI headless primitives, Vitest integration tests, and Axe accessibility audits.",
    challenges:
      "Preventing bidirectional text corruption when rendering inline English technical code within right-to-left Arabic narrative sentences.",
    decisionsTradeoffs:
      "Mandated strict `<MixedContent>` and `<DirectionalIcon>` components rather than relying on global CSS direction flipping.",
    results:
      "100% WCAG 2.2 AA accessibility audit score, zero First Paint FOUC flash, and seamless bidirectional reading flow across all screen sizes.",
    categories: ["Full Stack & Edge"],
    tags: ["TypeScript", "Next.js", "TailwindCSS"],
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-15T00:00:00.000Z",
  },
];

export const BASELINE_PROJECTS_AR: Project[] = [
  {
    id: "proj-rag-engine",
    slug: "autonomous-rag-engine",
    status: "PUBLISHED",
    orderIndex: 1,
    isFeatured: true,
    coverImageUrl: "/images/projects/rag-engine.svg",
    repoUrl: "https://github.com/anas-ai-engineer/multimodal-rag-engine",
    demoUrl: "https://rag-demo.anas-ai.dev",
    title: "محرك استرجاع متعدد الوسائط مؤتمت (RAG)",
    summary:
      "منظومة استرجاع معززة بالتوليد من الدرجة الإنتاجية تدعم البحث الهجين الكثيف والدقيق وإعادة الترتيب التلقائي.",
    problem:
      "يعاني البحث الدلالي التقليدي عند التعامل مع مصطلحات تقنية متخصصة وسياقات متغيرة، مما يؤدي إلى نتائج غير دقيقة في بيئات العمل الحساسة.",
    constraints:
      "ميزانية زمن استجابة لا تتعدى 250 ملي ثانية، مع ربط صارم بالبراهين دون تسريب خطوات التفكير الداخلية، ودعم ثنائي اللغة دقيق في العربية والإنجليزية.",
    solution:
      "تصميم خط أنابيب بحث هجين متقدم يدمج التضمينات الشعاعية الكثيفة (BGE-M3) مع الفهرسة المعجمية الدقيقة وخوارزميات الترتيب المتبادل.",
    architecture:
      "معالجات استيعاب غير متزامنة تقطع وتفهرس المستندات، بينما يقوم موجه الاستعلامات بتحليل القصد قبل إطلاق الاستعلامات الهجينة المتوازية.",
    implementation:
      "مبني باستخدام TypeScript، خدمات Python مصغرة، pgvector للفهرسة الشعاعية، ونقاط نهاية FastAPI المتدفقة مع خوارزميات تحقق دقيقة من الاقتباسات.",
    challenges:
      "معالجة التباين في المصطلحات التقنية العربية مع الحفاظ على سرعة استجابة فائقة عبر أكثر من 100 ألف مقطع نصي.",
    decisionsTradeoffs:
      "اعتماد دمج الترتيب المتبادل (RRF) بدلاً من متوسط الدرجات لتفادي الفروق غير الخطية بين مسافات التضمين وتطابقات BM25.",
    results:
      "تحقيق دقة اقتباس بلغت 99.4%، والقضاء التام على الهلوسة في مجموعات التقييم المعتمدة، وخفض زمن الاستجابة إلى 180 ملي ثانية.",
    categories: ["Agentic AI"],
    tags: ["TypeScript", "pgvector", "RAG", "Python"],
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "proj-policy-router",
    slug: "enterprise-policy-router",
    status: "PUBLISHED",
    orderIndex: 2,
    isFeatured: true,
    coverImageUrl: "/images/projects/policy-router.svg",
    repoUrl: "https://github.com/anas-ai-engineer/edge-policy-router",
    demoUrl: null,
    title: "بوابة الطرفية المؤسسية وموجّه السياسات",
    summary:
      "بوابة حافة فائقة السرعة تطبق ضوابط الوصول المشفرة والحد الذكي من المعدلات مع توافق الجلسات الموزعة.",
    problem:
      "البحث المركزي عن الصلاحيات يسبب اختناقات في زمن الاستجابة ويشكل نقطة فشل مركزية عبر عقد الحافة الموزعة جغرافيًا.",
    constraints:
      "التحقق من التوكنات دون استهلاك إضافي للذاكرة، وزمن قرار لا يتعدى 5 ملي ثانية، مع الصمود أمام حالات انقطاع الشبكة.",
    solution:
      "بناء خادم مصغر لتطبيق السياسات بلغة Rust يعتمد على الذاكرة المشتركة محليًا والتحقق المشفر الفوري من التوكنات.",
    architecture:
      "معترضات حافة عديمة الحالة تتواصل مع حلقات Redis متماثلة، وتقوم بتسجيل الأحداث الأمنية بشكل غير متزامن مع تمرير الطلبات المصرح بها فورًا.",
    implementation:
      "بيئة Tokio غير المتزامنة في Rust، برمجيات Tower الوسيطة، معالجة توكنات Ed25519، ولوحة تحكم مبنية بـ Next.js.",
    challenges: "مزامنة إلغاء السياسات والصلاحيات عبر العقد الموزعة دون إحداث تأخير شبكي متزامن.",
    decisionsTradeoffs:
      "اختيار لغة Rust على حساب Go لضمان بصمة ذاكرة قطعية تقل عن الملي ثانية وتجنب توقفات جامع القمامة في أوقات الذروة.",
    results:
      "الحفاظ على زمن تحقق P99 يقل عن 3 ملي ثانية تحت ضغط 50,000 طلب بالثانية دون أي تسريب في الذاكرة عبر 90 يومًا من الاختبار المستمر.",
    categories: ["Enterprise Systems"],
    tags: ["Rust", "Next.js", "TypeScript"],
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "proj-speech-stream",
    slug: "neural-speech-pipeline",
    status: "PUBLISHED",
    orderIndex: 3,
    isFeatured: false,
    coverImageUrl: "/images/projects/speech-stream.svg",
    repoUrl: "https://github.com/anas-ai-engineer/neural-speech-stream",
    demoUrl: "https://voice-demo.anas-ai.dev",
    title: "منظومة معالجة وتوليد الصوت العصبي الحي",
    summary:
      "تدفق صوتي ثنائي الاتجاه بزمن استجابة أقل من 150 ملي ثانية يدمج WebRTC مع نماذج التوليد الصوتي العصبي.",
    problem:
      "تعاني واجهات المحادثة الصوتية من تأخر مزعج في تبادل الأدوار وتقطع في الصوت عند معالجة التدفقات المباشرة عبر الشبكات المتغيرة.",
    constraints:
      "يجب ألا يتجاوز إجمالي زمن الاستجابة من بدء الكلام حتى تشغيل الصوت المُولّد 150 ملي ثانية مع تخزين مؤقت للتقلبات.",
    solution:
      "تنفيذ خط أنابيب متدفق يعتمد على قنوات بيانات WebRTC، واكتشاف النشاط الصوتي في الوقت الفعلي (VAD)، والتوليف الصوتي العصبي المباشر.",
    architecture:
      "يتدفق صوت العميل مباشرة عبر WebRTC إلى خوادم معالجة الصوت في Python؛ يقوم كاشف الصوت بإطلاق التوليد قبل اكتمال كلام المتحدث.",
    implementation:
      "Python 3.12، FastAPI، WebRTC، مكتبة ONNX للاستدلال السريع، ومخازن PCM الصوتية المتدفقة.",
    challenges:
      "إلغاء صدى الصوت ومنع المقاطعات الخاطئة في البيئات المليئة بالضوضاء الصوتية المحيطة.",
    decisionsTradeoffs:
      "المفاضلة بين أدق تفاصيل النطق وتوفير الصوت الفوري المجزأ لتحقيق أعلى درجات الاستجابة البشرية الطبيعية.",
    results:
      "تقليص زمن الاستجابة للمحادثة إلى 125 ملي ثانية في المتوسط، مما أتاح محادثات صوتية طبيعية وتفاعلية قابلة للمقاطعة.",
    categories: ["Agentic AI", "Full Stack & Edge"],
    tags: ["Python", "WebRTC", "FastAPI"],
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-03-12T00:00:00.000Z",
  },
  {
    id: "proj-bilingual-studio",
    slug: "adaptive-design-studio",
    status: "PUBLISHED",
    orderIndex: 4,
    isFeatured: false,
    coverImageUrl: "/images/projects/bilingual-platform.svg",
    repoUrl: "https://github.com/anas-ai-engineer/bilingual-design-studio",
    demoUrl: null,
    title: "نظام تصميم ثنائي اللغة متكيف وأستوديو المكونات",
    summary:
      "نظام تصميم خفيف وسريع يمتثل كليًا لمعايير إمكانية الوصول WCAG 2.2 AA مع دعم تلقائي للاتجاهين RTL و LTR.",
    problem:
      "تعتبر معظم التطبيقات دعم اللغة العربية مجرد انعكاس بصري شكلي، مما يؤدي إلى اتجاهات خاطئة للأسهم وتشوّه الأرقام وتصدع الانسياب المنطقي.",
    constraints:
      "انعدام تكلفة الأداء الإضافية لـ CSS، والامتثال التام لمعايير التباين WCAG 2.2 AA في الوضعين الفاتح والداكن، وعزل نصوص البرمجة ثنائية الاتجاه.",
    solution:
      "بناء منظومة مكونات تستخدم الخصائص المنطقية للـ CSS واكتشاف اتجاه النصوص البرمجية ومكونات Radix مخصصة دون استخدام عناصر select التقليدية.",
    architecture:
      "استخراج الاتجاه عبر مسارات الخادم، ونشر سياق DirectionProvider للنوافذ المنبثقة، وعزل المصطلحات والرموز البرمجية داخل النصوص العربية.",
    implementation:
      "TypeScript، TailwindCSS بالخصائص المنطقية، مكتبة Radix UI، اختبارات Vitest التفاعلية، وفحوصات Axe لإمكانية الوصول.",
    challenges:
      "منع تداخل النصوص ثنائية الاتجاه عند تضمين كلمات أو أكواد برمجية إنجليزية داخل جمل سردية عربية تبدأ من اليمين.",
    decisionsTradeoffs:
      "إلزامية استخدام مكونات `<MixedContent>` و `<DirectionalIcon>` بدلاً من الاعتماد على القلب التلقائي الشامل لاتجاه الصفحة.",
    results:
      "الحصول على نسبة 100% في تدقيق إمكانية الوصول WCAG 2.2 AA، وتفادي وميض تحميل الصفحة الأولي، وتوفير قراءة سلسة عبر كافة الأجهزة.",
    categories: ["Full Stack & Edge"],
    tags: ["TypeScript", "Next.js", "TailwindCSS"],
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-15T00:00:00.000Z",
  },
];

export function getBaselineProjects(locale = "en"): Project[] {
  const base = locale === "ar" ? BASELINE_PROJECTS_AR : BASELINE_PROJECTS_EN;
  return base.map((p) => ({ ...p }));
}
