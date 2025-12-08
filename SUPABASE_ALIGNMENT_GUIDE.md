# Supabase Alignment Guide

## ✅ Changes Made

### 1. **Bookings Table Structure**
- ✅ Changed from `court_id` (UUID) to `court` (TEXT) - stores court name directly
- ✅ All queries now use `court` column instead of `court_id`
- ✅ Removed all foreign key relationship queries (no relationship exists)

### 2. **Graceful Handling of Missing Tables**
- ✅ All `courts` table lookups are now optional and wrapped in try-catch
- ✅ If `courts` table doesn't exist, code continues without sport name
- ✅ If `sports` table doesn't exist, code continues without sport name
- ✅ All error handling is graceful - no crashes if tables are missing

### 3. **Updated Files**
- ✅ `lib/bookings.ts` - All booking operations now work with `court` (TEXT)
- ✅ `app/api/bookings/my/route.ts` - Updated to handle missing courts table
- ✅ `lib/supabaseClient.ts` - TypeScript types updated to use `court: string`
- ✅ `scripts/inspect-bookings-table.sql` - Fixed to not reference courts table

## 📋 What You Need to Verify

### Step 1: Run the SQL Query
1. Open Supabase SQL Editor
2. Copy and paste the entire `scripts/inspect-bookings-table.sql` file
3. Run it to see your actual table structure
4. **Share the column list** with me so I can verify everything matches

### Step 2: Check Your Bookings Table Columns
The query will show you:
- All column names
- Data types
- Sample data

**Expected columns based on our changes:**
- `id` (UUID)
- `user_id` (UUID, nullable)
- `court` (TEXT) ← **This should exist, not `court_id`**
- `date` (DATE)
- `start_time` (TIME)
- `end_time` (TIME)
- `status` (TEXT)
- `price` (NUMERIC)
- `customer_name` (TEXT, nullable)
- `customer_email` (TEXT, nullable)
- `created_at` (TIMESTAMP)

### Step 3: Test Booking Creation
1. Try creating a booking through your app
2. Check if it works without errors
3. Verify the booking is saved correctly in Supabase

## 🔍 If Courts/Sports Tables Don't Exist

**That's OK!** The code now handles this gracefully:
- ✅ Bookings will still be created successfully
- ✅ Sport name will be empty if courts table doesn't exist
- ✅ All operations continue to work

## 🚨 If You See Errors

### Error: "column X does not exist"
- Share the exact error message
- Run the SQL query to show actual columns
- I'll update the code to match your actual structure

### Error: "relation X does not exist"
- This is expected if courts/sports tables don't exist
- The code should handle this gracefully now
- If you still see crashes, let me know

## 📝 Next Steps

1. **Run the SQL query** and share the results
2. **Test booking creation** and let me know if it works
3. **Share any errors** you encounter

The application is now aligned to work with your Supabase structure where:
- Bookings table uses `court` (TEXT name) instead of `court_id` (UUID)
- Courts/sports tables are optional (code works without them)
- All operations are graceful and won't crash if tables are missing

