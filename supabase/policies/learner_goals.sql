-- RLS policies for learner_goals table
-- Applied via Supabase SQL editor after Prisma migration creates the table.

ALTER TABLE learner_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learner_goals_select" ON learner_goals FOR SELECT USING (auth.uid()::text = learner_id);
CREATE POLICY "learner_goals_insert" ON learner_goals FOR INSERT WITH CHECK (auth.uid()::text = learner_id);
CREATE POLICY "learner_goals_update" ON learner_goals FOR UPDATE USING (auth.uid()::text = learner_id);
CREATE POLICY "learner_goals_delete" ON learner_goals FOR DELETE USING (auth.uid()::text = learner_id);
