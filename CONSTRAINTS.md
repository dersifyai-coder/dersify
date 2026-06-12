# Dersify — Agent Constraints

> Hard rules. Not suggestions.
> Every coding agent working on this codebase must read and follow this file completely.
> If an instruction conflicts with these constraints, these constraints win.
> If you are unsure, stop and ask. Do not improvise.

---

## 0. Before You Write Any Code

Do these three things first, in order:

1. Read `ARCHITECTURE.md` completely.
2. Read this file completely.
3. Confirm which feature (F-01 through F-10) you are working on.

If you have not done all three, do not write a single line of code.

---

## 1. Scope Constraints

### 1.1 One Feature at a Time
- Work only on the feature explicitly assigned.
- Do not build ahead. Do not add "while I'm here" improvements.
- If you notice something broken in another feature, report it — do not fix it silently.

### 1.2 No Unassigned Files
- Do not create files not in `ARCHITECTURE.md` or explicitly requested.
- Do not delete any existing file without explicit instruction.
- Do not rename folders or restructure the project layout.

### 1.3 No Stub Code
- Do not ship `// TODO: implement later` blocks as done.
- If a function is not fully implemented, throw a `NotImplementedException` — never return fake data silently.
- Unimplemented routes must return `501 Not Implemented`, not empty responses.

---

## 2. Language and Framework Constraints

### 2.1 TypeScript — Strict Mode Always
- `strict: true` in all tsconfigs. Never disable it.
- No `any`. Use `unknown` and narrow it, or define a proper interface.
- No `as SomeType` casting unless you can explicitly justify why it is safe in a comment.
- Every function must have explicit parameter types and return types.
- Use `satisfies` operator over `as` when asserting object shapes.

### 2.2 NestJS Rules
- Business logic lives in Services. Controllers handle HTTP only (parse → call service → return).
- All inputs go through DTOs with `class-validator` decorators. Never access `req.body` directly.
- Use `ConfigService` for all env vars in service files. Never use `process.env.X` directly in services.
- Every protected route must have `@UseGuards(JwtAuthGuard)`. No exceptions.
- Never put database queries or business logic directly in controllers.
- Document all controllers and DTOs with `@ApiTags`, `@ApiOperation`, `@ApiResponse` for Swagger.

### 2.3 Next.js Rules
- App Router only. Never use Pages Router patterns.
- Server Components by default. Add `'use client'` only when you genuinely need browser APIs or event handlers.
- Use `apiFetch` (from `lib/api.ts`) for server-side data fetching in Server Components and server actions.
- Use `api-client.ts` for browser-side data fetching in client components.
- Never fetch from the backend using bare `fetch` — always go through the typed wrappers.
- Never expose `SUPABASE_SERVICE_KEY`, `GOOGLE_AI_API_KEY`, `OPENAI_API_KEY`, or `STRIPE_SECRET_KEY` to the frontend.
  Keys without `NEXT_PUBLIC_` prefix must never appear in client components.

### 2.4 Zod for LLM Output
- All LLM responses that drive application logic must be parsed with a **Zod schema** before use.
- Define Zod schemas alongside their corresponding prompt files in `apps/api/src/ai/prompts/`.
- Never use `JSON.parse` on raw LLM output without immediately validating with Zod.

---

## 3. Database Constraints

### 3.1 Prisma is the ORM — No Raw Supabase Queries for Data
- All data queries (SELECT, INSERT, UPDATE, DELETE) go through the **Prisma client** from `packages/database`.
- Never import `@supabase/supabase-js` in a service for data queries. The Supabase client (`lib/supabase.ts`) is only for:
  - Auth operations (signUp, signIn, refreshSession, signOut)
  - Supabase Storage (file uploads/downloads)
  - Nothing else.
- Never call the Supabase client directly from controllers — only from services.

### 3.2 Schema Changes via Prisma Migrations
- Never modify the database schema manually or through the Supabase UI.
- All schema changes go through `prisma migrate dev` in `packages/database`.
- Migration files are committed to git and applied in CI/CD.
- Never edit an already-applied migration file. Create a new one.
- Additive changes only in production migrations — never drop columns/tables without a data migration plan.

### 3.3 RLS Policies
- Row-Level Security (RLS) policies live in `supabase/policies/`.
- RLS is not managed by Prisma — it's applied separately.
- When a new table is created via Prisma migration, a corresponding RLS policy file must be created.
- All learner data tables must have RLS enabled. Non-learner tables (curriculum_chunks) are exempt.

### 3.4 pgvector
- Embedding dimension is **768** (`EMBEDDING_DIMENSION` constant in `ai.constants.ts`). Never change without: (1) new migration to change column type, (2) re-embedding all source_chunks, (3) updating the constant.
- Always use cosine similarity: `<=>` operator (not inner product, not L2).
- The `embedding` column on `source_chunks` is managed via raw SQL in a Prisma migration file.
  It is not a Prisma schema field. Use `prisma.$queryRaw` for vector queries.

### 3.5 Prisma Usage Rules
- Inject `PrismaService` (a NestJS wrapper around the Prisma client) — do not import the global `prisma` singleton directly in NestJS services.
- Always handle `PrismaClientKnownRequestError` — specifically:
  - `P2002` (unique constraint violation) → `ConflictException`
  - `P2025` (record not found) → `NotFoundException`
- Never use `prisma.X.findUnique` and silently return `null` in a context where the record should exist — throw `NotFoundException`.
- Use `prisma.$transaction` for operations that must succeed or fail together.

---

## 4. AI / LLM Constraints

### 4.1 All AI Calls Go Through AiService
- No component, controller, or other service may import `@google/generative-ai` or `openai` directly.
- All LLM calls go through `apps/api/src/ai/ai.service.ts`.
- This enforces model routing, fallback logic, token tracking, rate limiting, and error handling in one place.

### 4.2 Prompts
- All prompt strings live in `apps/api/src/ai/prompts/` as typed TypeScript functions.
- No inline prompt strings inside service methods. Ever.
- Each prompt file exports: a context interface, an output interface, a Zod schema for the output, and a prompt builder function.

### 4.3 Fallback Logic
- Every operation uses the model tier defined in `MODEL_ROUTING` in `ai.constants.ts`.
- Gemini is the primary provider; OpenAI GPT is the fallback. Which specific model depends on the operation — see ARCHITECTURE.md §10.
- Fallback triggers on: timeout > 10s, HTTP 429, HTTP 5xx from primary provider.
- Fallback events must be logged with: operation, provider, reason, model, timestamp.
- If both providers fail: throw `AiUnavailableException`. Never return empty or hallucinated content.
- Graceful degradation: non-critical AI features (signal detection, focus heuristic) must
  catch `AiUnavailableException` and proceed without the AI result, not crash the request.

### 4.4 Validate All LLM Output with Zod
- Parse every LLM JSON response with the corresponding Zod schema.
- On validation failure: retry once with a correction prompt.
- On second failure: throw `AiUnavailableException`.
- Never pass a partially-validated or unvalidated LLM response into business logic.

### 4.5 Model IDs are Constants
- Never hardcode model ID strings in service methods.
- All model IDs live in `apps/api/src/ai/ai.constants.ts` in the `MODEL_ROUTING` table and embedding constants.
- Use the `MODEL_ROUTING` table to select the correct model tier for each operation type.
- Never add a new model string in any other file.

---

## 5. Queue Constraints

### 5.1 Long-Running Tasks Go in Queues
- Any operation that may take > 2 seconds must be processed as a BullMQ job, not inline in an HTTP handler.
- This applies to: curriculum ingestion, batch embedding generation, any bulk data processing.
- HTTP handlers that trigger a job must return immediately with a `jobId` and `202 Accepted`.

### 5.2 Idempotent Jobs
- All job processors must be idempotent — running the same job twice must not corrupt data.
- Use upsert patterns in job processors, not plain insert.

### 5.3 Job Failure Handling
- All processors must implement `onFailed` — log the failure with full context (jobId, data, error).
- Set `attempts: 3` and `backoff: { type: 'exponential', delay: 2000 }` on all jobs.
- After max retries, failed jobs go to the dead-letter queue — never silently disappear.

### 5.4 Queue Names are Constants
- Queue names live in `apps/api/src/queue/queue.constants.ts` only.
- Never hardcode queue name strings anywhere else.

---

## 6. Caching Constraints

### 6.1 Cache Invalidation is Explicit
- Never rely on TTL alone for correctness-critical data.
- When data changes, explicitly invalidate its cache key in the same service method that changed the data.
- Example: when a session ends, invalidate `dersify:progress:{learnerId}`.

### 6.2 Cache Key Naming
- All cache keys follow the pattern: `dersify:{resource}:{identifier}`
- Define cache key builder functions in the service that owns the data — never construct key strings ad hoc.

### 6.3 Never Cache
- JWT tokens or auth session data
- Raw user inputs or answers
- Data that must reflect real-time accuracy (e.g., active session state)

---

## 7. Security Constraints

### 7.1 Environment Variables
- Never hardcode API keys, secrets, or URLs.
- Never commit `.env` or `.env.local` files. Commit only `.env.example` with empty values.
- Never log environment variable values, even in development.

### 7.2 Input Validation
- All API inputs validated via DTOs with `class-validator`. Global `ValidationPipe` with:
  `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- Never override `ValidationPipe` options per-route.
- Never trust user-supplied `learnerId`. Always derive from authenticated JWT via `@CurrentUser()`.

### 7.3 Authorization — Own Data Only
- Every service method that accesses learner data must include the `learnerId` from the JWT.
- The query must explicitly filter by `learnerId` — never trust a resource ID alone.
- Pattern: `WHERE id = :resourceId AND learnerId = :learnerId` for all learner-owned resources.
- Failing to include `learnerId` in a data query is a security bug.

### 7.4 CORS
- CORS configured in `main.ts` to allow only `APP_URL` from env.
- Never set `origin: '*'` in any environment, including development.

### 7.5 Rate Limiting
- AI endpoints (`/session/question`, `/session/:id/answer`) must have `@UseGuards(ThrottlerGuard)`.
- Global throttler: 100 requests per minute per IP.
- AI endpoint throttler: 20 requests per minute per user.
- Configure `@nestjs/throttler` with Redis storage for distributed rate limiting.

### 7.6 httpOnly Cookies
- Auth tokens stored in httpOnly, Secure, SameSite=Lax cookies only.
- Never store tokens in localStorage or sessionStorage.

---

## 8. Code Quality Constraints

### 8.1 Naming Conventions
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Variables and functions: `camelCase`
- Database columns (Prisma `@map`): `snake_case`
- Constants: `UPPER_SNAKE_CASE`
- Environment variables: `UPPER_SNAKE_CASE`
- Prisma model names: `PascalCase`
- Prisma field names: `camelCase`

### 8.2 No Dead Code
- No commented-out code in commits.
- No unused imports.
- No `console.log` in committed code. Use NestJS `Logger` in the backend, nothing in the frontend (Sentry handles errors).

### 8.3 Error Handling
- All service methods that can fail must use try/catch with typed error handling.
- Use NestJS built-in exceptions: `NotFoundException`, `UnauthorizedException`, `BadRequestException`, `ConflictException`, etc.
- Map Prisma errors to NestJS exceptions (see §3.5).
- Never throw raw `Error` objects from service methods.
- Never swallow errors with empty catch blocks.

### 8.4 No Magic Numbers or Strings
- FSRS constants → `fsrs.constants.ts`
- AI model IDs and routing → `ai.constants.ts` (`MODEL_ROUTING`)
- Queue names → `queue.constants.ts`
- Difficulty thresholds → `difficulty.constants.ts`
- Subscription limits → `subscription.constants.ts`
- Cache TTLs → defined as named constants alongside the cache call

### 8.5 Package Manager
- Use `pnpm` exclusively. Never run `npm install` or `yarn add`.
- Adding a new package requires updating the correct `package.json` (root, app, or `packages/database`).
- Check if a needed package is already installed before adding it.

---

## 9. Architecture Constraints

### 9.1 Module Boundaries
- `AiService` is backend-only. Never call Gemini or OpenAI from the frontend.
- `LearnerService` owns all FSRS logic. No other service implements FSRS calculations.
- `ContextService` owns system prompt assembly. No other service builds AI system prompts.
- `SessionService` owns all session state. Do not track session data inside `LearnerService` or `AiService`.
- `SubscriptionService` owns all tier checks and usage recording. Never inline tier logic elsewhere.
- `QueueModule` is the only place that enqueues jobs. Services call queue methods — they do not import BullMQ directly.

### 9.2 No Circular Dependencies
- If service A needs service B and service B needs service A: you have a design problem. Restructure.
- Use NestJS `forwardRef()` only as an absolute last resort. It is a code smell.
- Preferred solution: extract the shared logic into a third service or use events (`@nestjs/event-emitter`).

### 9.3 Frontend/Backend Separation
- Frontend calls NestJS API via `apiFetch` (server) or `api-client.ts` (browser).
- Frontend never calls Supabase directly for learner model data. That always goes through NestJS.
- Frontend may call Supabase directly only for: auth (sign in/up/refresh) and file storage.
- TanStack Query hooks in `hooks/` are the only way to fetch data in client components — no raw `fetch` in components.

### 9.4 Prisma Package Boundary
- `packages/database` exports the Prisma client and all generated types.
- Only `apps/api` imports from `packages/database`.
- `apps/web` never imports Prisma types — it uses its own frontend types defined in `types/index.ts`.

---

## 10. Testing Constraints

### 10.1 What Must Be Tested
- FSRS algorithm (`fsrs.ts`) — 100% coverage. This is the core business logic.
- ContextService prompt assembly (`context.service.ts`) — 100% coverage. This is the product intelligence.
- SignalDetector rule-based triggers — 100% coverage.
- All prompt builder functions — snapshot tests to catch regressions.
- All service methods — unit tests with mocked Prisma and mocked AiService.
- All controller endpoints — e2e tests with Supertest.

### 10.2 Mocking Rules
- Always mock `AiService` in tests — never make real API calls to Anthropic or OpenAI.
- Always mock Prisma via `jest-mock-extended` or `@prisma/client/testing` — never hit the real DB in unit tests.
- Integration tests (service → real DB) use a separate test database configured in `.env.test`.

### 10.3 Test File Location
- Unit/integration tests: `*.spec.ts` alongside the file being tested.
- E2E tests: `apps/api/test/*.e2e-spec.ts`
- Frontend E2E: `apps/web/e2e/*.spec.ts`

---

## 11. Brand Constraints

- Colors defined in `globals.css` as CSS custom properties only. Reference via Tailwind classes.
- Never inline hex color values in component files.
- Fonts loaded once in `apps/web/src/app/layout.tsx` via `next/font/google`. Never add a `<link>` tag for fonts.
- Gradient direction is always `135deg` from `#1B4FDB` to `#0D9488`.

---

## 12. Git Constraints

- Never commit directly to `main`. All work goes in feature branches.
- Branch naming: `feature/F-02-learner-profile`, `fix/sm2-interval-calc`
- Commit messages: conventional commits format — `feat(learner): implement SM-2 upsert endpoint`
- Both apps must start without errors before committing (`pnpm dev` in both `apps/api` and `apps/web`).
- Never commit with `--no-verify`.
- Prisma migration files are committed alongside the code that requires them.

---

## 13. What to Do When You Are Unsure

Stop and report — do not improvise — when:

- The task requires a file or module not in `ARCHITECTURE.md`
- The task requires a new third-party library not already in `package.json`
- The task requires changing the Prisma schema
- Two constraints appear to conflict
- The feature scope is unclear

**Report format:**
```
BLOCKED: [brief description]
Options considered: [what you thought of]
Recommendation: [what you think should be done]
Awaiting: decision from project owner
```
