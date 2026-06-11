ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_records_select" ON usage_records
  FOR SELECT USING (auth.uid()::text = learner_id::text);

-- Writes are service-role only (UsageSyncProcessor, BullMQ job)
