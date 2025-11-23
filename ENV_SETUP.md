# Environment Variables Setup

## Quick Start

1. Create a `.env.local` file in the root directory
2. Copy the following template and fill in your Supabase credentials:

```env
# Supabase Configuration
# Get these from your Supabase project dashboard: https://app.supabase.com
# Project Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## For Local Development (Without Supabase)

If you're just testing the UI without Supabase, you can use placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

The app will work without Supabase configured, but authentication features will be disabled.

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Go to **Project Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Important Notes

- `.env.local` is already in `.gitignore` - your secrets won't be committed
- Restart your dev server after changing environment variables
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for anon key)
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
