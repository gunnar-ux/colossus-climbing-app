-- Colossus Climbing App Database Setup
-- This single file handles both fresh installs and resets
-- ⚠️ WARNING: Running this will DELETE ALL DATA if tables exist

-- Step 1: Clean up existing schema (if any)
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view own climbs" ON climbs;
DROP POLICY IF EXISTS "Users can insert own climbs" ON climbs;
DROP POLICY IF EXISTS "Users can update own climbs" ON climbs;
DROP POLICY IF EXISTS "Users can view own CRS scores" ON crs_scores;
DROP POLICY IF EXISTS "Users can insert own CRS scores" ON crs_scores;
DROP POLICY IF EXISTS "Users can view own load ratios" ON load_ratios;
DROP POLICY IF EXISTS "Users can insert own load ratios" ON load_ratios;
DROP POLICY IF EXISTS "Anon users can create profile" ON users;
DROP POLICY IF EXISTS "Anon users can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Anon users can manage own climbs" ON climbs;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS update_session_stats_trigger ON climbs;
DROP TRIGGER IF EXISTS update_user_totals_sessions ON sessions;
DROP TRIGGER IF EXISTS update_user_totals_climbs ON climbs;
DROP TRIGGER IF EXISTS increment_climb_count_trigger ON climbs;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_session_stats();
DROP FUNCTION IF EXISTS update_user_totals();
DROP FUNCTION IF EXISTS increment_climb_count();

-- Drop all tables (CASCADE to handle foreign keys)
DROP TABLE IF EXISTS load_ratios CASCADE;
DROP TABLE IF EXISTS crs_scores CASCADE;
DROP TABLE IF EXISTS climbs CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create tables
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 100),
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  height_cm INTEGER CHECK (height_cm >= 90 AND height_cm <= 250),
  weight_kg DECIMAL CHECK (weight_kg >= 25 AND weight_kg <= 225),
  ape_index_cm INTEGER,
  location TEXT,
  total_sessions INTEGER DEFAULT 0,
  total_climbs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  gym_location TEXT,
  notes TEXT,
  climb_count INTEGER DEFAULT 0,
  avg_rpe DECIMAL,
  median_grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE climbs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade TEXT NOT NULL CHECK (grade ~ '^V[0-9]+(\+|−)?$'),
  wall_angle TEXT NOT NULL CHECK (wall_angle IN ('SLAB', 'VERTICAL', 'OVERHANG')),
  style TEXT NOT NULL CHECK (style IN ('SIMPLE', 'POWERFUL', 'TECHNICAL')),
  rpe INTEGER NOT NULL CHECK (rpe >= 1 AND rpe <= 10),
  attempts INTEGER NOT NULL CHECK (attempts >= 1 AND attempts <= 50),
  completed BOOLEAN DEFAULT true,
  climb_type TEXT DEFAULT 'BOULDER' CHECK (climb_type IN ('BOULDER', 'BOARD')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_climbs_user_id ON climbs(user_id);
CREATE INDEX idx_climbs_session_id ON climbs(session_id);
CREATE INDEX idx_climbs_timestamp ON climbs(timestamp);

-- Step 5: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE climbs ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own climbs" ON climbs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own climbs" ON climbs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own climbs" ON climbs FOR UPDATE USING (auth.uid() = user_id);

-- Step 7: Create helper functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sessions 
  SET 
    climb_count = (SELECT COUNT(*) FROM climbs WHERE session_id = NEW.session_id),
    avg_rpe = (SELECT AVG(rpe) FROM climbs WHERE session_id = NEW.session_id),
    updated_at = NOW()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_user_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET 
    total_sessions = (SELECT COUNT(*) FROM sessions WHERE user_id = NEW.user_id),
    total_climbs = (SELECT COUNT(*) FROM climbs WHERE user_id = NEW.user_id),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_stats_trigger AFTER INSERT ON climbs 
  FOR EACH ROW EXECUTE FUNCTION update_session_stats();

CREATE TRIGGER update_user_totals_sessions AFTER INSERT ON sessions 
  FOR EACH ROW EXECUTE FUNCTION update_user_totals();

CREATE TRIGGER update_user_totals_climbs AFTER INSERT ON climbs 
  FOR EACH ROW EXECUTE FUNCTION update_user_totals();

-- Success!
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete! All tables, policies, and functions have been created.';
  RAISE NOTICE 'ℹ️  This is a simplified schema for email/password authentication only.';
  RAISE NOTICE '⚠️  Make sure email confirmation is disabled in Supabase for testing.';
END $$;
