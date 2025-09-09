-- Update sessions table to use proper date field instead of string
ALTER TABLE sessions DROP COLUMN IF EXISTS date;
ALTER TABLE sessions ADD COLUMN session_date DATE DEFAULT CURRENT_DATE;

-- Update existing sessions to have proper dates
UPDATE sessions SET session_date = start_time::date WHERE session_date IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Sessions table updated with proper date field!';
END $$;
