# Setup Database Tables in Supabase

## The Problem

You're seeing 404 errors because the `profiles` table (and possibly other tables) don't exist in your Supabase database yet.

## Quick Fix: Run the Database Schema

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `zpkojuhplrhweiznnnda`
3. Click **SQL Editor** in the left sidebar
4. Click **New query** button

### Step 2: Copy and Paste the Schema

1. Open the file `supabase/schema.sql` in your project
2. **Copy ALL the contents** (Ctrl+A, then Ctrl+C)
3. **Paste it** into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Tables Were Created

After running the SQL:

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `sports`
   - ✅ `courts`
   - ✅ `bookings`

### Step 4: Test the App

1. Refresh your app (`http://localhost:3000`)
2. The 404 errors should be gone
3. Try signing up or logging in again

## What the Schema Creates

- **profiles** - User profiles with roles (user/admin)
- **sports** - Sports categories
- **courts** - Court listings
- **bookings** - Booking records
- **Indexes** - For performance
- **RLS Policies** - Row Level Security rules
- **Triggers** - Auto-create profiles on signup

## Troubleshooting

### "Table already exists" errors
- This is fine! The schema uses `CREATE TABLE IF NOT EXISTS`
- Just continue running the rest of the SQL

### "Permission denied" errors
- Make sure you're logged into the Supabase dashboard
- You need to be the project owner or have admin access

### Still getting 404 errors?
1. Check that the tables exist in **Table Editor**
2. Make sure you ran the **entire** schema.sql file
3. Refresh your browser and restart the dev server

## Next Steps

After running the schema:

1. **Sign up** a new user at `/auth/signup`
2. The profile will be **automatically created** by the trigger
3. Try logging in - it should work now!

