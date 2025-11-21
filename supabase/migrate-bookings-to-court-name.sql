-- Migration: Replace court_id with court (name) in bookings table
-- Run this SQL in Supabase SQL Editor

-- Step 1: Add the new 'court' column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS court TEXT;

-- Step 2: Populate court column with court names from courts table (if data exists)
-- This updates existing bookings to have court names
UPDATE bookings b
SET court = c.name
FROM courts c
WHERE b.court_id = c.id;

-- Step 3: Make court column NOT NULL (only after populating existing data)
-- Uncomment this after verifying all bookings have court names:
-- ALTER TABLE bookings ALTER COLUMN court SET NOT NULL;

-- Step 4: Drop the old court_id column
-- CAUTION: Only run this after verifying everything works with court name
-- ALTER TABLE bookings DROP COLUMN IF EXISTS court_id;

-- Step 5: Drop old indexes that reference court_id
DROP INDEX IF EXISTS idx_bookings_court_id;
DROP INDEX IF EXISTS idx_bookings_court_date_time;

-- Step 6: Create new index on court name
CREATE INDEX IF NOT EXISTS idx_bookings_court ON bookings(court);
CREATE INDEX IF NOT EXISTS idx_bookings_court_date_time ON bookings(court, date, time_slot);

-- Step 7: Update unique constraint to use court name instead of court_id
-- First, drop the old constraint if it exists
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS unique_court_date_slot;

-- Create new unique constraint with court name
ALTER TABLE bookings 
ADD CONSTRAINT unique_court_date_slot UNIQUE (court, date, time_slot);

-- Verify the migration
SELECT 
  id,
  court,
  date,
  time_slot,
  status
FROM bookings
LIMIT 10;
