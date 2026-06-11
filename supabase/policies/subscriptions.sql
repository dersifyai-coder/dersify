ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT USING (auth.uid()::text = learner_id::text);

-- Inserts and updates are service-role only (Stripe webhook, SubscriptionService)
