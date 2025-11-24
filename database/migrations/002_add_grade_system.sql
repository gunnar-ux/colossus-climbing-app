-- Migration: Add grade system support to users table
-- Date: 2025-11-24
-- Description: Adds grade_system preference, flash_grade, typical_volume, and onboarding_completed fields

-- Add new columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS grade_system TEXT DEFAULT 'v-scale' CHECK (grade_system IN ('v-scale', 'font'));

ALTER TABLE users
ADD COLUMN IF NOT EXISTS flash_grade TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS typical_volume INTEGER;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Set default grade system for existing users
UPDATE users 
SET grade_system = 'v-scale'
WHERE grade_system IS NULL;

-- Set onboarding_completed to true for existing users (they've already onboarded)
UPDATE users
SET onboarding_completed = TRUE
WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;

