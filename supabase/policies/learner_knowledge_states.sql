ALTER TABLE learner_knowledge_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learner_knowledge_states_select" ON learner_knowledge_states
  FOR SELECT USING (auth.uid()::text = learner_id::text);

CREATE POLICY "learner_knowledge_states_insert" ON learner_knowledge_states
  FOR INSERT WITH CHECK (auth.uid()::text = learner_id::text);

CREATE POLICY "learner_knowledge_states_update" ON learner_knowledge_states
  FOR UPDATE USING (auth.uid()::text = learner_id::text);

CREATE POLICY "learner_knowledge_states_delete" ON learner_knowledge_states
  FOR DELETE USING (auth.uid()::text = learner_id::text);
