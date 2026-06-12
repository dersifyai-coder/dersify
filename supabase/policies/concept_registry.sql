-- concept_registry is read-only for learners (no learnerId column — shared data)
-- Writes are internal only (service role bypasses RLS)
ALTER TABLE concept_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "concept_registry_select_all" ON concept_registry
  FOR SELECT USING (true);
