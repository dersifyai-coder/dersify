-- Migration 4: Drop legacy SM-2 knowledge states table
-- Apply after migration 3. Verify learner_knowledge_states (FSRS) is in use first.
DROP TABLE IF EXISTS "learner_knowledge_states_sm2";
