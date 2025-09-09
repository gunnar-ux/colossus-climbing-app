-- Colossus Climbing App - Simple Setup for New Supabase Project
-- This version works without auth.users dependency

-- Clean slate
DROP TABLE IF EXISTS load_ratios CASCADE;
DROP TABLE IF EXISTS user_crs_scores CASCADE;
DROP TABLE IF EXISTS climbs CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE (simplified - no auth.users dependency initially)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID, -- We'll link this to auth.users later
  email TEXT UNIQUE NOT NULL,
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

-- SESSIONS TABLE  
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  climbs_count INTEGER DEFAULT 0,
  median_grade TEXT,
  avg_rpe DECIMAL,
  session_load DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLIMBS TABLE
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
CREATE TABLE load_ratios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  acute_load DECIMAL NOT NULL,
  chronic_load DECIMAL NOT NULL,
  ratio DECIMAL NOT NULL,
  status TEXT CHECK (status IN ('low', 'optimal', 'elevated', 'high')),
  week_start DATE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_climbs_user_id ON climbs(user_id);
CREATE INDEX idx_climbs_session_id ON climbs(session_id);
CREATE INDEX idx_climbs_timestamp ON climbs(timestamp);
CREATE INDEX idx_crs_scores_user_id ON user_crs_scores(user_id);
CREATE INDEX idx_load_ratios_user_id ON load_ratios(user_id);

-- ROW LEVEL SECURITY (simplified for now)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE climbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_crs_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_ratios ENABLE ROW LEVEL SECURITY;

-- Simple policies (we'll improve these later)
CREATE POLICY "Allow all for now" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON climbs FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON user_crs_scores FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON load_ratios FOR ALL USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Colossus database setup complete!';
  RAISE NOTICE '📊 Tables created: users, sessions, climbs, user_crs_scores, load_ratios';
  RAISE NOTICE '🎯 Ready for testing - authentication will be added later';
END $$;
