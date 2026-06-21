-- Migration 6: Add severity column to misconceptions
-- Apply via Supabase SQL Editor, then: prisma migrate resolve --applied 6_misconception_severity

ALTER TABLE "misconceptions"
  ADD COLUMN IF NOT EXISTS "severity" TEXT NOT NULL DEFAULT 'surface';
