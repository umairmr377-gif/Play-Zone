-- ============================================
-- INSPECT BOOKINGS TABLE IN SUPABASE
-- ============================================
-- Run this in Supabase SQL Editor to see the actual table structure
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste this → Run
-- ============================================

-- 1. Check if bookings table exists and show its structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- 2. Show foreign key relationships
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'bookings';

-- 3. Show indexes on bookings table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'bookings';

-- 4. Get sample booking data (if any exists)
-- This will show ALL columns that actually exist in your table
SELECT 
  *
FROM bookings
LIMIT 5;

-- 4b. Show all column names explicitly to see the actual structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- 5. Show all actual columns in bookings table
-- This will reveal the exact column names that exist
SELECT 
  *
FROM bookings
LIMIT 1;

-- 5b. Show sample booking data with all columns
SELECT 
  *
FROM bookings
LIMIT 5;

-- 6. Count total bookings
SELECT COUNT(*) as total_bookings FROM bookings;

-- 7. Show RLS policies on bookings table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bookings';
  
