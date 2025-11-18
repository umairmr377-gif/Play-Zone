# Production Deployment Guide

Complete guide for deploying Play Zone to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Supabase Production Setup](#supabase-production-setup)
4. [Security Hardening](#security-hardening)
5. [Monitoring & Logging](#monitoring--logging)
6. [Backup Strategy](#backup-strategy)
7. [Post-Deployment](#post-deployment)
8. [Rollback Procedure](#rollback-procedure)

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All code committed and pushed to repository
- [ ] All tests passing in staging
- [ ] Environment variables documented
- [ ] Database migrations tested in staging
- [ ] RLS policies tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking set up
- [ ] Performance benchmarks met

## Vercel Deployment

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub/GitLab/Bitbucket repository
4. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 2: Set Environment Variables

In **Project Settings → Environment Variables**, add:

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Optional:**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
SENTRY_DSN=your-sentry-dsn
NODE_ENV=production
```

**Important:**
- Mark `SUPABASE_SERVICE_ROLE_KEY` as **Sensitive** (not exposed to client)
- Set variables for **Production**, **Preview**, and **Development**
- Use different Supabase projects for staging/production

### Step 3: Configure Build Settings

1. **Node.js Version**: Set to 18.x or 20.x
2. **Install Command**: `npm ci` (faster, more reliable)
3. **Build Command**: `npm run build`
4. **Output Directory**: Leave default

### Step 4: Deploy

1. Click **"Deploy"**
2. Monitor build logs
3. Wait for deployment to complete
4. Visit deployment URL

### Step 5: Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Configure DNS as instructed
4. Update Supabase auth redirect URLs

## Supabase Production Setup

### Step 1: Create Production Project

1. Create new Supabase project for production
2. Note the project URL and API keys
3. Keep staging and production separate

### Step 2: Run Database Schema

1. Go to **SQL Editor**
2. Run `supabase/schema.sql` (creates tables)
3. Run `supabase/auth-schema.sql` (creates profiles)
4. Run `supabase/RLS_POLICIES.sql` (enables RLS)
5. Run `supabase/audit_logs.sql` (creates audit table, optional)

### Step 3: Migrate Data

1. Run `scripts/migrate-to-supabase.ts` in production
2. Verify data migrated correctly
3. Test all functionality

### Step 4: Configure Auth

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/**`

### Step 5: Enable Backups

1. Go to **Settings → Database**
2. Enable **Point-in-Time Recovery**
3. Set backup schedule (daily recommended)
4. Configure backup retention

### Step 6: Create First Admin

1. Sign up as regular user
2. Get user UUID from Supabase dashboard
3. Run SQL:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE id = '<user-uuid>';
   ```

## Security Hardening

### RLS Policies

1. **Test in staging first**
2. Run `supabase/RLS_POLICIES.sql`
3. Test all policies thoroughly
4. Monitor for policy violations

### Security Headers

Already configured in:
- `middleware.ts` - Adds security headers
- `next.config.mjs` - Additional headers
- `vercel.json` - Vercel-specific headers

### Rate Limiting

- Active on booking creation endpoint
- 5 requests per minute per IP
- Headers returned: `X-RateLimit-*`

### Environment Variables

- Never commit secrets to git
- Use Vercel environment variables
- Rotate keys regularly
- Use different keys for staging/production

## Monitoring & Logging

### Vercel Analytics

1. Enable in **Project Settings → Analytics**
2. Monitor performance metrics
3. Track error rates

### Sentry (Optional)

1. Create Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Install: `npm install @sentry/nextjs`
4. Configure in `lib/monitoring.ts`

### Application Logs

- View in **Vercel Dashboard → Deployments → Logs**
- Structured logging via `lib/logger.ts`
- Logs booking events, admin mutations, auth events

### Health Checks

- `/api/health` - Basic health check
- `/api/health/db` - Database connectivity
- Set up uptime monitoring (UptimeRobot, etc.)

## Backup Strategy

### Automated Backups

1. **Supabase Backups**:
   - Enable in Supabase dashboard
   - Daily backups recommended
   - Keep 7-30 days retention

2. **Application Backups**:
   - Run `npm run backup` daily
   - Store backups in cloud storage
   - Test restore procedure

### Manual Backups

```bash
# Create backup
npm run backup

# Backups saved to: backups/
```

### Restore from Backup

```bash
# WARNING: This will overwrite existing data
npx tsx scripts/restore-from-backup.ts <backup-prefix>
```

## Post-Deployment

### Immediate Checks (First Hour)

- [ ] Verify deployment URL works
- [ ] Test authentication flow
- [ ] Test booking creation
- [ ] Check admin panel access
- [ ] Verify health endpoints
- [ ] Check error tracking
- [ ] Monitor Vercel logs

### First 24 Hours

- [ ] Monitor error rates
- [ ] Check booking creation rate
- [ ] Verify rate limiting works
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Review user feedback
- [ ] Verify backups are running

### First Week

- [ ] Review performance metrics
- [ ] Check for any errors
- [ ] Optimize slow queries
- [ ] Review audit logs
- [ ] Update documentation
- [ ] Plan improvements

## Rollback Procedure

### If Deployment Fails

1. **Revert Vercel Deployment**:
   - Go to **Deployments**
   - Find previous working deployment
   - Click **"..."** → **"Promote to Production"**

2. **Restore Database** (if needed):
   - Go to Supabase dashboard
   - Restore from backup snapshot
   - Or run restore script

3. **Investigate Issues**:
   - Check build logs
   - Review error messages
   - Test in staging
   - Fix issues

4. **Redeploy**:
   - Fix issues
   - Test in staging
   - Deploy to production

### Database Rollback

If migration fails:

1. **Stop application** (if possible)
2. **Restore from backup**:
   ```bash
   npx tsx scripts/restore-from-backup.ts <backup-prefix>
   ```
3. **Or restore from Supabase snapshot**
4. **Fix migration script**
5. **Test in staging**
6. **Re-run migration**

## Performance Optimization

### Image Optimization

- Use Next.js `Image` component
- Configure image domains in `next.config.mjs`
- Use AVIF/WebP formats
- Consider CDN for static assets

### Caching

- Enable ISR for static pages
- Set appropriate cache headers
- Use Vercel Edge Caching
- Cache API responses where appropriate

### Database Optimization

- Add indexes for frequent queries
- Monitor slow queries
- Use connection pooling
- Optimize RLS policies

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Service role key secured
- [ ] No secrets in code
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Input validation active
- [ ] Error messages don't expose sensitive data

## Monitoring Checklist

- [ ] Health checks configured
- [ ] Error tracking active (Sentry)
- [ ] Logging configured
- [ ] Alerts set up
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Database monitoring active

## Support & Maintenance

### Regular Tasks

- **Daily**: Check error logs, monitor bookings
- **Weekly**: Review performance metrics, check backups
- **Monthly**: Review audit logs, optimize queries
- **Quarterly**: Security audit, dependency updates

### Emergency Contacts

- **DevOps**: [Contact]
- **Database Admin**: [Contact]
- **Security Team**: [Contact]
- **On-Call Engineer**: [Contact]

## Troubleshooting

### Common Issues

**Build Failures**:
- Check build logs in Vercel
- Verify all dependencies installed
- Check TypeScript errors
- Verify Node.js version

**Database Connection Issues**:
- Verify Supabase URL and keys
- Check Supabase project status
- Verify network connectivity
- Check RLS policies

**Authentication Issues**:
- Check redirect URLs in Supabase
- Verify domain in allowed origins
- Check CORS settings
- Verify session cookies

**Performance Issues**:
- Check database query performance
- Review Vercel analytics
- Optimize images
- Enable caching

## Next Steps

After successful deployment:

1. **Monitor closely** for first 48 hours
2. **Gather user feedback**
3. **Optimize based on metrics**
4. **Plan feature enhancements**
5. **Schedule regular maintenance**

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io)

