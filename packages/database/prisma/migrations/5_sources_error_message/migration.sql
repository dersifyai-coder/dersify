-- Migration 5: Add error_message to learner_sources
-- Apply via Supabase SQL Editor, then: prisma migrate resolve --applied 5_sources_error_message

ALTER TABLE "learner_sources"
  ADD COLUMN IF NOT EXISTS "error_message" TEXT;
