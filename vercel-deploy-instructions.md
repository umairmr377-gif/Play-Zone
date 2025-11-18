# Vercel Deployment Instructions

Complete guide for deploying Play Zone to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Repository connected to Vercel
3. **Supabase Project**: Production Supabase project set up
4. **Domain** (optional): Custom domain for your app

## Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to your repository
2. Verify `package.json` has correct build scripts
3. Check that `next.config.mjs` is configured correctly

## Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

## Step 3: Configure Environment Variables

Go to **Project Settings → Environment Variables** and add:

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Optional Variables

```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
SENTRY_DSN=your-sentry-dsn (if using Sentry)
NODE_ENV=production
```

### Important Notes

- **SUPABASE_SERVICE_ROLE_KEY** should be marked as **"Sensitive"** (not exposed to client)
- Set variables for **Production**, **Preview**, and **Development** environments
- Use different Supabase projects for staging/production if needed

## Step 4: Configure Build Settings

### Node.js Version

Add to `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Build Settings

In Vercel project settings:
- **Node.js Version**: 18.x or 20.x
- **Install Command**: `npm install` (or `npm ci` for faster installs)
- **Build Command**: `npm run build`
- **Output Directory**: Leave default

## Step 5: Configure Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase auth redirect URLs:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your domain to **Site URL** and **Redirect URLs**

## Step 6: Deploy

### First Deployment

1. Click **"Deploy"** in Vercel
2. Wait for build to complete
3. Check build logs for errors
4. Visit the deployment URL

### Subsequent Deployments

- **Automatic**: Push to main branch triggers production deploy
- **Preview**: Push to other branches creates preview deployments
- **Manual**: Use Vercel CLI or dashboard

## Step 7: Post-Deployment Checklist

After deployment:

- [ ] Verify environment variables are set correctly
- [ ] Test authentication flow
- [ ] Test booking creation
- [ ] Check admin panel access
- [ ] Verify health check endpoint: `/api/health`
- [ ] Test database connection: `/api/health/db`
- [ ] Check error tracking (if using Sentry)
- [ ] Verify security headers (use browser dev tools)
- [ ] Test rate limiting
- [ ] Monitor Vercel logs for errors

## Step 8: Configure Supabase for Production

1. **Update Redirect URLs**:
   - Add production domain to Supabase auth settings
   - Add callback URL: `https://your-domain.com/auth/callback`

2. **Enable RLS**:
   - Run `supabase/RLS_POLICIES.sql` in Supabase SQL Editor
   - Test policies thoroughly in staging first

3. **Configure Backups**:
   - Enable automated backups in Supabase dashboard
   - Set backup schedule (daily recommended)

## Step 9: Monitoring Setup

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor performance and errors

### Sentry (Optional)

1. Create Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Install Sentry package: `npm install @sentry/nextjs`
4. Configure in `lib/monitoring.ts`

### Logs

- View logs in Vercel Dashboard → Deployments → Logs
- Set up log forwarding to external service if needed

## Step 10: Performance Optimization

### Image Optimization

1. Configure image domains in `next.config.mjs`
2. Use Next.js Image component
3. Consider CDN for static assets

### Caching

1. Configure ISR (Incremental Static Regeneration) for static pages
2. Set appropriate cache headers
3. Use Vercel Edge Caching

## Troubleshooting

### Build Failures

- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible
- Check for TypeScript errors

### Environment Variable Issues

- Verify variables are set for correct environment
- Check variable names match exactly (case-sensitive)
- Ensure `NEXT_PUBLIC_*` variables are accessible to client

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify network connectivity from Vercel

### Authentication Issues

- Check redirect URLs in Supabase
- Verify domain is added to allowed origins
- Check CORS settings

## Rollback Procedure

If deployment fails:

1. Go to **Deployments** in Vercel dashboard
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**
4. Investigate and fix issues
5. Redeploy when ready

## Continuous Deployment

### Branch Strategy

- **main/master**: Production deployments
- **staging**: Staging environment
- **feature/***: Preview deployments

### Deployment Hooks

Configure webhooks for:
- Slack/Discord notifications
- Sentry release tracking
- Database migration triggers

## Security Checklist

- [ ] All environment variables are set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is marked as sensitive
- [ ] RLS policies are enabled and tested
- [ ] Security headers are configured
- [ ] Rate limiting is active
- [ ] Error tracking is set up
- [ ] Backups are scheduled

## Support

For issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Check Supabase logs for database issues
- Review application logs in Vercel dashboard

