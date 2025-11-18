# Production Launch Checklist

Quick reference checklist for launching Play Zone to production.

## Pre-Launch (1 Week Before)

### Code & Testing
- [ ] All features tested in staging
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Code review completed
- [ ] All tests passing
- [ ] Documentation updated

### Infrastructure
- [ ] Production Supabase project created
- [ ] Production Vercel project configured
- [ ] Environment variables documented
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] DNS records updated

### Database
- [ ] Schema deployed to production
- [ ] RLS policies tested in staging
- [ ] Migrations tested
- [ ] Backup strategy configured
- [ ] First admin user created

## Launch Day

### Pre-Deployment
- [ ] Final code review
- [ ] Create database backup
- [ ] Notify team of deployment
- [ ] Prepare rollback plan

### Deployment Steps
1. [ ] Deploy to Vercel preview
2. [ ] Smoke test preview deployment
3. [ ] Run database migrations (if any)
4. [ ] Deploy to production
5. [ ] Verify deployment successful

### Post-Deployment (First Hour)
- [ ] Test homepage loads
- [ ] Test authentication
- [ ] Test booking creation
- [ ] Test admin panel
- [ ] Check health endpoints
- [ ] Monitor error logs
- [ ] Check Vercel analytics

## Post-Launch (First 24 Hours)

### Monitoring
- [ ] Monitor error rates
- [ ] Check booking creation rate
- [ ] Monitor API response times
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Verify backups running

### Verification
- [ ] All critical paths working
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Security headers present
- [ ] Rate limiting active

## Weekly Maintenance

- [ ] Review error logs
- [ ] Check backup status
- [ ] Review performance metrics
- [ ] Update dependencies (if needed)
- [ ] Review audit logs

## Emergency Contacts

- **DevOps**: [Contact]
- **Database**: [Contact]
- **Security**: [Contact]
- **On-Call**: [Contact]

