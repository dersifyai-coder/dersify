ALTER TABLE source_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "source_chunks_select" ON source_chunks
  FOR SELECT USING (auth.uid()::text = learner_id::text);

CREATE POLICY "source_chunks_insert" ON source_chunks
  FOR INSERT WITH CHECK (auth.uid()::text = learner_id::text);

CREATE POLICY "source_chunks_delete" ON source_chunks
  FOR DELETE USING (auth.uid()::text = learner_id::text);
