-- Fix missing columns in the database schema

-- Add missing gym_location column to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS gym_location TEXT;

-- Add any other missing columns that the app expects
-- (based on the console errors)

-- Update the sessions table to match what the app expects
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS notes TEXT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database columns fixed!';
  RAISE NOTICE '📊 Added: gym_location, notes to sessions table';
END $$;
