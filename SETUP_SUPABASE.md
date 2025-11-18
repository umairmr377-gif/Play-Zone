# How to Set Up Supabase for Authentication

## Quick Setup Guide

### 1. Create Supabase Project

1. Go to https://app.supabase.com
2. Sign in or create a free account
3. Click **"New Project"**
4. Fill in:
   - **Name**: Your project name (e.g., "sports-booking")
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"** and wait 2-3 minutes

### 2. Get Your Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) → **API**
2. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...` - keep this secret!)

### 3. Update `.env.local`

Open `.env.local` in your project root and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4. Set Up Database Schema

Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **"Run"**

### 5. Set Up Authentication Schema

Run the SQL from `supabase/auth-schema.sql`:

1. In SQL Editor, create a new query
2. Copy and paste contents of `supabase/auth-schema.sql`
3. Click **"Run"**

### 6. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 7. Test Sign Up

1. Go to http://localhost:3001/auth/signup
2. Try creating an account
3. Check your email for the confirmation link (if email confirmation is enabled)

## Troubleshooting

### "Authentication is not configured" error
- Make sure `.env.local` has real Supabase credentials (not "placeholder")
- Restart your dev server after updating `.env.local`
- Check that the URL doesn't contain "placeholder"

### "Invalid API key" error
- Double-check you copied the correct keys
- Make sure there are no extra spaces in `.env.local`
- Verify the keys in Supabase dashboard

### Database errors
- Make sure you ran the SQL schema files
- Check Supabase dashboard → Database → Tables to see if tables exist

## Next Steps

After setting up Supabase:
- Users can sign up and log in
- Admin features will work (after you create an admin user)
- Bookings will be stored in Supabase database
- All data will persist across server restarts

