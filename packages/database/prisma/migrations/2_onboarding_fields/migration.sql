-- AlterTable: add behavioral profile fields + subscription tier to profiles
ALTER TABLE "profiles"
  ADD COLUMN "motivation"           TEXT,
  ADD COLUMN "learning_approach"    TEXT,
  ADD COLUMN "struggle_response"    TEXT,
  ADD COLUMN "hours_per_week"       TEXT,
  ADD COLUMN "learning_pace"        TEXT,
  ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "subscription_tier"    TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "notification_preferences" (
    "learner_id"             UUID NOT NULL,
    "email_enabled"          BOOLEAN NOT NULL DEFAULT true,
    "daily_review_reminder"  BOOLEAN NOT NULL DEFAULT true,
    "weekly_digest_enabled"  BOOLEAN NOT NULL DEFAULT false,
    "reminder_hour_utc"      INTEGER NOT NULL DEFAULT 9,
    "timezone"               TEXT NOT NULL DEFAULT 'UTC',
    "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("learner_id")
);

-- AddForeignKey
ALTER TABLE "notification_preferences"
  ADD CONSTRAINT "notification_preferences_learner_id_fkey"
  FOREIGN KEY ("learner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
