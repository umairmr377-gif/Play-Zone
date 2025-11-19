# 🔧 Quick Fix: Supabase Connection Error

## Error: `ERR_NAME_NOT_RESOLVED` / `Failed to fetch`

This error means your Supabase environment variables are not configured.

## ✅ Solution (2 minutes)

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign in or create a free account
3. Create a new project (or use existing)
4. Go to **Project Settings** → **API**
5. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 2: Update `.env.local`

Open `.env.local` in your project root and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-key
```

### Step 3: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## 🚀 That's It!

After restarting, the login should work.

## 📋 Still Having Issues?

1. **Check `.env.local` exists** in the project root (not in a subfolder)
2. **Verify no typos** in variable names
3. **Ensure values don't have quotes** around them
4. **Restart the dev server** after changes
5. **Check browser console** for specific error messages

## 🔗 Helpful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- See `ENV_SETUP.md` for detailed instructions

