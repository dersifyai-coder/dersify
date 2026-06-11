ALTER TABLE learner_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learner_sources_select" ON learner_sources
  FOR SELECT USING (auth.uid()::text = learner_id::text);

CREATE POLICY "learner_sources_insert" ON learner_sources
  FOR INSERT WITH CHECK (auth.uid()::text = learner_id::text);

CREATE POLICY "learner_sources_update" ON learner_sources
  FOR UPDATE USING (auth.uid()::text = learner_id::text);

CREATE POLICY "learner_sources_delete" ON learner_sources
  FOR DELETE USING (auth.uid()::text = learner_id::text);
