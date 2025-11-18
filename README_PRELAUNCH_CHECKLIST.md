# Pre-Launch Testing Checklist

Complete testing checklist before launching Play Zone to production.

## Environment Setup

- [ ] Production Supabase project created
- [ ] Vercel project configured
- [ ] All environment variables set in Vercel
- [ ] Custom domain configured (if applicable)
- [ ] DNS records updated
- [ ] SSL certificate active (automatic with Vercel)

## Database Setup

- [ ] Database schema deployed to production
- [ ] RLS policies enabled and tested
- [ ] Indexes created for performance
- [ ] Audit logs table created (if using)
- [ ] First admin user created
- [ ] Test data seeded (if needed)
- [ ] Automated backups configured

## Authentication & Authorization

- [ ] User signup flow works
- [ ] Email verification works
- [ ] Login with password works
- [ ] Login with magic link works
- [ ] Logout works correctly
- [ ] Session persistence works
- [ ] Admin login works
- [ ] Non-admin cannot access `/admin/*`
- [ ] Admin can access all admin routes
- [ ] User role promotion works
- [ ] User role demotion works
- [ ] Password reset works (if implemented)

## Core Functionality

### Sports & Courts

- [ ] Sports list loads correctly
- [ ] Sport details page works
- [ ] Courts list loads for each sport
- [ ] Court details page works
- [ ] Images load correctly
- [ ] Admin can create sport
- [ ] Admin can edit sport
- [ ] Admin can delete sport
- [ ] Admin can create court
- [ ] Admin can edit court
- [ ] Admin can delete court

### Booking Flow

- [ ] Time slot picker displays correctly
- [ ] Available time slots show correctly
- [ ] Booked slots are disabled
- [ ] User can select time slot
- [ ] Booking creation works
- [ ] Booking confirmation page displays
- [ ] Booking appears in admin panel
- [ ] Double booking prevention works
- [ ] Concurrent booking test passes (two users, same slot)
- [ ] Booking cancellation works (if implemented)

## Security Tests

- [ ] Rate limiting works (exceed 5 bookings/minute)
- [ ] Rate limiting headers returned correctly
- [ ] Security headers present (check with browser dev tools)
- [ ] CSP headers configured
- [ ] XSS protection active
- [ ] CSRF protection active (if implemented)
- [ ] SQL injection prevention (test with malicious inputs)
- [ ] RLS policies prevent unauthorized access
- [ ] Service role key not exposed to client
- [ ] Admin mutations require authentication
- [ ] Non-admin cannot perform admin mutations

## Performance Tests

- [ ] Page load times < 3 seconds
- [ ] Images optimized and loading quickly
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Caching working correctly
- [ ] Bundle size reasonable (< 500KB initial load)
- [ ] Lighthouse score > 90 for performance
- [ ] Mobile performance acceptable

## Error Handling

- [ ] Error boundaries catch React errors
- [ ] 404 page displays for invalid routes
- [ ] 403 page displays for unauthorized access
- [ ] 500 errors show friendly message
- [ ] Network errors handled gracefully
- [ ] Database errors logged correctly
- [ ] Error tracking (Sentry) captures errors
- [ ] Error messages don't expose sensitive data

## Monitoring & Logging

- [ ] Health check endpoint works: `/api/health`
- [ ] Database health check works: `/api/health/db`
- [ ] Logging captures booking events
- [ ] Logging captures admin mutations
- [ ] Logging captures auth events
- [ ] Audit logs created for admin actions
- [ ] Error tracking configured (Sentry)
- [ ] Alerts configured for critical errors
- [ ] Vercel analytics enabled

## Backup & Recovery

- [ ] Backup script works: `scripts/backup-supabase.ts`
- [ ] Backup files created successfully
- [ ] Restore script tested (in staging): `scripts/restore-from-backup.ts`
- [ ] Automated backups scheduled
- [ ] Backup retention policy set
- [ ] Migration rollback tested

## API Endpoints

- [ ] `GET /api/health` returns 200
- [ ] `GET /api/health/db` returns 200
- [ ] `GET /api/bookings` works with filters
- [ ] `POST /api/bookings` creates booking
- [ ] `GET /api/bookings/[id]` returns booking
- [ ] Admin API routes require authentication
- [ ] Admin API routes reject non-admins
- [ ] Rate limiting active on booking endpoint

## UI/UX Tests

- [ ] Responsive design works on mobile
- [ ] Responsive design works on tablet
- [ ] Responsive design works on desktop
- [ ] Navigation works correctly
- [ ] Forms validate input
- [ ] Loading states display
- [ ] Error messages are user-friendly
- [ ] Success messages display
- [ ] Accessibility basics (keyboard navigation)
- [ ] Dark mode (if implemented)

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Integration Tests

- [ ] Supabase connection works
- [ ] Auth flow with Supabase works
- [ ] Database queries work
- [ ] File uploads work (if applicable)
- [ ] Email sending works (if applicable)
- [ ] External API calls work (if applicable)

## Migration Tests

- [ ] Run migration script in staging
- [ ] Verify data migrated correctly
- [ ] Test rollback procedure
- [ ] Document migration steps
- [ ] Prepare production migration plan

## Documentation

- [ ] README updated
- [ ] Deployment instructions complete
- [ ] Environment variables documented
- [ ] API documentation (if applicable)
- [ ] Admin guide created
- [ ] Troubleshooting guide created

## Pre-Launch Final Checks

- [ ] All tests pass in staging
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Backup strategy verified
- [ ] Monitoring configured
- [ ] Team trained on admin panel
- [ ] Support process defined
- [ ] Rollback plan documented
- [ ] Launch announcement prepared

## Post-Launch Monitoring (First 24-48 Hours)

- [ ] Monitor error rates
- [ ] Monitor booking creation rate
- [ ] Check Sentry for new errors
- [ ] Monitor database performance
- [ ] Check Vercel logs
- [ ] Monitor API response times
- [ ] Check user feedback
- [ ] Verify backups are running
- [ ] Monitor rate limiting effectiveness

## Critical Path Test

Run this complete user journey:

1. [ ] New user signs up
2. [ ] User verifies email
3. [ ] User logs in
4. [ ] User browses sports
5. [ ] User views sport details
6. [ ] User views court details
7. [ ] User selects time slot
8. [ ] User creates booking
9. [ ] User views booking confirmation
10. [ ] Admin views booking in admin panel
11. [ ] Admin updates booking status
12. [ ] User receives notification (if implemented)

## Performance Benchmarks

Target metrics:

- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms
- [ ] API response time < 500ms (p95)
- [ ] Database query time < 200ms (p95)

## Security Audit

- [ ] No sensitive data in client-side code
- [ ] No API keys exposed
- [ ] Passwords hashed (Supabase handles this)
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection active
- [ ] Rate limiting active
- [ ] RLS policies tested
- [ ] Security headers present
- [ ] HTTPS enforced

## Sign-Off

- [ ] Development team sign-off
- [ ] QA team sign-off
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Business stakeholder approval
- [ ] Launch date confirmed

---

## Notes

- Test in staging environment that mirrors production
- Use production-like data volumes for performance tests
- Document any known issues before launch
- Have rollback plan ready
- Schedule launch during low-traffic period if possible

## Emergency Contacts

- **DevOps/Infrastructure**: [Contact]
- **Database Admin**: [Contact]
- **Security Team**: [Contact]
- **On-Call Engineer**: [Contact]

