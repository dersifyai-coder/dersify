-- EnableRLS
ALTER TABLE learner_goals ENABLE ROW LEVEL SECURITY;

-- CreatePolicy: learner can select own goals
CREATE POLICY "learner_goals_select" ON learner_goals
  FOR SELECT
  USING (auth.uid()::text = learner_id::text);

-- CreatePolicy: learner can insert own goals
CREATE POLICY "learner_goals_insert" ON learner_goals
  FOR INSERT
  WITH CHECK (auth.uid()::text = learner_id::text);

-- CreatePolicy: learner can update own goals
CREATE POLICY "learner_goals_update" ON learner_goals
  FOR UPDATE
  USING (auth.uid()::text = learner_id::text);

-- CreatePolicy: learner can delete own goals
CREATE POLICY "learner_goals_delete" ON learner_goals
  FOR DELETE
  USING (auth.uid()::text = learner_id::text);
