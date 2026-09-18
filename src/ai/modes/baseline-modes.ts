import { ConversationModeConfig } from "@/ai/contracts/conversation-mode";

export const BASELINE_CONVERSATION_MODES: ConversationModeConfig[] = [
  {
    id: "mode-general",
    slug: "general",
    nameEn: "General",
    nameAr: "عام",
    descriptionEn:
      "Balanced, accessible explanations suitable for all visitors exploring Anas's portfolio.",
    descriptionAr: "شرح متوازن وشامل يناسب جميع الزوار والمهتمين بالتعرف على مسيرة وأعمال أنس.",
    toneGuidelines:
      "Professional, balanced, engaging, and approachable. Speak with natural conversational clarity while maintaining factual authority.",
    focusAreas:
      "High-level project outcomes, core competencies, overview of technical background, and verified career highlights.",
    promptSlug: "chat_system",
    isEnabled: true,
    isPublished: true,
    sortOrder: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "mode-recruiter",
    slug: "recruiter",
    nameEn: "Recruiter",
    nameAr: "مسؤول توظيف",
    descriptionEn:
      "Concise, evidence-first, role-relevant summaries focusing on skills, impact, and verified credentials.",
    descriptionAr:
      "ملخصات موجزة وموثقة بالأدلة المباشرة تركز على متطلبات الأدوار الوظيفية والقيمة العملية.",
    toneGuidelines:
      "Direct, executive, structured with bullet points, evidence-first, and concise. Highlight measurable achievements, stack proficiencies, and business value. Strictly NEVER fabricate fit claims or exaggerate experience.",
    focusAreas:
      "Role relevance, engineering impact, leadership & team collaboration, tech stack proficiencies, verified certifications, and career trajectory.",
    promptSlug: "chat_system",
    isEnabled: true,
    isPublished: true,
    sortOrder: 2,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "mode-technical",
    slug: "technical",
    nameEn: "Technical",
    nameAr: "تقني متعمق",
    descriptionEn:
      "Deep dives into system architectures, engineering trade-offs, algorithms, and evaluation benchmarks.",
    descriptionAr:
      "تفاصيل معمارية متعمقة، مقايضات هندسية، خوارزميات، وبنية الأنظمة والتقييم المدعوم بالأدلة.",
    toneGuidelines:
      "Rigorous, analytical, engineering-focused, precise. Discuss architectural patterns, latency, throughput, scale, failure modes, and implementation trade-offs supported by source evidence.",
    focusAreas:
      "System architecture, microservices/event design, database & vector indexing mechanics, model routing & evaluation, concurrency, caching, and code-level patterns.",
    promptSlug: "chat_system",
    isEnabled: true,
    isPublished: true,
    sortOrder: 3,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];
