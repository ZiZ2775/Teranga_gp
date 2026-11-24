-- Teranga GP - Production Database Schema
-- This schema includes bcrypt password hashing, row-level security, and performance indexes
-- Import this into Supabase SQL Editor to initialize the database

-- ============================================================================
-- TABLE 1: PROFILES (Users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Enable Row-Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Index for email lookups (login)
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);

-- ============================================================================
-- TABLE 2: PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  reference_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (amount > 0),
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded'))
);

-- Enable Row-Level Security for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own payments
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert payments
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at DESC);

-- ============================================================================
-- TABLE 3: ACTIVITY LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (action IN ('login', 'logout', 'create', 'read', 'update', 'delete', 'export', 'other'))
);

-- Enable Row-Level Security for activity logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own activity logs
CREATE POLICY "Users can read own activity logs" ON activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);

-- Index for action filtering
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON activity_logs(action);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to hash passwords with bcrypt (requires pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash password with bcrypt
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 4));
END;
$$ LANGUAGE plpgsql;

-- Function to verify password with bcrypt
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update profiles.updated_at
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger to update payments.updated_at
CREATE TRIGGER payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- VIEWS (Optional but useful)
-- ============================================================================

-- View: User payment summary
CREATE OR REPLACE VIEW user_payment_summary AS
SELECT
  p.id as user_id,
  p.username,
  COUNT(pay.id) as total_payments,
  SUM(CASE WHEN pay.status = 'completed' THEN pay.amount ELSE 0 END) as total_completed,
  SUM(CASE WHEN pay.status = 'pending' THEN pay.amount ELSE 0 END) as total_pending,
  MAX(pay.created_at) as last_payment_date
FROM profiles p
LEFT JOIN payments pay ON p.id = pay.user_id
GROUP BY p.id, p.username;

-- View: Recent activity summary
CREATE OR REPLACE VIEW recent_activity_summary AS
SELECT
  user_id,
  action,
  COUNT(*) as count,
  MAX(created_at) as last_occurred
FROM activity_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id, action
ORDER BY last_occurred DESC;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Summary:
-- ✅ 3 main tables (profiles, payments, activity_logs)
-- ✅ Row-Level Security (RLS) policies on all tables
-- ✅ Bcrypt password hashing functions
-- ✅ Performance indexes on common queries
-- ✅ Referential integrity with foreign keys
-- ✅ Automatic timestamp management
-- ✅ Useful views for analytics
-- ✅ Proper constraints and validation
-- ============================================================================
