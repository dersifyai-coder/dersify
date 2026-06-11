-- EnableRLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- CreatePolicy: learner can select own notification preferences
CREATE POLICY "notification_preferences_select" ON notification_preferences
  FOR SELECT
  USING (auth.uid()::text = learner_id::text);

-- CreatePolicy: learner can insert own notification preferences
CREATE POLICY "notification_preferences_insert" ON notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid()::text = learner_id::text);

-- CreatePolicy: learner can update own notification preferences
CREATE POLICY "notification_preferences_update" ON notification_preferences
  FOR UPDATE
  USING (auth.uid()::text = learner_id::text);
