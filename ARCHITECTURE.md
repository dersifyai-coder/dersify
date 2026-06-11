# Dersify — System Architecture

> Single source of truth. Every agent reads this completely before writing one line of code.
> Do not deviate without explicit instruction from the project owner.

---

## 1. Product Identity

**Dersify** is an AI-native learning system.
It teaches any learner any subject by building a persistent, evolving model of who they are and where their knowledge stands. It has no pre-built courses, no fixed curriculum, no locked subjects. The learner brings the topic. Dersify brings the intelligence.

**What separates Dersify from everything else:**
Every other tool resets to zero each session. Dersify assembles a complete picture of the learner — their behavioral profile, their knowledge history, their misconceptions, their calibration accuracy — and injects it into the AI before the first message. The AI starts from where this specific person actually is, not from the beginning.

**Standard:** Every decision is evaluated against one question — would this still be correct if Dersify had one million learners across every subject, language, and skill level?

---

## 2. The Two-System Architecture

The most important structural decision in Dersify. Everything flows from this.

```
┌─────────────────────────────────────────────────────────────┐
│  SYSTEM 1 — ONBOARDING                                      │
│  Runs: ONCE per learner lifetime (~90 seconds)              │
│  Purpose: Build the permanent behavioral profile            │
│  Stores: motivation, learning_approach, struggle_response,  │
│          hours_per_week, learning_pace                      │
│  Never repeated. Never editable by the learner mid-session. │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SYSTEM 2 — SESSION DIAGNOSTIC                              │
│  Runs: per new or stale topic (stale = >14 days since       │
│         MAX(knowledge_states.last_reviewed_at) for topic)   │
│  Purpose: Calibrate the AI for this specific session        │
│  Stores: topic, prior_knowledge_signal, time_available_mins │
│  Not a route — a component that fires inside /learn         │
│  Skipped: same topic, active in last 14 days                │
└─────────────────────────────────────────────────────────────┘
```

**Rule:** Never mix these systems. Onboarding asks who the learner is. The session diagnostic asks what they are doing today. They serve different purposes and must never share a screen.

---

## 3. Monorepo Structure

```
dersify/
├── apps/
│   ├── web/               # Next.js 15 frontend
│   └── api/               # NestJS backend
├── packages/
│   └── database/          # Prisma schema, client, migrations
├── supabase/
│   └── policies/          # RLS policies only (not schema)
├── .github/
│   └── workflows/         # CI/CD
├── package.json           # pnpm workspaces root
└── turbo.json             # Turborepo config
```

**Package manager:** pnpm exclusively. Never npm or yarn.
**Build system:** Turborepo for incremental builds.

---

## 4. Tech Stack

### Frontend — `apps/web`

| Concern | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components default) |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 |
| Auth client | @supabase/ssr |
| Server state | TanStack Query v5 |
| Forms | react-hook-form + Zod |
| Fonts | Sora (headings), JetBrains Mono (code) via next/font |

### Backend — `apps/api`

| Concern | Technology |
|---|---|
| Framework | NestJS latest |
| Language | TypeScript strict |
| ORM | Prisma via packages/database |
| Auth | Supabase Auth + Passport JWT |
| Validation | class-validator + class-transformer (global) |
| LLM output | Zod schemas (all AI responses validated before use) |
| AI Primary | Google Gemini (`@google/generative-ai`) |
| AI Fallback | OpenAI GPT (`openai` SDK) |
| Payments | Stripe (`stripe` SDK) |
| Queue | BullMQ + @nestjs/bullmq |
| Cache | @nestjs/cache-manager + ioredis |
| Rate limiting | @nestjs/throttler with Redis storage |
| API docs | @nestjs/swagger (non-production only) |
| Health | @nestjs/terminus |
| Security | helmet, cors |

### Shared — `packages/database`

| Concern | Technology |
|---|---|
| ORM | Prisma (schema is the single source of truth) |
| DB | PostgreSQL via Supabase |
| Vector store | pgvector — embedding dimension 768 |
| Client | PrismaClient singleton exported for api only |

### Infrastructure

| Concern | Service |
|---|---|
| Frontend | Vercel (global edge) |
| Backend | Railway |
| Database + Auth | Supabase |
| Cache + Queues | Upstash Redis (global, serverless) |
| File storage | Supabase Storage |
| Payments | Stripe |
| Email | Resend |
| Error tracking | Sentry |
| CI/CD | GitHub Actions |

---

## 5. Brand System

```
Primary Blue : #1B4FDB  → Tailwind: text-primary / bg-primary
Teal         : #0D9488  → Tailwind: text-teal / bg-teal
Deep Navy    : #0A1628  → Tailwind: text-navy / bg-navy
Amber (warn) : #F59E0B  → Tailwind: text-amber / bg-amber
Gradient     : 135deg from #1B4FDB to #0D9488

Fonts:
  Headings : Sora (--font-sora)
  Code     : JetBrains Mono (--font-jetbrains-mono)
  Body     : Sora 400
```

All colors defined as CSS custom properties in `globals.css` only. Never hardcode hex values anywhere else.

---

## 6. Frontend Route Map

```
/                          → Landing (public)
/auth/login                → Login
/auth/register             → Register

/onboarding                → SYSTEM 1 — standalone, no dashboard chrome
                             Gate: authenticated && !onboarding_completed
                             Redirect away if onboarding_completed = true

/dashboard                 → Home (recent sessions, due concepts, start CTA)
/dashboard/learn           → Learning session (SYSTEM 2 fires here when needed)
/dashboard/progress        → Forgetting curve map + insights + weekly digest
/dashboard/settings        → Profile (read-only) + account + subscription

/api/webhooks/stripe       → Stripe webhook handler (no auth, signature verified)
```

**Middleware routing rules (evaluated in order):**
1. Not authenticated → `/auth/login`
2. Authenticated + `!onboarding_completed` → `/onboarding`
3. On `/onboarding` + `onboarding_completed` → `/dashboard`
4. Otherwise → allow

---

## 7. Frontend Architecture

```
apps/web/src/
├── app/
│   ├── layout.tsx                    # Root: fonts, providers, Sentry
│   ├── page.tsx                      # Landing
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── onboarding/
│   │   └── page.tsx                  # SYSTEM 1 — 3-step wizard, isolated layout
│   └── dashboard/
│       ├── layout.tsx                # Nav shell
│       ├── page.tsx                  # Home
│       ├── learn/page.tsx            # Session page
│       ├── progress/page.tsx         # Dashboard
│       └── settings/page.tsx        # Account + subscription
│
├── components/
│   ├── ui/                           # Button, Input, Card, Badge, Chip, Spinner
│   ├── onboarding/
│   │   └── onboarding-wizard.tsx     # 3-step state machine
│   ├── session/
│   │   ├── session-diagnostic.tsx   # SYSTEM 2 calibration component
│   │   ├── conversation-thread.tsx  # Message list renderer
│   │   ├── message-input.tsx        # Learner input bar
│   │   └── session-end-screen.tsx   # Reflection + model update + next action
│   └── progress/
│       ├── forgetting-curve-map.tsx
│       └── weekly-digest.tsx
│
├── lib/
│   ├── supabase/client.ts            # Browser client (auth + storage only)
│   ├── supabase/server.ts            # Server client
│   ├── api.ts                        # Server-only typed fetch (apiFetch)
│   ├── api-client.ts                 # Browser-side fetch (reads cookie)
│   └── utils/cn.ts
│
├── hooks/
│   ├── use-session.ts
│   ├── use-learner.ts
│   └── use-progress.ts
│
├── providers/
│   └── query-provider.tsx
│
├── types/index.ts                    # Frontend types only (not Prisma)
└── styles/globals.css
```

---

## 8. Backend Module Map

```
apps/api/src/
├── app.module.ts
├── main.ts                          # helmet, cors, ValidationPipe, Swagger, /api/v1
│
├── prisma/
│   ├── prisma.module.ts             # Global module
│   └── prisma.service.ts            # NestJS PrismaClient wrapper
│
├── auth/                            # F-01 ✅
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/ [register, login, refresh]
│   ├── strategies/jwt.strategy.ts
│   └── guards/jwt-auth.guard.ts
│
├── onboarding/                      # F-02
│   ├── onboarding.module.ts
│   ├── onboarding.controller.ts     # POST /onboarding/complete
│   ├── onboarding.service.ts        # Saves profile fields atomically
│   └── dto/complete-onboarding.dto.ts
│
├── concept-registry/                # F-03
│   ├── concept-registry.module.ts
│   ├── concept-registry.service.ts  # Canonical ID lookup, normalization, creation
│   └── concept-registry.types.ts
│
├── learner/                         # F-03, F-07, F-08
│   ├── learner.module.ts
│   ├── learner.controller.ts
│   ├── learner.service.ts           # FSRS state, misconceptions, progress
│   ├── fsrs.ts                      # Pure FSRS algorithm (no side effects)
│   ├── fsrs.constants.ts
│   └── dto/ [update-knowledge-state, resolve-misconception]
│
├── context/                         # F-04 — THE core service
│   ├── context.module.ts
│   ├── context.service.ts           # Assembles 3-layer AI system prompt
│   ├── context-budget.manager.ts    # Token counting + compression trigger
│   ├── signal-detector.service.ts   # Rule-based + AI escalation
│   ├── session-insights.ts          # SessionInsights interface + initializer
│   ├── mode-shifts.ts               # Mode definitions + trigger conditions
│   └── motivation-framing.ts        # Explicit motivation → teaching style map
│
├── sources/                         # F-05 — "Your Sources"
│   ├── sources.module.ts
│   ├── sources.controller.ts        # POST /sources/upload, /sources/url, /sources/youtube
│   ├── sources.service.ts
│   └── dto/add-source.dto.ts
│
├── rag/                             # F-05
│   ├── rag.module.ts
│   └── rag.service.ts               # Embedding + pgvector search (per-learner)
│
├── session/                         # F-06, F-07, F-08, F-09, F-11
│   ├── session.module.ts
│   ├── session.controller.ts
│   ├── session.service.ts           # Full session lifecycle
│   ├── session-messages.service.ts  # Conversation storage + continuity
│   ├── difficulty.constants.ts
│   └── dto/ [start-session, send-message, end-session]
│
├── ai/                              # F-06, F-07, F-09 — single AI gateway
│   ├── ai.module.ts
│   ├── ai.service.ts                # Model routing, fallback, retry, Zod validation
│   ├── ai.constants.ts              # MODEL_ROUTING table, EMBEDDING_DIMENSION=768
│   ├── exceptions/ai-unavailable.exception.ts
│   └── prompts/
│       ├── session-turn.prompt.ts
│       ├── exchange-evaluation.prompt.ts
│       ├── misconception-detection.prompt.ts
│       ├── session-summary.prompt.ts
│       └── signal-detection.prompt.ts
│
├── subscription/                    # F-12
│   ├── subscription.module.ts
│   ├── subscription.controller.ts   # POST /subscription/checkout, /subscription/portal
│   ├── subscription.service.ts      # Tier checks, usage tracking, Stripe sync
│   ├── usage.service.ts             # Redis + DB usage recording
│   ├── webhook.controller.ts        # POST /webhooks/stripe
│   └── dto/
│
├── queue/
│   ├── queue.module.ts
│   ├── queue.constants.ts
│   └── processors/
│       ├── embedding.processor.ts   # Chunk + embed uploaded sources
│       ├── weekly-digest.processor.ts
│       └── concept-normalization.processor.ts
│
├── health/
│   ├── health.module.ts
│   └── health.controller.ts         # GET /health
│
├── common/
│   ├── decorators/current-user.decorator.ts
│   ├── decorators/subscription-tier.decorator.ts
│   ├── filters/global-exception.filter.ts
│   ├── guards/subscription.guard.ts # Checks tier + usage limits
│   └── dto/pagination.dto.ts
│
├── config/configuration.ts
└── lib/supabase.ts                  # Admin client — Auth + Storage ONLY
```

---

## 9. Database Schema — Prisma

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

// ─── IDENTITY ─────────────────────────────────────────────────────

model Profile {
  id String @id @db.Uuid

  // Basic
  fullName String? @map("full_name")
  email    String  @unique

  // Onboarding — permanent behavioral profile (SYSTEM 1)
  motivation       String?  // 'learn-skill'|'career-advance'|'exam-prep'|'build-project'|'academic'|'curiosity'
  learningApproach String?  @map("learning_approach")
  struggleResponse String?  @map("struggle_response")
  hoursPerWeek     String?  @map("hours_per_week")   // 'lt1'|'1-3'|'3-5'|'5-10'|'gt10'
  learningPace     String?  @map("learning_pace")    // 'slow-deep'|'steady'|'fast'|'flexible'
  onboardingCompleted Boolean @default(false) @map("onboarding_completed")

  // Calibration — difference between self-report and demonstrated level
  // Range: -2.0 (chronic overestimator) to +2.0 (chronic underestimator)
  calibrationScore Float @default(0.0) @map("calibration_score")

  // Subscription tier — denormalized for fast gate checks
  subscriptionTier String @default("free") @map("subscription_tier") // 'free'|'pro'|'teams'

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  knowledgeStates      LearnerKnowledgeState[]
  misconceptions       Misconception[]
  sessions             Session[]
  sources              LearnerSource[]
  subscription         Subscription?
  notificationPrefs    NotificationPreference?

  @@map("profiles")
}

// ─── CONCEPT REGISTRY ─────────────────────────────────────────────

model ConceptRegistry {
  // canonicalId: stable slug — e.g. "business.competitive-analysis.porters-five-forces"
  // Never changes once set. All knowledge states reference this.
  canonicalId   String   @id @map("canonical_id")
  displayName   String   @map("display_name")
  topic         String
  aliases       String[] // AI-generated variants that resolve to this canonical
  prerequisites String[] // canonical_ids of concepts needed before this one
  related       String[] // canonical_ids of transferable concepts
  status        String   @default("ai_generated") // 'ai_generated'|'verified'
  sessionCount  Int      @default(0) @map("session_count") // how many sessions touched this
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  knowledgeStates LearnerKnowledgeState[]
  misconceptions  Misconception[]

  @@index([topic, status])
  @@index([sessionCount(sort: Desc)])
  @@map("concept_registry")
}

// ─── LEARNER MODEL — FSRS ─────────────────────────────────────────

model LearnerKnowledgeState {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId   String @map("learner_id") @db.Uuid
  conceptId   String @map("concept_id")  // FK to concept_registry.canonical_id
  topic       String

  // FSRS algorithm fields
  stability       Float    @default(0.0)  // memory stability in days
  difficulty      Float    @default(0.3)  // inherent difficulty 0.0–1.0
  elapsedDays     Int      @default(0) @map("elapsed_days")
  scheduledDays   Int      @default(0) @map("scheduled_days")
  reps            Int      @default(0)    // total review count
  lapses          Int      @default(0)    // times forgotten
  fsrsState       Int      @default(0) @map("fsrs_state") // 0=New 1=Learning 2=Review 3=Relearning
  due             DateTime @default(now()) // next review date

  // Derived for display and ContextService
  confidence      Float    @default(0.0)  // 0.0–1.0 derived from stability
  lastReviewedAt  DateTime? @map("last_reviewed_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  learner  Profile         @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  concept  ConceptRegistry @relation(fields: [conceptId], references: [canonicalId])

  @@unique([learnerId, conceptId])
  @@index([learnerId, topic, due])
  @@map("learner_knowledge_states")
}

model Misconception {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId   String @map("learner_id") @db.Uuid
  conceptId   String @map("concept_id")
  topic       String

  description    String
  misconceptionType String @map("misconception_type")
  // 'terminology'|'overgeneralization'|'underapplication'|
  // 'causal_inversion'|'false_analogy'|'structural'

  remediationStrategy String? @map("remediation_strategy") // AI-generated
  frequency       Int      @default(1)
  resolved        Boolean  @default(false)
  resolvedInSession String? @map("resolved_in_session") @db.Uuid // session where resolved

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  learner  Profile         @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  concept  ConceptRegistry @relation(fields: [conceptId], references: [canonicalId])

  @@index([learnerId, topic, resolved])
  @@map("misconceptions")
}

// ─── SESSION ──────────────────────────────────────────────────────

model Session {
  id        String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId String @map("learner_id") @db.Uuid

  // Session Diagnostic (SYSTEM 2) fields
  topic                String
  priorKnowledgeSignal String  @map("prior_knowledge_signal")
  timeAvailableMinutes Int     @map("time_available_minutes")

  // Session state
  startedAt         DateTime  @default(now()) @map("started_at")
  endedAt           DateTime? @map("ended_at")
  currentPhase      String    @default("activation") @map("current_phase")
  // 'activation'|'core'|'consolidation'

  // Session Intelligence
  currentMode       String    @default("exploration") @map("current_mode")
  focusState        String?   @map("focus_state")  // 'focus'|'diffuse'|'fatigued'|'warming_up'
  strugglesCount    Int       @default(0) @map("struggles_count")
  momentumCount     Int       @default(0) @map("momentum_count")

  // Outcomes
  conceptsCovered   String[]  @map("concepts_covered")
  exchangesCount    Int       @default(0) @map("exchanges_count")
  tokenBudgetUsed   Int       @default(0) @map("token_budget_used")

  // Continuity
  lastActivityAt    DateTime  @default(now()) @map("last_activity_at")

  createdAt DateTime @default(now()) @map("created_at")

  learner      Profile         @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  messages     SessionMessage[]
  errorEvents  ErrorEvent[]

  @@index([learnerId, topic, startedAt(sort: Desc)])
  @@map("sessions")
}

model SessionMessage {
  id        String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sessionId String @map("session_id") @db.Uuid
  role      String // 'user' | 'assistant'
  content   String @db.Text
  turnIndex Int    @map("turn_index")

  // Compression — raw content replaced with summary after threshold
  compressed        Boolean @default(false)
  compressionSummary String? @map("compression_summary") @db.Text

  createdAt DateTime @default(now()) @map("created_at")

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId, turnIndex])
  @@map("session_messages")
}

model ErrorEvent {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sessionId   String @map("session_id") @db.Uuid
  learnerId   String @map("learner_id") @db.Uuid
  conceptId   String @map("concept_id")
  topic       String

  exchangeText     String  @map("exchange_text") @db.Text
  errorType        String  @map("error_type")
  // 'misconception'|'recall_failure'|'careless'
  understandingSignal String @map("understanding_signal")
  // 'confirmed'|'partial'|'confused'|'memorized'|'breakthrough'
  retentionQuality Int     @map("retention_quality") // 0-4 (FSRS: Again/Hard/Good/Easy)
  responseTimeMs   Int?    @map("response_time_ms")
  answeredAt       DateTime @default(now()) @map("answered_at")
  createdAt        DateTime @default(now()) @map("created_at")

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([learnerId, topic, createdAt])
  @@map("error_events")
}

// ─── SOURCES — YOUR SOURCES ───────────────────────────────────────

model LearnerSource {
  id        String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId String @map("learner_id") @db.Uuid
  topic     String
  sourceType String @map("source_type") // 'pdf'|'text'|'url'|'youtube'
  title     String
  sourceRef String  @map("source_ref")  // storage path, URL, or YouTube ID
  status    String  @default("processing") // 'processing'|'ready'|'failed'
  chunkCount Int    @default(0) @map("chunk_count")
  createdAt DateTime @default(now()) @map("created_at")

  learner Profile       @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  chunks  SourceChunk[]

  @@index([learnerId, topic, status])
  @@map("learner_sources")
}

model SourceChunk {
  id         String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sourceId   String @map("source_id") @db.Uuid
  learnerId  String @map("learner_id") @db.Uuid
  topic      String
  content    String @db.Text
  // embedding vector(768) — managed via $queryRaw (pgvector)
  chunkIndex Int    @default(0) @map("chunk_index")
  createdAt  DateTime @default(now()) @map("created_at")

  source LearnerSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  @@index([learnerId, topic])
  @@map("source_chunks")
}

// ─── SUBSCRIPTION + USAGE ─────────────────────────────────────────

model Subscription {
  id        String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId String @unique @map("learner_id") @db.Uuid

  tier      String @default("free")   // 'free'|'pro'|'teams'
  status    String @default("active") // 'active'|'cancelled'|'past_due'|'trialing'

  stripeCustomerId     String? @unique @map("stripe_customer_id")
  stripeSubscriptionId String? @unique @map("stripe_subscription_id")
  stripePriceId        String? @map("stripe_price_id")

  currentPeriodStart DateTime? @map("current_period_start")
  currentPeriodEnd   DateTime? @map("current_period_end")
  cancelAtPeriodEnd  Boolean   @default(false) @map("cancel_at_period_end")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  learner Profile @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

model UsageRecord {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  learnerId String   @map("learner_id") @db.Uuid
  date      DateTime @db.Date

  sessionsUsed     Int   @default(0) @map("sessions_used")
  exchangesUsed    Int   @default(0) @map("exchanges_used")
  tokensUsed       Int   @default(0) @map("tokens_used")
  estimatedCostUsd Float @default(0) @map("estimated_cost_usd")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([learnerId, date])
  @@map("usage_records")
}

model NotificationPreference {
  learnerId              String  @id @map("learner_id") @db.Uuid
  emailEnabled           Boolean @default(true)  @map("email_enabled")
  dailyReviewReminder    Boolean @default(true)  @map("daily_review_reminder")
  weeklyDigestEnabled    Boolean @default(false) @map("weekly_digest_enabled")
  reminderHourUtc        Int     @default(9) @map("reminder_hour_utc")
  timezone               String  @default("UTC")
  createdAt              DateTime @default(now()) @map("created_at")
  updatedAt              DateTime @updatedAt @map("updated_at")

  @@map("notification_preferences")
}
```

**Embedding dimension:** 768 (Gemini `text-embedding-004` native, OpenAI `text-embedding-3-small` configured to 768).
**Vector column** on `source_chunks` is added via raw SQL in migration — not a Prisma field.
**RLS policies** live in `supabase/policies/` — separate from Prisma migrations.

---

## 10. AI Architecture — Model Routing

### The Principle
Not one primary and one fallback. Each operation is assigned the exact model tier it needs — no more expensive, no less capable than required.

### Model Routing Table — `ai.constants.ts`

```ts
export const EMBEDDING_DIMENSION = 768;
export const SESSION_TOKEN_HARD_LIMIT = 100_000;
export const AI_TIMEOUT_MS = 10_000;

export const MODEL_ROUTING = {
  // Rich conversation — needs best reasoning
  session_turn_pro:           { primary: 'gemini-1.5-pro',   fallback: 'gpt-4o' },
  session_turn_free:          { primary: 'gemini-2.0-flash', fallback: 'gpt-4o-mini' },

  // Classification tasks — fast and cheap
  signal_detection:           { primary: 'gemini-2.0-flash', fallback: 'gpt-4o-mini' },
  exchange_evaluation:        { primary: 'gemini-2.0-flash', fallback: 'gpt-4o-mini' },
  misconception_detection:    { primary: 'gemini-2.0-flash', fallback: 'gpt-4o-mini' },
  session_summary:            { primary: 'gemini-2.0-flash', fallback: 'gpt-4o-mini' },

  // High-quality outputs generated infrequently
  weekly_digest:              { primary: 'gemini-1.5-pro',   fallback: 'gpt-4o' },
  misconception_remediation:  { primary: 'gemini-1.5-pro',   fallback: 'gpt-4o' },

  // Embeddings
  embedding_primary:          { model: 'text-embedding-004',     provider: 'google' },
  embedding_fallback:         { model: 'text-embedding-3-small', provider: 'openai', dimensions: 768 },
} as const;
```

### Fallback Trigger Conditions
- Timeout > `AI_TIMEOUT_MS` (10 seconds)
- HTTP 429 (rate limit) from primary provider
- HTTP 5xx from primary provider
- Any SDK-level exception

If both providers fail → throw `AiUnavailableException`.
Non-critical operations (signal detection, focus heuristic) catch `AiUnavailableException` and degrade gracefully.

### All AI Calls Through AiService
No module, controller, or other service may import `@google/generative-ai` or `openai` directly.
Every LLM call goes through `apps/api/src/ai/ai.service.ts`.

### Zod Validation — Mandatory
Every AI response that drives application logic is parsed with a Zod schema before use.
If validation fails: retry once with a correction prompt. If still invalid: throw `AiUnavailableException`.

---

## 11. Session Intelligence Architecture

### Overview
Three services work together underneath every session, invisible to the learner.

```
Learner message arrives
       ↓
SignalDetector.analyze(message, sessionInsights)    ← runs in parallel
       ↓                                               with AI call
SessionInsights updated with new signals
       ↓
Mode shift evaluated (may change currentMode)
       ↓
ContextService.buildDelta(sessionInsights)
       ↓
AiService.sessionTurn(layer1 + delta + conversationHistory)
       ↓
Response sent to learner
```

### SignalDetector

Rule-based primary (zero AI cost). AI escalation for ambiguous signals only.

```ts
// Rule-based triggers (apps/api/src/context/signal-detector.service.ts)
type SessionSignal =
  | { type: 'struggle';       concept: string; severity: 1 | 2 | 3 }
  | { type: 'misconception';  concept: string; description: string }
  | { type: 'momentum';       concept: string }
  | { type: 'confusion';      about: string }
  | { type: 'breakthrough';   concept: string }
  | { type: 'disengagement' }
  | { type: 'off_topic' };

interface SignalDetectionResult {
  signals: SessionSignal[];
  urgency: 'none' | 'low' | 'high';
  requiresAiEscalation: boolean; // true when rules give inconclusive result
}
```

**Rule triggers:**
- message word count < 8 AND consecutiveShortMessages >= 2 → confusion
- Explicit confusion phrases ("I don't get", "lost", "confused") → confusion
- Response time > 3× session baseline → cognitive load
- Repeated incorrect answer on same concept → misconception
- "I see", "makes sense", short confident reply after explanation → momentum
- Message unrelated to session topic → off_topic

AI escalation fires only when `requiresAiEscalation: true`. Uses `signal_detection` model tier (cheapest).

### SessionInsights — Working Memory

```ts
interface SessionInsights {
  // Signal tracking
  struggleSignals:        number;
  momentumSignals:        number;
  consecutiveStruggles:   number;   // resets on momentum
  consecutiveMomentum:    number;   // resets on struggle

  // Concept tracking
  conceptsEngaged:        string[]; // concept canonical IDs touched
  conceptsConfirmed:      string[];
  conceptsStruggledWith:  string[];

  // Misconception tracking
  newMisconceptionsDetected: {
    conceptId:   string;
    description: string;
    type:        string;
    detectedAt:  number; // turn index
  }[];

  // Mode tracking
  currentMode:  SessionMode;
  modeHistory:  { mode: SessionMode; triggeredAt: number; reason: string }[];

  // Phase tracking
  currentPhase: 'activation' | 'core' | 'consolidation';

  // Engagement
  lastEngagementSignalAt: number; // turn index
  offTopicCount:          number;
  responseTimes:          number[]; // ms per turn

  // Calibration
  selfReportedLevel:   string;
  demonstratedLevel:   number; // 0–5, updated each exchange
  calibrationDelta:    number;
}
```

This object lives in Redis for the session duration. At session end, the post-session pipeline reads it to update the permanent learner model.

### Session Modes

```ts
type SessionMode =
  | 'exploration'   // default — engaging normally
  | 'consolidation' // getting things right — deepen and connect
  | 'rescue'        // struggling — simplify, change approach
  | 'acceleration'  // ahead of expectations — move faster
  | 'refocus';      // off-topic or disengaged — re-anchor

// Mode shift triggers (mode-shifts.ts)
const MODE_TRIGGERS = {
  rescue:        { condition: 'consecutiveStruggles >= 3 OR struggle.severity === 3' },
  acceleration:  { condition: 'consecutiveMomentum >= 4 AND demonstratedLevel > selfReportedLevel + 1' },
  consolidation: { condition: 'consecutiveMomentum >= 2 AND currentMode === exploration' },
  refocus:       { condition: 'offTopicCount >= 2 OR lastEngagementSignalAt < turnIndex - 5' },
  exploration:   { condition: 'reset after rescue clears OR manual reset' },
};
```

Each mode adds a modifier block to the Layer 2 delta. The learner never sees mode names.

### Session Phases

Three phases, time-based + insight-based, invisible to learner:

```
ACTIVATION (first 15% of time_available_minutes)
  Cold recall: 1-2 questions about concepts from last session on this topic
  Purpose: clean FSRS signal + warm up memory

CORE (middle 70%)
  Teaching + probing + misconception correction + depth adaptation
  AI drives the conversation. Learner can ask questions at any time.

CONSOLIDATION (final 15%)
  "Explain [concept] back to me in one sentence."
  Retrieval practice. Makes the learning stick.
  AI summarizes what was covered.
```

---

## 12. ContextService — Three-Layer Architecture

### Layer 1 — Permanent Context (built once at session start)

```
Learner Profile:
  Motivation:          [value + MOTIVATION_FRAMING instruction]
  Learning approach:   [value]
  When stuck:          [value]
  Pace preference:     [value]
  Calibration score:   [value + interpretation instruction]

History on THIS topic (scoped — not all topics):
  Concepts confirmed:  [canonical_ids with confidence >= 0.65, max 15]
  Concepts shaky:      [canonical_ids with confidence 0.3–0.65, max 10]
  Concepts new:        [canonical_ids with confidence < 0.3, max 10]

Active misconceptions on this topic (max 5):
  [description + type + remediation_strategy + explicit instruction to address]
```

### Layer 2 — Session Delta (rebuilt on every turn)

```
Current mode:       [mode + reason for last shift if changed]
Current phase:      [activation|core|consolidation]
New misconceptions: [detected this session, not yet in Layer 1]
Confirmed this session: [concept IDs confirmed this session]
Struggle ratio:     [struggleSignals / (struggleSignals + momentumSignals)]
Urgency:            [none|low|high from SignalDetector]
Mode instruction:   [modifier text for current mode]
```

### Layer 3 — Conversation History

All prior turns in the session. After turn 10, older turns are compressed:
`SessionMessage.compressed = true` + `compressionSummary` set by ContextBudgetManager.
Raw content removed from prompt. Summary string replaces it.

### ContextBudgetManager

Monitors token count before every AI call.
Hard limit: `SESSION_TOKEN_HARD_LIMIT` = 100,000 tokens.
At 60% of limit: compress oldest 5 turns.
At 80% of limit: trigger consolidation phase.
At 95% of limit: graceful session end.

### Motivation Framing — `motivation-framing.ts`

```ts
export const MOTIVATION_FRAMING: Record<string, string> = {
  'build-project':   'Frame every concept as a tool. Lead application before theory. Connect to what the learner is building. Skip theory that does not serve the build.',
  'career-advance':  'Connect concepts to professional decisions and impact. Use industry language. Prioritize what matters in practice over academic completeness.',
  'exam-prep':       'Prioritize definitions, recall, edge cases, and exam traps. Be precise. Flag high-frequency concepts. Brevity over exploration.',
  'academic':        'Be thorough. Cover theory properly. Make inter-concept connections. Depth and rigor are the goal.',
  'learn-skill':     'Build progressively. Establish fundamentals before complexity. Use clear examples at each step.',
  'curiosity':       'Follow interesting threads. Go deep when engaged. Explore broadly. Structure is secondary to discovery.',
};
```

---

## 13. FSRS Engine

### Algorithm Location
`apps/api/src/learner/fsrs.ts` — pure functions only. No side effects. No database calls. 100% unit test coverage required.

### FSRS Rating Scale (maps to retentionQuality in ExchangeEvaluation)

```
1 = Again   (complete failure to recall)
2 = Hard    (recalled with significant difficulty)
3 = Good    (recalled with some effort)
4 = Easy    (recalled perfectly, effortlessly)
```

### State Transitions
```
New     → Learning  (first review)
Learning → Review   (after enough successful reps)
Review   → Relearning (if Again rated)
Relearning → Review (after successful re-learn)
```

### Cold Recall — FSRS Primary Signal
At the start of every returning session (not session 1), the AI asks 1-2 direct recall questions about concepts reviewed in the last session before the conversation begins. These produce the cleanest FSRS rating signals. Conversational exchange evaluations produce soft adjustment signals (±20% of scheduled interval), not the anchor signal.

---

## 14. Concept Registry — Three-Tier Curation

### How Concept IDs Are Created
1. Session AI generates a concept identifier during the session
2. `ConceptRegistryService.resolveOrCreate(rawId, topic)` runs synchronously
3. Embedding similarity search against existing registry (cosine > 0.92 = same concept)
4. If match found: return canonical_id of existing concept
5. If new: insert into `concept_registry` with `status: 'ai_generated'`, return new canonical_id
6. All `learner_knowledge_states` writes use only canonical_ids from the registry

### Background Normalization Job (nightly, queue)
- Find pairs with embedding similarity 0.85–0.92 → flag as merge candidates
- Concepts with < 3 sessions AND age > 30 days → archive
- Concepts referenced as prerequisites that don't exist → flag for creation

### Human Curation (Tier 3 — lightweight admin panel)
Top 500 concepts by session count get `status: 'verified'`.
Curators: merge duplicates, confirm canonical names, add prerequisites, add related.
Estimated maintenance: 2 hours/week once the system has users.
These 500 verified concepts cover ~80% of all sessions.

---

## 15. Your Sources — RAG Pipeline

### Per-Learner, Never Shared
`source_chunks` always filters by `learnerId`. One learner's sources never appear in another's session.

### Supported Input Types
```
PDF        → extract text server-side → chunk → embed
Plain text → chunk directly → embed
URL        → Jina Reader API (returns clean markdown) → chunk → embed
YouTube    → YouTube transcript API → chunk → embed
```

### Async Processing
Upload → immediate 202 response with sourceId → BullMQ job → chunk + embed → status update.
Learner sees progress indicator. Session starts with sources that are `status: 'ready'`.

### RAG in Session Context
When learner has sources for the current topic, `ContextService` adds a Layer 1 section:
`"LEARNER SOURCES: The following excerpts are from the learner's own materials — ground explanations and questions in these when relevant."`
Top-k=3 most similar chunks injected per session turn.

No sources uploaded: AI uses its own knowledge. Default behavior for most users.

### Embedding Dimension: 768
All embeddings use dimension 768. Never change without:
1. New migration to change column type
2. Re-embedding all existing source_chunks
3. Updating EMBEDDING_DIMENSION constant

---

## 16. Subscription Architecture

### Tiers

**Free — Explorer**
```
Sessions:           3/day, 5/week (resets Monday 00:00 UTC)
Exchanges/session:  20 max
AI model tier:      Fast/Cheap (gemini-2.0-flash / gpt-4o-mini)
Your Sources:       Locked
Knowledge states:   Archived after 90 days inactivity (not deleted)
Weekly digest:      Locked
Signal detection:   Rule-based only (no AI call)
Session continuity: 2-hour window only
Cold start:         Full experience
```

**Pro — Learner ($12/month or $96/year)**
```
Sessions:           Unlimited
Exchanges/session:  60 max
AI model tier:      Standard (gemini-1.5-pro / gpt-4o)
Your Sources:       10 files, 5 URLs, 3 YouTube per topic
Knowledge states:   Retained forever
Weekly digest:      Yes (Monday morning via Resend email)
Signal detection:   AI-assisted for ambiguous signals
Session continuity: 2h true resume, 24h compressed resume
Calibration:        Active + displayed
Forgetting curve:   Full detail
```

**Teams ($30/seat/month, min 3 seats)**
```
Everything in Pro
Shared team knowledge base
Admin analytics dashboard
CSV/JSON data export
SSO (SAML 2.0)
Custom rate limits
Dedicated support SLA
```

### Rate Limiting — Two-Layer Architecture

**Layer 1 — Redis (checked on every session start, every exchange):**
```
dersify:usage:{learnerId}:sessions_today      TTL: until midnight UTC
dersify:usage:{learnerId}:sessions_week       TTL: until Monday 00:00 UTC
dersify:usage:{learnerId}:exchanges:{sid}     TTL: 24h
dersify:usage:{learnerId}:tokens_today        TTL: until midnight UTC
```

**Layer 2 — Database (source of truth, UsageRecord table):**
Synced from Redis every 5 minutes via BullMQ job.

**Gate behavior:**
- Session start blocked: graceful message + upgrade CTA. Never mid-session cutoff.
- Exchange limit reached: AI sends a closing message summarizing the session. Graceful end.

### Cost Safety Mechanisms

```
Per-session token hard limit: 100,000 tokens (ContextBudgetManager enforces)
Daily spend alert thresholds (checked hourly by BullMQ cron):
  $500/day  → Slack/email alert to owner
  $1,000/day → Auto-throttle new free sessions by 50%
  $2,000/day → Suspend new free sessions; paid unaffected
Single-user anomaly: user burns >10× tier average in 24h → flag + soft limit + alert
```

### Subscription Schema Guards
`SubscriptionService.checkSessionAllowed(learnerId): Promise<{ allowed: boolean; reason?: string }>`
`SubscriptionService.checkExchangeAllowed(learnerId, sessionId): Promise<{ allowed: boolean }>`
`SubscriptionService.recordUsage(learnerId, tokensUsed): Promise<void>`

Called by `SessionService` on every operation. Never bypassed.

---

## 17. Session Continuity

```
< 2 hours since lastActivityAt   → TRUE RESUME
                                   Load all session_messages, rebuild full history
                                   "Welcome back — picking up where you left off."

2–24 hours                       → SMART RESUME
                                   Load compressed summary of prior messages
                                   "Last session summary: [compressed]. Continue?"
                                   Learner sees one-tap continue or start fresh.

> 24 hours                       → NEW SESSION
                                   Session is closed. Learner model fully updated.
                                   New session starts with updated Layer 1 context.
                                   Conversation is gone. Knowledge is permanent.
```

---

## 18. Queue Architecture

```
QUEUE_EMBEDDING_GENERATION       → EmbeddingProcessor
QUEUE_CONCEPT_NORMALIZATION      → ConceptNormalizationProcessor (nightly)
QUEUE_WEEKLY_DIGEST              → WeeklyDigestProcessor (Monday 07:00 UTC)
QUEUE_DAILY_REVIEW_REMINDER      → DailyReminderProcessor
QUEUE_USAGE_SYNC                 → UsageSyncProcessor (every 5 min)
QUEUE_COST_MONITOR               → CostMonitorProcessor (hourly)
```

All queue names defined as constants in `queue.constants.ts`. No hardcoded strings elsewhere.
All jobs: `attempts: 3`, `backoff: { type: 'exponential', delay: 2000 }`.
All processors: idempotent. Running twice must not corrupt data.

---

## 19. Caching

| Key | TTL | Invalidated by |
|---|---|---|
| `dersify:context:layer1:{learnerId}:{topic}` | 10 min | Knowledge state update, session end |
| `dersify:insights:{sessionId}` | Session duration | Session end |
| `dersify:progress:{learnerId}` | 5 min | Session end, knowledge state update |
| `dersify:due:{learnerId}:{topic}` | 2 min | Knowledge state upsert |
| `dersify:sources:{learnerId}:{topic}` | 1 hour | New source uploaded for topic |
| `dersify:tier:{learnerId}` | 5 min | Subscription update |
| `dersify:usage:{learnerId}:*` | Per-counter TTL | See §16 |

---

## 20. Authentication Flow

```
Frontend → Supabase Auth → JWT + refresh token → httpOnly cookies
API calls → Authorization: Bearer <token>
NestJS JwtStrategy → validates Supabase JWT (HS256 or ES256 via JWKS)
@CurrentUser() → extracts learnerId (sub) from payload
```

- All tokens in httpOnly, Secure, SameSite=Lax cookies. Never localStorage.
- Backend: stateless JWT validation only.
- `learnerId` always derived from JWT. Never from request body.

---

## 21. Environment Variables

### `apps/api/.env`
```
PORT=3001
APP_URL=http://localhost:3000
NODE_ENV=development
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_JWT_SECRET=
DATABASE_URL=
DATABASE_DIRECT_URL=
GOOGLE_AI_API_KEY=
OPENAI_API_KEY=
UPSTASH_REDIS_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=
```

### `apps/web/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

### `packages/database/.env`
```
DATABASE_URL=
DATABASE_DIRECT_URL=
```

---

## 22. Testing Strategy

| Type | Tool | Coverage target |
|---|---|---|
| Unit | Jest | FSRS: 100%, ContextService: 100%, SignalDetector rules: 100% |
| Integration | Jest + real test DB | Service → DB round trips |
| E2E API | Supertest | All controller endpoints |
| Frontend E2E | Playwright | Onboarding, full session, progress page |

**Rules:**
- AiService always mocked in unit tests. Never real API calls.
- Prisma always mocked via jest-mock-extended in unit tests.
- Integration tests use a separate test DB (`.env.test`).
- FSRS and ContextService assembly must have 100% coverage — these are the core business logic.

---

## 23. Observability

| Concern | Tool |
|---|---|
| Error tracking | Sentry (api + web) |
| Structured logging | NestJS Logger JSON in production |
| Health | @nestjs/terminus at `GET /health` |
| AI call audit | Log: operation, model, tokens_in, tokens_out, latency, learner_tier — never content |
| Cost monitoring | BullMQ cron + alert thresholds (§16) |

---

## 24. Feature Build Sequence

| ID | Feature | Modules |
|---|---|---|
| F-01 | Auth ✅ | auth |
| F-02 | Onboarding — permanent behavioral profile | onboarding, web: /onboarding |
| F-03 | FSRS Engine + Concept Registry | learner, concept-registry |
| F-04 | ContextService + SignalDetector + SessionInsights | context, ai |
| F-05 | Your Sources — upload, URL, YouTube + RAG | sources, rag, queue |
| F-06 | Session Interface — conversation model + 3 phases | session, ai, context, web: /learn |
| F-07 | Exchange Evaluation — holistic + FSRS update | session, ai |
| F-08 | Misconception Detection + Typed Remediation | learner, ai, context |
| F-09 | Session End + Consolidation + Summary | session, ai, web: session-end-screen |
| F-10 | Progress Dashboard + Forgetting Curve Map | learner, web: /progress |
| F-11 | Session Intelligence — focus heuristic + continuity | session, context |
| F-12 | Subscriptions + Cost Management | subscription, queue, web: /settings |

Build strict order. Never start F-N+1 before F-N is complete and tested.

---

## 25. API Versioning

- All endpoints: `/api/v1` prefix
- Swagger: `/api/docs` (non-production only)
- Breaking changes increment version prefix. Never modify existing contracts.
- Stripe webhook: `/api/webhooks/stripe` — no version prefix, no global prefix
