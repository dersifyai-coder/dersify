-- Migration 3: FSRS Engine + Concept Registry
-- Apply via Supabase SQL Editor, then: prisma migrate resolve --applied 3_fsrs_and_concept_registry

-- ─── 1. concept_registry ──────────────────────────────────────────
CREATE TABLE "concept_registry" (
    "canonical_id"  TEXT        NOT NULL,
    "display_name"  TEXT        NOT NULL,
    "topic"         TEXT        NOT NULL,
    "aliases"       TEXT[]      NOT NULL DEFAULT '{}',
    "prerequisites" TEXT[]      NOT NULL DEFAULT '{}',
    "related"       TEXT[]      NOT NULL DEFAULT '{}',
    "status"        TEXT        NOT NULL DEFAULT 'ai_generated',
    "session_count" INTEGER     NOT NULL DEFAULT 0,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "concept_registry_pkey" PRIMARY KEY ("canonical_id")
);

CREATE INDEX "concept_registry_topic_status_idx"    ON "concept_registry"("topic", "status");
CREATE INDEX "concept_registry_session_count_idx"   ON "concept_registry"("session_count" DESC);

-- ─── 2. Rename old SM-2 knowledge states, create FSRS table ───────
ALTER TABLE "learner_knowledge_states" RENAME TO "learner_knowledge_states_sm2";

CREATE TABLE "learner_knowledge_states" (
    "id"               UUID         NOT NULL DEFAULT gen_random_uuid(),
    "learner_id"       UUID         NOT NULL,
    "concept_id"       TEXT         NOT NULL,
    "topic"            TEXT         NOT NULL,
    "stability"        DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "difficulty"       DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "elapsed_days"     INTEGER      NOT NULL DEFAULT 0,
    "scheduled_days"   INTEGER      NOT NULL DEFAULT 0,
    "reps"             INTEGER      NOT NULL DEFAULT 0,
    "lapses"           INTEGER      NOT NULL DEFAULT 0,
    "fsrs_state"       INTEGER      NOT NULL DEFAULT 0,
    "due"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence"       DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "last_reviewed_at" TIMESTAMP(3),
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "learner_knowledge_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "learner_knowledge_states_learner_id_concept_id_key"
    ON "learner_knowledge_states"("learner_id", "concept_id");
CREATE INDEX "learner_knowledge_states_learner_id_topic_due_idx"
    ON "learner_knowledge_states"("learner_id", "topic", "due");

ALTER TABLE "learner_knowledge_states"
    ADD CONSTRAINT "learner_knowledge_states_learner_id_fkey"
    FOREIGN KEY ("learner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FK to concept_registry is NOT VALID so existing rows (none yet) are not checked
ALTER TABLE "learner_knowledge_states"
    ADD CONSTRAINT "learner_knowledge_states_concept_id_fkey"
    FOREIGN KEY ("concept_id") REFERENCES "concept_registry"("canonical_id")
    ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;

-- ─── 3. profiles: add email + calibration_score ───────────────────
ALTER TABLE "profiles"
    ADD COLUMN IF NOT EXISTS "email"             TEXT,
    ADD COLUMN IF NOT EXISTS "calibration_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

CREATE UNIQUE INDEX IF NOT EXISTS "profiles_email_key"
    ON "profiles"("email") WHERE "email" IS NOT NULL;

-- ─── 4. misconceptions: add new columns ───────────────────────────
DROP INDEX IF EXISTS "misconceptions_learner_id_concept_id_idx";

ALTER TABLE "misconceptions"
    ADD COLUMN IF NOT EXISTS "topic"                TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS "misconception_type"   TEXT NOT NULL DEFAULT 'terminology',
    ADD COLUMN IF NOT EXISTS "remediation_strategy" TEXT,
    ADD COLUMN IF NOT EXISTS "resolved_in_session"  UUID;

CREATE INDEX "misconceptions_learner_id_topic_resolved_idx"
    ON "misconceptions"("learner_id", "topic", "resolved");

-- NOT VALID: won't check existing rows that predate concept_registry
ALTER TABLE "misconceptions"
    ADD CONSTRAINT "misconceptions_concept_id_fkey"
    FOREIGN KEY ("concept_id") REFERENCES "concept_registry"("canonical_id")
    ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;

-- ─── 5. sessions: add new columns ────────────────────────────────
ALTER TABLE "sessions"
    ADD COLUMN IF NOT EXISTS "topic"                  TEXT    NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS "prior_knowledge_signal" TEXT    NOT NULL DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS "time_available_minutes" INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN IF NOT EXISTS "current_phase"          TEXT    NOT NULL DEFAULT 'activation',
    ADD COLUMN IF NOT EXISTS "current_mode"           TEXT    NOT NULL DEFAULT 'exploration',
    ADD COLUMN IF NOT EXISTS "focus_state"            TEXT,
    ADD COLUMN IF NOT EXISTS "struggles_count"        INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "momentum_count"         INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "exchanges_count"        INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "token_budget_used"      INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "last_activity_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "sessions_learner_id_started_at_idx";
CREATE INDEX "sessions_learner_id_topic_started_at_idx"
    ON "sessions"("learner_id", "topic", "started_at" DESC);

-- ─── 6. error_events: replace old columns with new schema ─────────
ALTER TABLE "error_events"
    ADD COLUMN IF NOT EXISTS "topic"               TEXT    NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS "exchange_text"       TEXT    NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS "understanding_signal" TEXT   NOT NULL DEFAULT 'partial',
    ADD COLUMN IF NOT EXISTS "retention_quality"   INTEGER NOT NULL DEFAULT 3;

ALTER TABLE "error_events"
    DROP COLUMN IF EXISTS "question_id",
    DROP COLUMN IF EXISTS "learner_answer",
    DROP COLUMN IF EXISTS "correct_answer";

DROP INDEX IF EXISTS "error_events_learner_id_created_at_idx";
CREATE INDEX "error_events_learner_id_topic_created_at_idx"
    ON "error_events"("learner_id", "topic", "created_at");

-- ─── 7. session_messages ─────────────────────────────────────────
CREATE TABLE "session_messages" (
    "id"                 UUID         NOT NULL DEFAULT gen_random_uuid(),
    "session_id"         UUID         NOT NULL,
    "role"               TEXT         NOT NULL,
    "content"            TEXT         NOT NULL,
    "turn_index"         INTEGER      NOT NULL,
    "compressed"         BOOLEAN      NOT NULL DEFAULT false,
    "compression_summary" TEXT,
    "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "session_messages_session_id_turn_index_idx"
    ON "session_messages"("session_id", "turn_index");

ALTER TABLE "session_messages"
    ADD CONSTRAINT "session_messages_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 8. learner_sources ──────────────────────────────────────────
CREATE TABLE "learner_sources" (
    "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
    "learner_id"  UUID         NOT NULL,
    "topic"       TEXT         NOT NULL,
    "source_type" TEXT         NOT NULL,
    "title"       TEXT         NOT NULL,
    "source_ref"  TEXT         NOT NULL,
    "status"      TEXT         NOT NULL DEFAULT 'processing',
    "chunk_count" INTEGER      NOT NULL DEFAULT 0,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learner_sources_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "learner_sources_learner_id_topic_status_idx"
    ON "learner_sources"("learner_id", "topic", "status");

ALTER TABLE "learner_sources"
    ADD CONSTRAINT "learner_sources_learner_id_fkey"
    FOREIGN KEY ("learner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 9. source_chunks (+ vector embedding) ───────────────────────
CREATE TABLE "source_chunks" (
    "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
    "source_id"   UUID         NOT NULL,
    "learner_id"  UUID         NOT NULL,
    "topic"       TEXT         NOT NULL,
    "content"     TEXT         NOT NULL,
    "chunk_index" INTEGER      NOT NULL DEFAULT 0,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "source_chunks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "source_chunks_learner_id_topic_idx"
    ON "source_chunks"("learner_id", "topic");

ALTER TABLE "source_chunks"
    ADD CONSTRAINT "source_chunks_source_id_fkey"
    FOREIGN KEY ("source_id") REFERENCES "learner_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "source_chunks" ADD COLUMN IF NOT EXISTS "embedding" vector(768);
CREATE INDEX IF NOT EXISTS "source_chunks_embedding_idx"
    ON "source_chunks" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ─── 10. subscriptions ───────────────────────────────────────────
CREATE TABLE "subscriptions" (
    "id"                      UUID         NOT NULL DEFAULT gen_random_uuid(),
    "learner_id"              UUID         NOT NULL,
    "tier"                    TEXT         NOT NULL DEFAULT 'free',
    "status"                  TEXT         NOT NULL DEFAULT 'active',
    "stripe_customer_id"      TEXT,
    "stripe_subscription_id"  TEXT,
    "stripe_price_id"         TEXT,
    "current_period_start"    TIMESTAMP(3),
    "current_period_end"      TIMESTAMP(3),
    "cancel_at_period_end"    BOOLEAN      NOT NULL DEFAULT false,
    "created_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"              TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscriptions_learner_id_key" ON "subscriptions"("learner_id");
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key"
    ON "subscriptions"("stripe_customer_id") WHERE "stripe_customer_id" IS NOT NULL;
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key"
    ON "subscriptions"("stripe_subscription_id") WHERE "stripe_subscription_id" IS NOT NULL;

ALTER TABLE "subscriptions"
    ADD CONSTRAINT "subscriptions_learner_id_fkey"
    FOREIGN KEY ("learner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 11. usage_records ───────────────────────────────────────────
CREATE TABLE "usage_records" (
    "id"                  UUID             NOT NULL DEFAULT gen_random_uuid(),
    "learner_id"          UUID             NOT NULL,
    "date"                DATE             NOT NULL,
    "sessions_used"       INTEGER          NOT NULL DEFAULT 0,
    "exchanges_used"      INTEGER          NOT NULL DEFAULT 0,
    "tokens_used"         INTEGER          NOT NULL DEFAULT 0,
    "estimated_cost_usd"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at"          TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3)     NOT NULL,
    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usage_records_learner_id_date_key"
    ON "usage_records"("learner_id", "date");
