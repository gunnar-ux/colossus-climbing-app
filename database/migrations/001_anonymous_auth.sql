-- Migration to add anonymous auth support
-- Run this after enabling anonymous authentication in Supabase Dashboard

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS current_flash_grade VARCHAR(3),
ADD COLUMN IF NOT EXISTS climb_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_prompt_dismissed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_prompt_count INTEGER DEFAULT 0;

-- Make email nullable for anonymous users
ALTER TABLE users 
ALTER COLUMN email DROP NOT NULL;

-- Update existing users to be non-anonymous
UPDATE users 
SET is_anonymous = false 
WHERE email IS NOT NULL;

-- Add new RLS policies for anonymous users
CREATE POLICY IF NOT EXISTS "Anon users can create profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Anon users can manage own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Anon users can manage own climbs" ON climbs
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM sessions WHERE id = climbs.session_id
  ));

-- Create function to increment climb count
CREATE OR REPLACE FUNCTION increment_climb_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET climb_count = climb_count + 1
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment climb count
DROP TRIGGER IF EXISTS increment_climb_count_trigger ON climbs;
CREATE TRIGGER increment_climb_count_trigger
  AFTER INSERT ON climbs
  FOR EACH ROW
  EXECUTE FUNCTION increment_climb_count();

-- Add index for anonymous user queries
CREATE INDEX IF NOT EXISTS idx_users_is_anonymous ON users(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_users_climb_count ON users(climb_count);

COMMENT ON COLUMN users.is_anonymous IS 'Whether the user signed up anonymously';
COMMENT ON COLUMN users.current_flash_grade IS 'The grade the user typically flashes (V0-V9)';
COMMENT ON COLUMN users.climb_count IS 'Total number of climbs logged by the user';
COMMENT ON COLUMN users.account_prompt_dismissed_at IS 'When the user last dismissed the account upgrade prompt';
COMMENT ON COLUMN users.account_prompt_count IS 'Number of times the account upgrade prompt has been dismissed';
