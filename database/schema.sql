-- Colossus Climbing App Database Schema
-- Copy and paste this into your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
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
  total_sessions INTEGER DEFAULT 0,
  total_climbs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
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

-- Climbs table
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

-- CRS scores table (cached calculations)
CREATE TABLE crs_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  status TEXT CHECK (status IN ('building', 'calibrating', 'calibrated')),
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
  components JSONB, -- Store calculation components
  session_count INTEGER,
  climb_count INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Load ratios table (for ACWR tracking)
CREATE TABLE load_ratios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  acute_load DECIMAL NOT NULL,
  chronic_load DECIMAL NOT NULL,
  ratio DECIMAL NOT NULL,
  status TEXT CHECK (status IN ('low', 'optimal', 'elevated', 'high')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_climbs_user_id ON climbs(user_id);
CREATE INDEX idx_climbs_session_id ON climbs(session_id);
CREATE INDEX idx_climbs_timestamp ON climbs(timestamp);
CREATE INDEX idx_crs_scores_user_id ON crs_scores(user_id);
CREATE INDEX idx_crs_scores_calculated_at ON crs_scores(calculated_at);
CREATE INDEX idx_load_ratios_user_id ON load_ratios(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE climbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crs_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_ratios ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own climbs" ON climbs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own climbs" ON climbs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own climbs" ON climbs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own CRS scores" ON crs_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own CRS scores" ON crs_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own load ratios" ON load_ratios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own load ratios" ON load_ratios FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update session statistics when climbs are added
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

CREATE TRIGGER update_session_stats_trigger 
  AFTER INSERT ON climbs 
  FOR EACH ROW EXECUTE FUNCTION update_session_stats();

-- Function to update user totals
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

CREATE TRIGGER update_user_totals_sessions 
  AFTER INSERT ON sessions 
  FOR EACH ROW EXECUTE FUNCTION update_user_totals();

CREATE TRIGGER update_user_totals_climbs 
  AFTER INSERT ON climbs 
  FOR EACH ROW EXECUTE FUNCTION update_user_totals();

-- Sample data for testing (optional)
-- Uncomment these lines to add test data

/*
-- Insert a test user (you'll need to sign up first to get the auth.users record)
INSERT INTO users (id, email, name, age, gender, height_cm, weight_kg, location) VALUES
('your-auth-user-id-here', 'test@example.com', 'Test Climber', 28, 'Male', 178, 75, 'Boulder, CO');

-- Insert a test session
INSERT INTO sessions (user_id, start_time, end_time, duration_minutes, gym_location) VALUES
('your-auth-user-id-here', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', 90, 'Local Climbing Gym');

-- Insert test climbs
INSERT INTO climbs (session_id, user_id, grade, wall_angle, style, rpe, attempts) VALUES
((SELECT id FROM sessions WHERE user_id = 'your-auth-user-id-here' LIMIT 1), 'your-auth-user-id-here', 'V4', 'OVERHANG', 'POWERFUL', 7, 1),
((SELECT id FROM sessions WHERE user_id = 'your-auth-user-id-here' LIMIT 1), 'your-auth-user-id-here', 'V3', 'VERTICAL', 'TECHNICAL', 6, 2),
((SELECT id FROM sessions WHERE user_id = 'your-auth-user-id-here' LIMIT 1), 'your-auth-user-id-here', 'V5', 'OVERHANG', 'POWERFUL', 8, 3);
*/
