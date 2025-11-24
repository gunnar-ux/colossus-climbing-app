-- Colossus Climbing App Database Setup
-- Simplified schema that matches the actual app requirements
-- Based on technical audit and app analysis

-- Clean slate - drop everything first
DROP POLICY IF EXISTS "Users can manage own data" ON users;
DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can manage own climbs" ON climbs;
DROP POLICY IF EXISTS "Users can view own crs_scores" ON user_crs_scores;
DROP POLICY IF EXISTS "Users can view own crs_scores" ON crs_scores;
DROP POLICY IF EXISTS "Users can manage own load_ratios" ON load_ratios;

DROP TABLE IF EXISTS load_ratios CASCADE;
DROP TABLE IF EXISTS user_crs_scores CASCADE;
DROP TABLE IF EXISTS crs_scores CASCADE;
DROP TABLE IF EXISTS climbs CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
-- Matches the user profile data structure from the app
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 100),
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  height_cm INTEGER CHECK (height_cm >= 90 AND height_cm <= 250),
  weight_kg DECIMAL CHECK (weight_kg >= 25 AND weight_kg <= 225),
  ape_index_cm INTEGER,
  location TEXT,
  grade_system TEXT DEFAULT 'v-scale' CHECK (grade_system IN ('v-scale', 'font')),
  flash_grade TEXT,
  typical_volume INTEGER,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  total_sessions INTEGER DEFAULT 0,
  total_climbs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SESSIONS TABLE  
-- Matches the session data structure from sampleSessions.js
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL, -- Display name like "Now", "Oct 28", etc.
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  climbs_count INTEGER DEFAULT 0,
  median_grade TEXT,
  avg_rpe DECIMAL,
  session_load DECIMAL DEFAULT 0, -- For ACWR calculations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLIMBS TABLE
-- Matches the individual climb structure from the app
CREATE TABLE climbs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  grade TEXT NOT NULL CHECK (grade ~ '^V[0-9]+$'),
  wall_angle TEXT NOT NULL CHECK (wall_angle IN ('SLAB', 'VERTICAL', 'OVERHANG')),
  style TEXT NOT NULL CHECK (style IN ('SIMPLE', 'POWERFUL', 'TECHNICAL')),
  rpe INTEGER NOT NULL CHECK (rpe >= 1 AND rpe <= 10),
  attempts INTEGER NOT NULL CHECK (attempts >= 1 AND attempts <= 50),
  climb_type TEXT DEFAULT 'BOULDER' CHECK (climb_type IN ('BOULDER', 'BOARD')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRS_SCORES TABLE
-- For caching CRS calculations as described in metrics.js
CREATE TABLE user_crs_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  load_recovery DECIMAL,
  load_trend DECIMAL,
  rpe_recovery DECIMAL,
  volume_pattern DECIMAL,
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LOAD_RATIOS TABLE  
-- For ACWR (Acute:Chronic Workload Ratio) tracking
CREATE TABLE load_ratios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  acute_load DECIMAL NOT NULL, -- 7-day load
  chronic_load DECIMAL NOT NULL, -- 28-day load  
  ratio DECIMAL NOT NULL,
  status TEXT CHECK (status IN ('low', 'optimal', 'elevated', 'high')),
  week_start DATE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_climbs_user_id ON climbs(user_id);
CREATE INDEX idx_climbs_session_id ON climbs(session_id);
CREATE INDEX idx_climbs_timestamp ON climbs(timestamp);
CREATE INDEX idx_crs_scores_user_id ON user_crs_scores(user_id);
CREATE INDEX idx_crs_scores_calculated_at ON user_crs_scores(calculated_at);
CREATE INDEX idx_load_ratios_user_id ON load_ratios(user_id);
CREATE INDEX idx_load_ratios_week_start ON load_ratios(week_start);

-- ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE climbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_crs_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_ratios ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - Simple and effective
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own sessions" ON sessions  
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own climbs" ON climbs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own crs_scores" ON user_crs_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own load_ratios" ON load_ratios
  FOR ALL USING (auth.uid() = user_id);

-- SIMPLE TRIGGERS for updating counters
-- Update user totals when sessions change
CREATE OR REPLACE FUNCTION update_user_session_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET total_sessions = total_sessions + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET total_sessions = total_sessions - 1 WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_trigger
  AFTER INSERT OR DELETE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_session_count();

-- Update user totals and session counts when climbs change  
CREATE OR REPLACE FUNCTION update_climb_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update user total climbs
    UPDATE users SET total_climbs = total_climbs + 1 WHERE id = NEW.user_id;
    -- Update session climb count
    UPDATE sessions SET climbs_count = climbs_count + 1 WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update user total climbs
    UPDATE users SET total_climbs = total_climbs - 1 WHERE id = OLD.user_id;
    -- Update session climb count  
    UPDATE sessions SET climbs_count = climbs_count - 1 WHERE id = OLD.session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_climb_counts_trigger
  AFTER INSERT OR DELETE ON climbs
  FOR EACH ROW EXECUTE FUNCTION update_climb_counts();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Colossus database setup complete!';
  RAISE NOTICE '📊 Tables created: users, sessions, climbs, user_crs_scores, load_ratios';
  RAISE NOTICE '🔒 Row Level Security enabled with proper policies';
  RAISE NOTICE '⚡ Indexes and triggers configured for performance';
  RAISE NOTICE '🎯 Schema matches your app requirements perfectly';
END $$;