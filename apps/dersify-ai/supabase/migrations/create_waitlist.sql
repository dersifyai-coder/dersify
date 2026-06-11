-- Create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  source      TEXT DEFAULT 'landing',     -- which CTA they used
  referrer    TEXT,                        -- document.referrer from client
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT waitlist_signups_email_unique UNIQUE (email),
  CONSTRAINT waitlist_signups_email_format CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

-- Index for fast lookup by email (duplicate check)
CREATE INDEX IF NOT EXISTS waitlist_signups_email_idx ON waitlist_signups (email);

-- Index for admin ordering by signup date
CREATE INDEX IF NOT EXISTS waitlist_signups_created_idx ON waitlist_signups (created_at DESC);

-- Enable Row Level Security
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Policy: anonymous users can INSERT only (no SELECT, no UPDATE, no DELETE)
-- This prevents anyone from reading the email list via the anon key
CREATE POLICY "Anonymous can insert waitlist signup"
  ON waitlist_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- service_role bypasses RLS by default — admin reads go through it.
-- No SELECT policy for anon = anon key users cannot read any emails.
-- The email list is only accessible via service_role key (never exposed to frontend).
