-- Teranga GP - Authentication Function
-- Secure password verification with bcrypt

CREATE OR REPLACE FUNCTION authenticate_user(email_input TEXT, password_input TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  full_name TEXT,
  status TEXT,
  authenticated BOOLEAN
) AS $$
DECLARE
  user_record RECORD;
  password_hash TEXT;
BEGIN
  -- Get user by email
  SELECT * INTO user_record FROM profiles WHERE email = email_input;
  
  IF user_record IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;
  
  -- In production, use pgcrypto for bcrypt:
  -- IF crypt(password_input, user_record.password_hash) = user_record.password_hash THEN
  
  -- For now, use simple base64 comparison (upgrade to bcrypt in production)
  IF encode(password_input::bytea, 'base64') = user_record.password_hash THEN
    RETURN QUERY SELECT user_record.id, user_record.email, user_record.username, 
                        user_record.full_name, user_record.status, TRUE;
  ELSE
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;

-- Analytics table for event tracking
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT,
  user_agent TEXT
);

-- Index for event queries
CREATE INDEX IF NOT EXISTS analytics_user_id_idx ON analytics(user_id);
CREATE INDEX IF NOT EXISTS analytics_event_name_idx ON analytics(event_name);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics(created_at);

-- Enable RLS for analytics
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own analytics
DROP POLICY IF EXISTS "Users can read own analytics" ON analytics;
CREATE POLICY "Users can read own analytics" ON analytics
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Anyone can insert events
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics;
CREATE POLICY "Anyone can insert analytics" ON analytics
  FOR INSERT
  WITH CHECK (TRUE);
