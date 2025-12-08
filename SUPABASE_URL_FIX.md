# Fix: ERR_NAME_NOT_RESOLVED - Supabase URL Issue

## Problem
The error `ERR_NAME_NOT_RESOLVED` for `https://zpkojuhplrhweiznnnda.supabase.co` means:
- The Supabase project doesn't exist, OR
- The URL is incorrect, OR  
- The project was deleted/paused

## Solution

### Step 1: Verify Your Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign in to your account
3. Check if you have a project with ID `zpkojuhplrhweiznnnda`
4. If the project doesn't exist:
   - Create a new project, OR
   - Use an existing project's URL

### Step 2: Get Your Correct Supabase URL

1. In Supabase Dashboard, select your project
2. Go to **Settings** → **API**
3. Copy the **Project URL** (it should look like `https://xxxxx.supabase.co`)

### Step 3: Update `.env.local`

Create or update `.env.local` in your project root:

```env
# Replace with your ACTUAL Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

**Important:**
- Use your **actual** project URL from Supabase dashboard
- Don't use `zpkojuhplrhweiznnnda` unless that's your real project ID
- Get the keys from **Settings** → **API** in your Supabase dashboard

### Step 4: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## If You Don't Have a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details
4. Wait 2-3 minutes for project creation
5. Copy the Project URL and keys
6. Update `.env.local` with the new credentials

## Quick Check

Run this to see what URL is currently configured:
```bash
# In PowerShell:
Get-Content .env.local | Select-String "SUPABASE_URL"
```

The URL should match your actual Supabase project URL from the dashboard.

