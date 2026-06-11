-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_knowledge_states" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "learner_id" UUID NOT NULL,
    "concept_id" TEXT NOT NULL,
    "easiness_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "next_review_at" TIMESTAMP(3),
    "last_reviewed_at" TIMESTAMP(3),
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_knowledge_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "misconceptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "learner_id" UUID NOT NULL,
    "concept_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "misconceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "learner_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "focus_mode" TEXT,
    "concepts_covered" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "concept_id" TEXT NOT NULL,
    "question_id" TEXT,
    "learner_answer" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "error_type" TEXT NOT NULL,
    "response_time_ms" INTEGER,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "learner_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "target_date" DATE,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_chunks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL DEFAULT 0,
    "source_doc" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learner_knowledge_states_learner_id_next_review_at_idx" ON "learner_knowledge_states"("learner_id", "next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "learner_knowledge_states_learner_id_concept_id_key" ON "learner_knowledge_states"("learner_id", "concept_id");

-- CreateIndex
CREATE INDEX "misconceptions_learner_id_concept_id_idx" ON "misconceptions"("learner_id", "concept_id");

-- CreateIndex
CREATE INDEX "sessions_learner_id_started_at_idx" ON "sessions"("learner_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "error_events_learner_id_created_at_idx" ON "error_events"("learner_id", "created_at");

-- CreateIndex
CREATE INDEX "curriculum_chunks_concept_id_idx" ON "curriculum_chunks"("concept_id");

-- AddForeignKey
ALTER TABLE "learner_knowledge_states" ADD CONSTRAINT "learner_knowledge_states_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "misconceptions" ADD CONSTRAINT "misconceptions_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_events" ADD CONSTRAINT "error_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_goals" ADD CONSTRAINT "learner_goals_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "curriculum_chunks" ADD COLUMN "embedding" vector(1536);
CREATE INDEX IF NOT EXISTS curriculum_chunks_embedding_idx
  ON "curriculum_chunks" USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
