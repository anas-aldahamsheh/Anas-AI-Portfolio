# Anas Al Dahamsheh — AI Engineer Portfolio

A bilingual (English / Arabic) portfolio with an AI assistant that knows everything the owner
publishes or uploads, and an inline editor that lets the owner change anything on the site.

## What's inside

- **Public site** (Next.js 16, React 19, Tailwind 4, Motion). Pages are prerendered and cached;
  an admin edit expires only the affected pages. Scroll reveals run from one tiny script, so pages
  stay server components and content is never hidden from crawlers.
- **Content model**: every section (profile, projects, experience, education, certificates,
  skills, knowledge files, private notes) is one validated row in `content_entries`, written per
  language with field-by-field fallback. Every change is versioned in `content_revisions`.
- **AI assistant** (`/api/assistant`): a Gemini tool-calling agent. It looks facts up instead of
  receiving the whole portfolio in its prompt:
  - `get_profile`, `list_projects`, `get_project`, `list_experience`,
    `list_education_and_certificates`, `get_skills` (skills mapped to the projects and roles that
    prove them), `match_job_requirements` (job-fit evidence per requirement), and
    `search_knowledge` (hybrid RAG over everything, including the CV and uploaded files).
  - Answers stream over SSE with citations to the pages they came from; links that did not come
    from a tool are removed; model fallback, retries and database-backed rate limits are built in.
- **Hybrid retrieval**: bilingual normalisation and light stemming → Gemini embeddings in
  pgvector (HNSW) + Postgres full-text + trigram title match → weighted Reciprocal Rank Fusion →
  cross-language de-duplication → LLM reranking.
- **Always in sync**: saving, hiding or deleting anything re-indexes (or forgets) it right away;
  only chunks whose text changed are re-embedded. Uploaded PDFs and images are read by Gemini.
- **Admin**: sign-up is disabled. The owner signs in at `/en/sign-in`, then edits any text or item
  in place (edit mode), or uses the dashboard at `/en/admin` for content, CV and knowledge files,
  assistant settings and the questions visitors asked.

## Setup

```bash
pnpm install
cp .env.example .env.local        # fill in DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY
pnpm db:migrate                   # additive and idempotent
pnpm db:seed                      # starter content (only fills what is missing) + AI index
pnpm admin -- --email you@example.com --password "a long password" --name "Your Name"
pnpm dev
```

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test                          # set TEST_DATABASE_URL to also run the pgvector integration tests
pnpm build
```
