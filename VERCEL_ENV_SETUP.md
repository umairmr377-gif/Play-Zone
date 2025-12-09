# Setting Up Environment Variables in Vercel

## ⚠️ Important: `.env.local` is NOT deployed to Vercel

Your `.env.local` file works locally but **will NOT be available in Vercel deployments**. You must configure environment variables in Vercel's dashboard.

## Step-by-Step Guide

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (optional, for admin operations) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Add Environment Variables in Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

   **Required Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Optional (for admin features):**
   ```
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **IMPORTANT**: Select which environments to apply:
   - ✅ **Production** (for production deployments)
   - ✅ **Preview** (for preview deployments)
   - ✅ **Development** (for development deployments)

6. Click **Save**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Pull environment variables to verify
vercel env pull .env.local
```

### 3. Redeploy Your Application

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on your latest deployment
3. Or push a new commit to trigger a new deployment

**Note**: Environment variables are only available after redeployment.

### 4. Verify Environment Variables

After deployment, check:

1. Go to your deployment → **Settings** → **Environment Variables**
2. Verify all variables are listed
3. Check the deployment logs to ensure variables are loaded
4. Visit your deployed site - the Supabase warning should disappear

## Environment Variables Reference

| Variable Name | Required | Description | Example |
|--------------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Your Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Optional | Service role key for admin operations | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## Troubleshooting

### ❌ "Supabase is not configured" error after deployment

**Solution:**
1. Verify environment variables are set in Vercel dashboard
2. Check that variables are enabled for the correct environment (Production/Preview)
3. Redeploy your application after adding variables
4. Check deployment logs for any errors

### ❌ Environment variables not updating

**Solution:**
1. Make sure you clicked **Save** after adding variables
2. Redeploy the application (variables only apply to new deployments)
3. Clear browser cache and hard refresh

### ❌ Variables work locally but not on Vercel

**Solution:**
- `.env.local` only works locally
- You MUST add variables in Vercel dashboard
- Variables with `NEXT_PUBLIC_` prefix are exposed to the browser
- Variables without `NEXT_PUBLIC_` are server-only

## Security Best Practices

1. ✅ **Never commit `.env.local` to Git** (it's already in `.gitignore`)
2. ✅ **Use different Supabase projects** for development and production
3. ✅ **Rotate keys** if accidentally exposed
4. ✅ **Use service role key** only for server-side admin operations
5. ✅ **Enable RLS (Row Level Security)** in Supabase for data protection

## Quick Checklist

- [ ] Supabase project created
- [ ] Environment variables copied from Supabase dashboard
- [ ] Variables added in Vercel dashboard
- [ ] Variables enabled for Production environment
- [ ] Application redeployed
- [ ] Supabase warning disappeared on deployed site
- [ ] Authentication working on deployed site

## Need Help?

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
- Check your deployment logs in Vercel dashboard

