-- Fix database constraints that are preventing climb saves

-- Drop the existing check constraints that are too restrictive
ALTER TABLE climbs DROP CONSTRAINT IF EXISTS climbs_style_check;
ALTER TABLE climbs DROP CONSTRAINT IF EXISTS climbs_wall_angle_check;
ALTER TABLE climbs DROP CONSTRAINT IF EXISTS climbs_grade_check;

-- Add more flexible constraints that match what the app actually sends
ALTER TABLE climbs ADD CONSTRAINT climbs_style_check 
  CHECK (style IN ('SIMPLE', 'POWERFUL', 'TECHNICAL', 'Simple', 'Powerful', 'Technical', 'Power', 'Endurance'));

ALTER TABLE climbs ADD CONSTRAINT climbs_wall_angle_check 
  CHECK (wall_angle IN ('SLAB', 'VERTICAL', 'OVERHANG', 'Slab', 'Vertical', 'Overhang'));

ALTER TABLE climbs ADD CONSTRAINT climbs_grade_check 
  CHECK (grade ~ '^V[0-9]+(\+|−)?$');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database constraints fixed!';
  RAISE NOTICE '🎯 Climb logging should work now';
END $$;
