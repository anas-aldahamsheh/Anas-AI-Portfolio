import { z } from "zod";
import { DEVELOPER_PROFILE } from "@/lib/config/developer-profile";

export type CvBoxType = "profile" | "skills_grid" | "info_card" | "custom";

export interface CvBoxItem {
  id: string;
  type: CvBoxType;
  title: string;
  subtitle?: string | undefined;
  description?: string | undefined;
  icon?: string | undefined; // "sparkles" | "code" | "briefcase" | "graduation" | "cpu" | "shield" | "layers" | "globe" | "terminal" | "database" | "rocket"
  items?: string[] | undefined;
  linkUrl?: string | undefined;
  linkLabel?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  showAiChat?: boolean | undefined;
  colSpan?: 1 | 2 | 3 | undefined;
  orderIndex: number;
}

export const cvBoxItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["profile", "skills_grid", "info_card", "custom"]).default("custom"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  items: z.array(z.string()).optional(),
  linkUrl: z.string().optional(),
  linkLabel: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  showAiChat: z.boolean().optional(),
  colSpan: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().default(1),
  orderIndex: z.number().int().default(0),
});

export const cvBoxesConfigSchema = z.object({
  boxes: z.array(cvBoxItemSchema),
  updatedAt: z.string().optional(),
});

export const DEFAULT_CV_BOXES: CvBoxItem[] = [
  {
    id: "box-profile",
    type: "profile",
    title: "Executive Profile",
    description:
      "AI & Software Engineer with a B.S. in Computer Engineering. Experienced in architecting production RAG systems, LLM evaluation pipelines, autonomous agent workflows, and scalable full-stack web applications with rigorous benchmarking and sub-second latency.",
    email: DEVELOPER_PROFILE.email.address,
    phone: DEVELOPER_PROFILE.phone.display,
    showAiChat: true,
    orderIndex: 1,
  },
  {
    id: "box-ai-rag",
    type: "skills_grid",
    title: "AI & RAG Engineering",
    icon: "sparkles",
    items: [
      "Hybrid Search (Dense + BM25)",
      "Qdrant Cloud & pgvector",
      "Cross-Encoder Reranking & Citations",
    ],
    orderIndex: 2,
  },
  {
    id: "box-llm-eval",
    type: "skills_grid",
    title: "LLM Evaluation & Quality",
    icon: "code",
    items: [
      "Deterministic Benchmark Suites",
      "Grounding & Hallucination Defense",
      "Automated Testing with Vitest",
    ],
    orderIndex: 3,
  },
  {
    id: "box-fullstack",
    type: "skills_grid",
    title: "Full-Stack Architecture",
    icon: "briefcase",
    items: [
      "Next.js 15 App Router & React 19",
      "TypeScript & Server Actions",
      "PostgreSQL (Neon), Better Auth, WCAG 2.2",
    ],
    orderIndex: 4,
  },
  {
    id: "box-education",
    type: "info_card",
    title: "Education",
    subtitle: "B.S. in Computer Engineering",
    description: "Focused on computer systems, software architecture, and algorithms",
    icon: "graduation",
    orderIndex: 5,
  },
  {
    id: "box-experience",
    type: "info_card",
    title: "Experience Timeline",
    subtitle: "AI & Software Systems Engineer",
    description: "Production systems, RAG pipelines, evaluations",
    linkUrl: "/experience",
    linkLabel: "Full Timeline →",
    icon: "briefcase",
    orderIndex: 6,
  },
];
