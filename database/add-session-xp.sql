-- Add session XP tracking to database
-- Run this in your Supabase SQL editor

-- Add total_xp column to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- Create function to calculate XP for a single climb
CREATE OR REPLACE FUNCTION calculate_climb_xp(grade TEXT, attempts INTEGER)
RETURNS INTEGER AS $$
DECLARE
    base_xp INTEGER := 10;
    grade_num INTEGER;
    grade_multiplier INTEGER;
    flash_bonus DECIMAL;
    climb_xp INTEGER;
BEGIN
    -- Extract grade number from V-grade (V0 = 0, V1 = 1, etc.)
    grade_num := COALESCE(CAST(SUBSTRING(grade FROM 'V(\d+)') AS INTEGER), 0);
    
    -- Grade multiplier (V0=1x, V1=2x, V2=3x, etc.)
    grade_multiplier := grade_num + 1;
    
    -- Flash bonus (1.2x for 1 attempt, 1.0x for more)
    flash_bonus := CASE WHEN attempts = 1 THEN 1.2 ELSE 1.0 END;
    
    -- Calculate XP
    climb_xp := ROUND(base_xp * grade_multiplier * flash_bonus);
    
    RETURN climb_xp;
END;
$$ LANGUAGE plpgsql;

-- Create function to update session XP when climbs change
CREATE OR REPLACE FUNCTION update_session_xp()
RETURNS TRIGGER AS $$
DECLARE
    session_xp INTEGER;
BEGIN
    -- Calculate total XP for the session
    SELECT COALESCE(SUM(calculate_climb_xp(grade, attempts)), 0)
    INTO session_xp
    FROM climbs 
    WHERE session_id = COALESCE(NEW.session_id, OLD.session_id);
    
    -- Update the session's total_xp
    UPDATE sessions 
    SET total_xp = session_xp 
    WHERE id = COALESCE(NEW.session_id, OLD.session_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update session XP when climbs change
DROP TRIGGER IF EXISTS update_session_xp_trigger ON climbs;
CREATE TRIGGER update_session_xp_trigger
    AFTER INSERT OR UPDATE OR DELETE ON climbs
    FOR EACH ROW EXECUTE FUNCTION update_session_xp();

-- Calculate XP for all existing sessions
UPDATE sessions 
SET total_xp = (
    SELECT COALESCE(SUM(calculate_climb_xp(c.grade, c.attempts)), 0)
    FROM climbs c 
    WHERE c.session_id = sessions.id
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Session XP tracking added successfully!';
    RAISE NOTICE '📊 Added total_xp column to sessions table';
    RAISE NOTICE '⚡ Created triggers to auto-update session XP';
    RAISE NOTICE '🔄 Calculated XP for all existing sessions';
    RAISE NOTICE '🎯 XP formula: 10 × (grade + 1) × flash_bonus(1.2x for 1 attempt)';
END $$;
