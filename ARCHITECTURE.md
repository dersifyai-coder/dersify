# Dersify — System Architecture

> Single source of truth for Dersify's architecture.
> All coding agents must read this file before writing any code.
> Do not deviate without explicit instruction from the project owner.

---

## 1. Project Identity

**Name:** Dersify
**Type:** AI-native personalized learning platform
**Core Thesis:** Existing platforms teach content. Dersify builds a persistent model of each learner and teaches *them specifically*.
**Pedagogical Foundation:** Spaced repetition (SM-2), retrieval practice, error-based learning, focus/diffuse mode detection.
**Scale Target:** Global. Architecture decisions must hold at 1M+ learners without rewrites.

---

## 2. Monorepo Structure

```
dersify/
├── apps/
│   ├── web/              # Next.js 15 frontend
│   └── api/              # NestJS backend
├── packages/
│   └── database/         # Prisma schema, client, generated types
├── supabase/
│   └── policies/         # RLS policies and Supabase-specific SQL (not schema)
├── .github/
│   └── workflows/        # CI/CD pipelines
├── package.json          # Root workspace config (pnpm workspaces)
└── turbo.json            # Turborepo pipeline config
```

**Package manager:** pnpm (workspaces). Never use npm or yarn in this repo.
**Build system:** Turborepo for incremental builds and task caching.

---

## 3. Tech Stack — Definitive

### Frontend — `apps/web`

| Concern | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Components by default |
| Language | TypeScript (strict) | |
| Styling | Tailwind CSS v4 | Config in CSS, not tailwind.config.ts |
| Auth client | @supabase/ssr | Browser + server clients |
| Server state | TanStack Query v5 | For all API data fetching in client components |
| Forms | react-hook-form + Zod | Zod schemas shared with backend where possible |
| Fonts | Sora (headings), JetBrains Mono (code) | Via next/font/google |

### Backend — `apps/api`

| Concern | Technology | Notes |
|---|---|---|
| Framework | NestJS (latest) | |
| Language | TypeScript (strict) | |
| ORM | Prisma (latest) | Via `packages/database` |
| Auth | Supabase Auth + Passport JWT | Supabase issues JWTs; NestJS validates them |
| Validation | class-validator + class-transformer | Global ValidationPipe |
| Runtime validation | Zod | For LLM output parsing only |
| AI Primary | Anthropic Claude API | `@anthropic-ai/sdk` |
| AI Fallback | OpenAI GPT-4o | `openai` SDK |
| Job Queue | BullMQ + `@nestjs/bullmq` | For async AI jobs |
| Cache | `@nestjs/cache-manager` + ioredis | Redis via Upstash |
| Rate limiting | `@nestjs/throttler` | Per-user limits on AI endpoints |
| API docs | `@nestjs/swagger` | Auto-generated from decorators |
| Health | `@nestjs/terminus` | `/health` endpoint |
| Security | helmet, cors | Configured in main.ts |

### Shared — `packages/database`

| Concern | Technology | Notes |
|---|---|---|
| ORM | Prisma | Schema source of truth |
| DB | PostgreSQL via Supabase | Direct URL for migrations, pooled for runtime |
| Vector store | pgvector extension | `prisma-extension-pgvector` |
| Client export | PrismaClient singleton | Imported by api only |

### Infrastructure

| Concern | Service | Notes |
|---|---|---|
| Frontend | Vercel | Edge network, global |
| Backend | Railway | Single region initially, multi-region via Railway when needed |
| Database + Auth | Supabase | PostgreSQL + Auth + Storage |
| Cache + Queues | Upstash Redis | Serverless Redis, globally distributed |
| File storage | Supabase Storage | |
| Error tracking | Sentry | Both api and web |
| CI/CD | GitHub Actions | Build, test, deploy pipeline |

---

## 4. Brand System

```
Colors:
  Primary Blue : #1B4FDB   → Tailwind class: primary
  Teal         : #0D9488   → Tailwind class: teal
  Deep Navy    : #0A1628   → Tailwind class: navy
  Gradient     : #1B4FDB → #0D9488 (135deg)

Fonts:
  Headings     : Sora (variable: --font-sora)
  Code/Mono    : JetBrains Mono (variable: --font-jetbrains-mono)
  Body         : Sora (400 weight)
```

Colors defined once in `globals.css` as CSS custom properties, consumed via Tailwind.
Never hardcode hex values anywhere outside `globals.css`.

---

## 5. Shared Package — `packages/database`

```
packages/database/
├── prisma/
│   ├── schema.prisma           # Single schema file — source of truth
│   └── migrations/             # Prisma migration history
├── src/
│   ├── index.ts                # Exports: prisma client singleton, all model types
│   └── extensions/
│       └── pgvector.ts         # prisma-extension-pgvector setup
├── package.json
└── tsconfig.json
```

**Prisma Client singleton pattern:**
```ts
// packages/database/src/index.ts
import { PrismaClient } from '@prisma/client';
import { withPgVector } from './extensions/pgvector';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? withPgVector(new PrismaClient());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
```

**Connection strings:**
- `DATABASE_URL` — Direct connection (used by `prisma migrate`)
- `DATABASE_DIRECT_URL` — Same as DATABASE_URL (Prisma requires both fields when using pooling)
- For runtime on Railway: use direct URL (no PgBouncer needed for single-instance)
- For Vercel Edge / serverless: use pooled Supabase connection (port 6543, `?pgbouncer=true`)

---

## 6. Backend Architecture — NestJS Module Map

```
apps/api/src/
├── app.module.ts                  # Root module
├── main.ts                        # Bootstrap: helmet, cors, ValidationPipe, Swagger, prefix api/v1
│
├── auth/                          # Authentication
│   ├── auth.module.ts
│   ├── auth.controller.ts         # POST /auth/register, login, refresh; GET /auth/me
│   ├── auth.service.ts            # Supabase Auth integration
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── refresh.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts        # Passport JWT — validates Supabase-issued JWTs
│   └── guards/
│       └── jwt-auth.guard.ts
│
├── learner/                       # Learner model — core of Dersify
│   ├── learner.module.ts
│   ├── learner.controller.ts
│   ├── learner.service.ts         # SM-2 scheduling, knowledge states, misconceptions, progress
│   ├── sm2.ts                     # Pure SM-2 algorithm functions (no side effects)
│   ├── sm2.constants.ts           # SM-2 algorithm constants
│   └── dto/
│       ├── create-goal.dto.ts
│       ├── update-goal.dto.ts
│       ├── update-profile.dto.ts
│       └── update-knowledge-state.dto.ts
│
├── ai/                            # AI orchestration — single gateway for all LLM calls
│   ├── ai.module.ts
│   ├── ai.service.ts              # Claude primary, GPT-4o fallback, retry, validation
│   ├── exceptions/
│   │   └── ai-unavailable.exception.ts
│   └── prompts/                   # All prompt strings live here as typed functions
│       ├── question-generation.prompt.ts
│       ├── answer-evaluation.prompt.ts
│       ├── misconception-detection.prompt.ts
│       ├── session-summary.prompt.ts
│       └── focus-mode-detection.prompt.ts
│
├── rag/                           # Retrieval-Augmented Generation
│   ├── rag.module.ts
│   └── rag.service.ts             # Embedding, pgvector search, chunk management
│
├── curriculum/                    # Course content management
│   ├── curriculum.module.ts
│   ├── curriculum.controller.ts
│   ├── curriculum.service.ts
│   └── dto/
│       └── ingest-curriculum.dto.ts
│
├── session/                       # Learning session lifecycle
│   ├── session.module.ts
│   ├── session.controller.ts
│   ├── session.service.ts         # Start/end sessions, answer submission, summaries
│   ├── difficulty.constants.ts    # Adaptive difficulty thresholds
│   └── dto/
│       ├── get-question.dto.ts
│       └── submit-answer.dto.ts
│
├── queue/                         # Async job processing
│   ├── queue.module.ts            # BullMQ setup, imports all processors
│   ├── queue.constants.ts         # Queue names as constants
│   └── processors/
│       ├── curriculum-ingestion.processor.ts   # Chunking + embedding in background
│       └── embedding-generation.processor.ts   # Batch embedding jobs
│
├── health/                        # Health check endpoint
│   ├── health.module.ts
│   └── health.controller.ts       # GET /health — checks DB, Redis, AI connectivity
│
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── guards/
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   ├── filters/
│   │   └── global-exception.filter.ts
│   └── dto/
│       └── pagination.dto.ts
│
├── config/
│   └── configuration.ts           # Typed env config via @nestjs/config
│
└── lib/
    └── supabase.ts                # Supabase admin client — Auth + Storage only
```

**API Prefix:** `/api/v1`
**Port:** `3001` (configurable via `PORT` env var)

---

## 7. Frontend Architecture — Next.js App Router Map

```
apps/web/src/
├── app/
│   ├── layout.tsx                         # Root layout: fonts, providers, Sentry
│   ├── page.tsx                           # Landing page (public)
│   │
│   ├── auth/                              # Auth pages — no dashboard chrome
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   └── dashboard/                         # Protected — requires valid session
│       ├── layout.tsx                     # Sidebar + topbar shell
│       ├── page.tsx                       # Dashboard home / redirect to onboarding
│       ├── onboarding/page.tsx            # Goal-setting flow (first-time users)
│       ├── learn/page.tsx                 # Active learning session
│       ├── progress/page.tsx              # Learner model visualization
│       └── settings/page.tsx             # Profile + goals management
│
├── components/
│   ├── ui/                                # Primitives: Button, Input, Card, Badge, Spinner
│   └── shared/                            # Composed: QuestionBlock, SessionTimer, ProgressBar
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # Browser Supabase client (auth + storage)
│   │   └── server.ts                      # Server Supabase client (auth in server components)
│   ├── api.ts                             # Server-only typed fetch wrapper (apiFetch)
│   ├── api-client.ts                      # Browser-side fetch wrapper (reads cookie)
│   └── utils/
│       └── cn.ts                          # Tailwind class merging (clsx + tailwind-merge)
│
├── hooks/
│   ├── use-learner.ts                     # TanStack Query hook for learner data
│   ├── use-session.ts                     # TanStack Query hook for active session
│   └── use-progress.ts                    # TanStack Query hook for progress data
│
├── providers/
│   └── query-provider.tsx                 # TanStack Query client provider
│
├── types/
│   └── index.ts                           # Frontend-facing types (not Prisma types)
│
└── styles/
    └── globals.css                        # Tailwind v4 directives + CSS custom properties
```

---

## 8. Database Schema — Prisma (`packages/database/prisma/schema.prisma`)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DATABASE_DIRECT_URL")
  extensions = [pgvector(map: "vector")]
}

model Profile {
  id        String   @id @db.Uuid
  fullName  String?  @map("full_name")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  knowledgeStates LearnerKnowledgeState[]
  misconceptions  Misconception[]
  sessions        Session[]
  goals           LearnerGoal[]

  @@map("profiles")
}

model LearnerKnowledgeState {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId      String    @map("learner_id") @db.Uuid
  conceptId      String    @map("concept_id")
  easinessFactor Float     @default(2.5) @map("easiness_factor")
  interval       Int       @default(1)
  repetitions    Int       @default(0)
  nextReviewAt   DateTime? @map("next_review_at")
  lastReviewedAt DateTime? @map("last_reviewed_at")
  confidence     Float     @default(0.0)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  learner Profile @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@unique([learnerId, conceptId])
  @@index([learnerId, nextReviewAt])
  @@map("learner_knowledge_states")
}

model Misconception {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId   String   @map("learner_id") @db.Uuid
  conceptId   String   @map("concept_id")
  description String
  frequency   Int      @default(1)
  resolved    Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  learner Profile @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@index([learnerId, conceptId])
  @@map("misconceptions")
}

model Session {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId       String    @map("learner_id") @db.Uuid
  startedAt       DateTime  @default(now()) @map("started_at")
  endedAt         DateTime? @map("ended_at")
  focusMode       String?   @map("focus_mode")
  conceptsCovered String[]  @map("concepts_covered")
  createdAt       DateTime  @default(now()) @map("created_at")

  learner     Profile      @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  errorEvents ErrorEvent[]

  @@index([learnerId, startedAt(sort: Desc)])
  @@map("sessions")
}

model ErrorEvent {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sessionId      String   @map("session_id") @db.Uuid
  learnerId      String   @map("learner_id") @db.Uuid
  conceptId      String   @map("concept_id")
  questionId     String?  @map("question_id")
  learnerAnswer  String   @map("learner_answer")
  correctAnswer  String   @map("correct_answer")
  errorType      String   @map("error_type")
  responseTimeMs Int?     @map("response_time_ms")
  answeredAt     DateTime @default(now()) @map("answered_at")
  createdAt      DateTime @default(now()) @map("created_at")

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([learnerId, createdAt])
  @@map("error_events")
}

model LearnerGoal {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId  String    @map("learner_id") @db.Uuid
  subject    String
  targetDate DateTime? @map("target_date") @db.Date
  priority   Int       @default(1)
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  learner Profile @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@map("learner_goals")
}

model CurriculumChunk {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  subject    String
  conceptId  String   @map("concept_id")
  content    String
  // embedding vector(1536) — managed via $queryRaw and prisma-extension-pgvector
  // NOT represented as a Prisma field due to Prisma's lack of native vector support
  chunkIndex Int      @default(0) @map("chunk_index")
  sourceDoc  String?  @map("source_doc")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([conceptId])
  @@map("curriculum_chunks")
}
```

### pgvector Note
The `embedding vector(1536)` column on `curriculum_chunks` is managed outside Prisma's schema
(added via a raw migration). Vector similarity searches use `prisma.$queryRaw` or
`prisma-extension-pgvector`. The embedding dimension is **1536** — never change this without
a coordinated migration and full re-embedding.

### RLS Policies
Row-Level Security policies are managed in `supabase/policies/*.sql` — separate from
Prisma migrations. Prisma migrations handle table structure; Supabase policies handle
row-level access control.

---

## 9. AI Architecture

### Models
| Role | Provider | Model ID |
|---|---|---|
| Primary | Anthropic | `claude-sonnet-4-6` |
| Fallback | OpenAI | `gpt-4o` |
| Embeddings | OpenAI | `text-embedding-ada-002` (1536-dim) |
| Embedding fallback | OpenAI | `text-embedding-3-small` (1536-dim) |

> Note: Anthropic does not offer a public embedding model. OpenAI ada-002 is used for all embeddings.

### Fallback Trigger Conditions
- Claude API timeout > 10 seconds
- HTTP 429 (rate limit)
- HTTP 5xx (server error)
- Any unhandled exception from the Anthropic SDK

### RAG Pipeline
```
User query / concept_id
      ↓
Generate embedding (OpenAI ada-002)
      ↓
pgvector cosine similarity search on curriculum_chunks (top-k = 5)
      ↓
Ranked chunks injected into prompt context
      ↓
Claude generates grounded response
```

### Prompt Management
All prompts in `apps/api/src/ai/prompts/` as typed TypeScript functions:
```ts
export function buildQuestionGenerationPrompt(ctx: QuestionGenerationContext): string
```
No raw prompt strings outside this directory. Ever.

### LLM Output Validation
All LLM responses parsed and validated with **Zod schemas** before entering business logic.
If validation fails: retry once with a correction prompt. If still invalid: throw `AiUnavailableException`.

---

## 10. Queue Architecture

Long-running tasks (curriculum ingestion, batch embedding) run as BullMQ jobs.
They must never block an HTTP request.

### Queue Names (defined in `queue.constants.ts`)
```
QUEUE_CURRICULUM_INGESTION = 'curriculum-ingestion'
QUEUE_EMBEDDING_GENERATION = 'embedding-generation'
```

### Job Flow — Curriculum Ingestion
```
POST /curriculum/ingest (HTTP — returns immediately with jobId)
      ↓
CurriculumService enqueues job → QUEUE_CURRICULUM_INGESTION
      ↓
CurriculumIngestionProcessor picks up job
      ↓
Chunks document → generates embeddings → inserts into DB
      ↓
Job completes (status queryable via GET /curriculum/jobs/:jobId)
```

### Redis Connection
- Redis client: `ioredis` via `@nestjs/bullmq`
- Connection URL: `UPSTASH_REDIS_URL` from env
- Both BullMQ and cache-manager share the same Redis instance via separate connection configs

---

## 11. Caching Architecture

**Cache store:** Redis (Upstash) via `@nestjs/cache-manager`
**Cache keys are namespaced:** `dersify:{resource}:{id}` (e.g. `dersify:progress:user-uuid`)

### What Gets Cached
| Resource | TTL | Invalidation |
|---|---|---|
| Learner progress summary | 5 minutes | On session end |
| Due knowledge states | 2 minutes | On knowledge state update |
| Curriculum chunks by concept | 1 hour | On re-ingestion |
| AI-generated questions | 10 minutes | By concept+difficulty key |

### What is Never Cached
- Authentication tokens
- Raw learner answers
- Error events

---

## 12. Authentication Flow

```
Frontend (Supabase browser client)
  → Supabase Auth (email/password)
  → Returns Supabase access_token (JWT) + refresh_token
  → Frontend stores tokens in httpOnly cookies
  → All API calls: Authorization: Bearer <access_token>
  → NestJS JwtStrategy validates against Supabase JWT secret (HS256) or JWKS (ES256)
  → @CurrentUser() decorator extracts learnerId (sub) from validated payload
```

- Session management: Supabase handles token refresh on the frontend
- Backend: stateless JWT validation — no server-side session storage
- Token storage: httpOnly cookies only — never localStorage

---

## 13. Environment Variables

### `apps/api/.env`
```
PORT=3001
APP_URL=http://localhost:3000

# Supabase (Auth + Storage only — not for DB queries)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_JWT_SECRET=

# Prisma / PostgreSQL (DB queries)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
DATABASE_DIRECT_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_URL=

# Sentry
SENTRY_DSN=
```

### `apps/web/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SENTRY_DSN=
```

### `packages/database/.env`
```
DATABASE_URL=
DATABASE_DIRECT_URL=
```

---

## 14. Testing Strategy

### Backend (`apps/api`)
| Type | Tool | What it covers |
|---|---|---|
| Unit | Jest | Services, SM-2 algorithm, prompt builders, Zod validators |
| Integration | Jest + Prisma test client | Service → DB round trips with test DB |
| E2E | Jest + Supertest | Full HTTP flow through controllers |

**Test DB:** A separate Supabase project (or local Postgres with pgvector) configured via `DATABASE_URL` in `.env.test`.
**AI calls in tests:** Always mocked via `jest.spyOn` on `AiService`. Never make real API calls in tests.

### Frontend (`apps/web`)
| Type | Tool | What it covers |
|---|---|---|
| Unit | Vitest | Utility functions, hooks |
| Component | Testing Library | UI components in isolation |
| E2E | Playwright | Auth flow, learning session, progress page |

### Coverage Targets
- SM-2 algorithm: 100% line coverage
- Services: 80%+ line coverage
- Prompt builders: 100% (deterministic output)

---

## 15. Observability

| Concern | Tool | Notes |
|---|---|---|
| Error tracking | Sentry | Both api (NestJS) and web (Next.js) |
| Structured logging | NestJS built-in Logger + pino | JSON logs in production |
| Health checks | @nestjs/terminus | `GET /health` checks: DB, Redis, Supabase |
| AI call tracking | Custom interceptor in AiService | Logs provider, model, token count, latency |

All logs must be structured JSON in production. Never use `console.log`.
Sensitive data (tokens, user content) must never appear in logs.

---

## 16. Feature Build Sequence

Build in strict order. Do not start F-N+1 before F-N is complete.

| ID | Feature | Modules |
|---|---|---|
| F-01 | Auth (register, login, JWT) ✅ | auth |
| F-02 | Learner profile + goal setting | learner |
| F-03 | SM-2 spaced repetition core loop | learner |
| F-04 | Curriculum ingestion + RAG pipeline | curriculum, rag, queue |
| F-05 | AI question generation (RAG-grounded) | ai, rag |
| F-06 | Answer evaluation + error event recording | session, ai |
| F-07 | Misconception detection + tracking | learner, ai |
| F-08 | Session management (start/end/summary) | session, web: learn/ |
| F-09 | Learner progress dashboard | learner, web: progress/ |
| F-10 | Adaptive difficulty + focus mode | learner, ai, session |

---

## 17. API Versioning

- All endpoints prefixed `/api/v1`
- Breaking changes → new version prefix (never modify existing contract)
- Swagger docs auto-generated at `/api/docs` in non-production environments
