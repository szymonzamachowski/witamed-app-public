-- Fix events type constraint to allow 'friendly' type for sparingi
-- This script updates the CHECK constraint to include 'friendly' as a valid event type

-- First, drop the existing constraint
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_type_check;

-- Add the new constraint with 'friendly' included
ALTER TABLE events 
ADD CONSTRAINT events_type_check 
CHECK (type IN ('match', 'training', 'friendly', 'other'));

-- Verify the constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'events'::regclass
  AND conname = 'events_type_check';

