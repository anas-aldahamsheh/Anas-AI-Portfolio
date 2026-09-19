# Anas AI Portfolio — Production-Grade AI Engineering Platform

A modern, bilingual, production-grade AI engineering portfolio and interactive platform engineered with Next.js 16 (App Router), TypeScript, Tailwind CSS, Drizzle ORM, Better Auth, and a grounded multi-lingual RAG system.

---

## 🌟 Key Features

- **Guest-First Architecture**: Instant, unrestricted access for recruiters and hiring managers to all projects, deep-dive case studies, interactive AI features, and verified CV downloads without sign-in barriers.
- **Interactive Grounded AI Assistant (RAG)**:
  - Vector retrieval powered by Qdrant.
  - Conversational modes (General, Recruiter, Technical).
  - Arabic & English bilingual support with automatic RTL/LTR layout mirroring.
  - Strict grounding in verified career achievements, projects, and architecture notes (zero hallucination design).
- **Job Fit & ATS Match Analyzer**: Automated comparison engine that evaluates job descriptions against skills, experience, and project metrics with grounded match scoring.
- **Dynamic Content & Admin Control Center**:
  - Full CMS-grade control over pages, navigation items, CV versions, and social links.
  - Encrypted secrets management for AI model providers (OpenAI, Anthropic, Google Gemini) using AES-256-GCM.
  - AI Prompt Registry with versioning and rollbacks.
- **Production Hardening**:
  - OWASP Top 10 defenses (SSRF validation, CSRF tokens, strict sanitization, rate limiting via Upstash Redis).
  - WCAG 2.2 AA accessibility compliance (skip links, screen reader announcer, full keyboard navigation).
  - Operational health probes (`/api/health`, `/api/readiness`, `/api/metrics`).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) & React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 & Motion (Micro-animations) |
| **Database** | PostgreSQL (Neon / Serverless) + Drizzle ORM |
| **Vector DB** | Qdrant Cloud (Vector embeddings & hybrid retrieval) |
| **Cache & Rate Limit** | Upstash Redis |
| **Authentication** | Better Auth (RBAC for Administrator operations) |
| **Testing** | Vitest (Unit & Integration) + Playwright (E2E) |
| **Security** | AES-256-GCM encrypted provider secrets, Zod validation |

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 10.0.0`

### 2. Installation

```bash
git clone https://github.com/anas-aldahamsheh/anas-ai-portfolio.git
cd anas-ai-portfolio
pnpm install
```

### 3. Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env.local
```

Configure your local or production credentials (see `docs/ops/` and `.env.example` for detailed guidelines).

### 4. Database Setup & Migration

```bash
# Generate schema migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

### 5. Running the Application

```bash
# Development server (Turbopack)
pnpm dev

# Production build
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run unit & integration tests
pnpm test

# Run deployment verification script
pnpm verify:deploy

# Run linter & type check
pnpm lint
pnpm typecheck
```

---

## 👨‍💻 Author

**Anas Aldahamsheh**  
- **GitHub**: [@anas-aldahamsheh](https://github.com/anas-aldahamsheh)  
- **LinkedIn**: [linkedin.com/in/anas-aldahamsheh](https://linkedin.com/in/anas-aldahamsheh)  

---

## 📄 License

This project is private and proprietary. All rights reserved © 2026 Anas Aldahamsheh.
