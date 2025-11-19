# ⚠️ URGENT: Setup Database Tables

## The Problem

Your app is trying to access database tables (`sports`, `profiles`, `courts`, `bookings`) that don't exist yet in Supabase. This is why you're seeing errors like:

- `Could not find the table 'public.sports' in the schema cache`
- `404 (Not Found)` for profiles table

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com
2. Select your project: **zpkojuhplrhweiznnnda**
3. Click **SQL Editor** in the left sidebar
4. Click **New query** button (top right)

### Step 2: Run the Schema

1. Open the file `supabase/schema.sql` in your project folder
2. **Select ALL** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. **Paste** into the Supabase SQL Editor
5. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Tables Were Created

1. In Supabase Dashboard, click **Table Editor** (left sidebar)
2. You should now see these tables:
   - ✅ `profiles`
   - ✅ `sports`
   - ✅ `courts`
   - ✅ `bookings`

### Step 4: Test Your App

1. Refresh your browser (`http://localhost:3000`)
2. The errors should be gone!
3. Try navigating to `/sports` - it should work now

## What Happens After Running Schema

- ✅ All tables are created
- ✅ Indexes are added for performance
- ✅ Security policies (RLS) are enabled
- ✅ Triggers are set up (auto-create profiles on signup)
- ✅ Your app can now store real data

## Current Status

The app is currently using **mock data** as a fallback, so it won't crash. But you need to run the schema to:
- Store real bookings
- Have real user profiles
- Use actual sports and courts data

## Still Having Issues?

If you see errors when running the SQL:

1. **"Table already exists"** - This is fine! Just continue
2. **"Permission denied"** - Make sure you're logged into Supabase as the project owner
3. **Syntax errors** - Make sure you copied the ENTIRE file

## Next Steps After Schema

1. **Add some sports data** (optional):
   - Go to Table Editor → `sports` table
   - Click "Insert row"
   - Add a sport (e.g., "Football", "Cricket", "Paddle Tennis")

2. **Add courts** (optional):
   - Go to `courts` table
   - Add courts linked to sports

3. **Test booking flow**:
   - Sign up a user
   - Try making a booking
   - It should work now!

---

**The app will work with mock data until you run the schema, but you need the real database for production!**

