ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- Access via session ownership — join through sessions table
CREATE POLICY "session_messages_select" ON session_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_messages.session_id
        AND sessions.learner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "session_messages_insert" ON session_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_messages.session_id
        AND sessions.learner_id::text = auth.uid()::text
    )
  );
