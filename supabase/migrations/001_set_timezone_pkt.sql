-- Migration: Set Timezone to Pakistan Standard Time (PKT - UTC+5)
-- This migration configures the database to use Asia/Karachi timezone
-- Run this in Supabase SQL Editor or via migration script

-- Set timezone for the current session
SET timezone = 'Asia/Karachi';

-- Create a function that returns current timestamp in PKT
CREATE OR REPLACE FUNCTION now_pkt()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Karachi';
END;
$$ LANGUAGE plpgsql;

-- Create a function that returns current date in PKT
CREATE OR REPLACE FUNCTION today_pkt()
RETURNS DATE AS $$
BEGIN
  RETURN ((NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Karachi')::date;
END;
$$ LANGUAGE plpgsql;

-- Note: For Supabase, we cannot set the database-level timezone directly
-- (requires superuser privileges). Instead, we:
-- 1. Set timezone in connection string or session
-- 2. Use timezone-aware functions when needed
-- 3. Convert timestamps in application code (already done in lib/utils.ts)

-- Update the update_updated_at_column function to use PKT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = (NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Karachi';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION now_pkt() TO authenticated;
GRANT EXECUTE ON FUNCTION now_pkt() TO anon;
GRANT EXECUTE ON FUNCTION today_pkt() TO authenticated;
GRANT EXECUTE ON FUNCTION today_pkt() TO anon;

-- Optional: Create a view to show current PKT time (for testing)
CREATE OR REPLACE VIEW current_pkt_time AS
SELECT 
  NOW() AS utc_time,
  (NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Karachi' AS pkt_time,
  EXTRACT(TIMEZONE_HOUR FROM (NOW() AT TIME ZONE 'Asia/Karachi')) AS pkt_offset_hours;

-- Grant select on the view
GRANT SELECT ON current_pkt_time TO authenticated;
GRANT SELECT ON current_pkt_time TO anon;

