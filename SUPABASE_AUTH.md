# Supabase Authentication Integration Guide

This guide covers the authentication system integrated into Play Zone using Supabase Auth.

## Overview

The app now uses Supabase Auth for:
- User authentication (email/password and magic links)
- Role-based access control (admin/user)
- Protected admin routes
- User profile management

## Environment Variables

Ensure these are set in `.env.local` and your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:**
- `NEXT_PUBLIC_*` variables are safe for client-side use
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** - NEVER expose to client

## Database Setup

### 1. Create Profiles Table

Run the SQL in `supabase/auth-schema.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Paste the contents of `supabase/auth-schema.sql`
4. Run the query

This creates:
- `profiles` table with roles
- Auto-profile creation trigger
- RLS policies
- Indexes

### 2. Create First Admin

After creating the profiles table, you need to create your first admin user:

**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Create a new user or use existing user
3. Note the user's UUID
4. Run this SQL (replace `<user-uuid>` with actual UUID):

```sql
INSERT INTO profiles (id, full_name, role)
VALUES ('<user-uuid>', 'Admin Name', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

**Option B: Via Admin Panel (after initial setup)**
1. Sign up/login as a regular user
2. Manually update your role in Supabase dashboard
3. Then use the admin panel to promote other users

## Authentication Flow

### User Sign Up

1. User visits `/auth/signup`
2. Enters email, password, and name
3. Supabase creates auth user
4. Trigger automatically creates profile with `role = 'user'`
5. User receives verification email
6. After verification, user can log in

### User Login

1. User visits `/auth/login`
2. Can choose:
   - **Password login**: Email + password
   - **Magic link**: Email only (OTP sent to email)
3. After successful login, session is stored
4. User redirected to original page or home

### Admin Access

1. Admin logs in via `/auth/login`
2. Middleware checks session and role
3. If role is 'admin', access granted to `/admin/*`
4. If role is 'user', redirected to `/403`

## Protected Routes

### Middleware Protection

The `middleware.ts` file protects all `/admin/*` routes:

- Checks for valid session
- Verifies user role is 'admin'
- Redirects to login if not authenticated
- Redirects to `/403` if not admin

### Server-Side Protection

All admin API routes use `requireAdmin()`:

```typescript
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await requireAdmin(); // Throws if not admin
  // ... admin operations
}
```

## Auth Helpers

### Client-Side

**`lib/supabaseClient.ts`**
- `getPublicClient()` - For client-side auth operations
- Safe to use in components and client-side code

### Server-Side

**`lib/auth.ts`**
- `getServerAuthSession()` - Get current user session and role
- `getCurrentUser()` - Get current user (throws if not authenticated)
- `requireUser()` - Require authentication
- `requireAdmin()` - Require admin role
- `isAdmin()` - Check if user is admin
- `updateUserRole()` - Update user role (admin only)

**`lib/supabaseServer.ts`**
- `getServerClient()` - Service role client (admin operations)
- `createServerComponentClient()` - Server component client with session

## User Management

### Admin Panel - User Management

Access at `/admin/users`:

**Features:**
- View all users
- See user roles
- Promote user to admin
- Demote admin to user
- Invite new users by email

**Promote User:**
1. Go to `/admin/users`
2. Click "Promote" next to a user
3. User role updated to 'admin'

**Invite User:**
1. Click "Invite User"
2. Enter email address
3. Magic link invitation sent
4. User can sign up via link

## RLS Policies

### Current Setup

The `profiles` table has RLS enabled with:

- **Users can read their own profile**
- **Users can update their own profile** (but not role)
- **Service role bypasses RLS** (for admin operations)

### Recommended Production Policies

For `bookings` table (when ready):

```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert bookings
CREATE POLICY "authenticated_insert_bookings" ON bookings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to read their own bookings
CREATE POLICY "users_read_own_bookings" ON bookings
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Allow admins to read all bookings (via service role)
-- Service role bypasses RLS, so no policy needed
```

## UI Components

### AuthButton

Located in navbar, shows:
- "Sign In" if not logged in
- User avatar/name menu if logged in
- "Admin Panel" link if user is admin
- "My Bookings" link
- "Sign Out" button

### Auth Pages

- `/auth/login` - Login page (password or magic link)
- `/auth/signup` - Sign up page
- `/auth/callback` - OAuth/magic link callback handler
- `/403` - Unauthorized access page

## Testing Checklist

After setup, test:

- [ ] User can sign up
- [ ] User receives verification email
- [ ] User can log in with password
- [ ] User can log in with magic link
- [ ] User session persists across page reloads
- [ ] Non-admin cannot access `/admin/*`
- [ ] Admin can access `/admin/*`
- [ ] Admin can promote users
- [ ] Admin can demote users
- [ ] Admin can invite users
- [ ] Logout works correctly
- [ ] Protected API routes reject non-admins

## Troubleshooting

### "Missing Supabase environment variables"

- Ensure all env vars are set in `.env.local`
- Restart dev server after adding variables
- Check variable names match exactly

### "Not authenticated" errors

- Check user is logged in
- Verify session in browser dev tools
- Check Supabase Auth settings

### "Access Denied" for admin routes

- Verify user role in `profiles` table
- Check middleware is running
- Ensure RLS policies allow service role operations

### Profile not created on signup

- Check trigger exists: `on_auth_user_created`
- Verify trigger function: `handle_new_user()`
- Check Supabase logs for errors

### Magic link not working

- Check email redirect URL in Supabase settings
- Verify `NEXT_PUBLIC_SITE_URL` is set (for production)
- Check spam folder

## Security Best Practices

1. **Never expose service role key:**
   - Only use in server-side code
   - Never in `NEXT_PUBLIC_*` variables
   - Never in client-side code

2. **Always verify roles server-side:**
   - Client-side checks are for UX only
   - Server-side checks are for security

3. **Use RLS in production:**
   - Enable RLS on all tables
   - Create proper policies
   - Test policies thoroughly

4. **Protect admin operations:**
   - All admin mutations use `requireAdmin()`
   - Service role only used after role verification

5. **Session management:**
   - Sessions auto-refresh via middleware
   - Logout clears session properly
   - Handle expired sessions gracefully

## Deployment

### Vercel

1. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (mark as sensitive)

2. Set site URL in Supabase:
   - Go to Authentication → URL Configuration
   - Set Site URL to your Vercel domain
   - Add redirect URLs

3. Deploy:
   ```bash
   git push origin main
   ```

### Other Platforms

- Ensure all env vars are set
- Configure redirect URLs in Supabase
- Test authentication flow after deployment

## Next Steps

After authentication is set up:

1. **Add user bookings page:**
   - Create `/bookings/my` page
   - Show user's bookings
   - Allow cancellation

2. **Add user profile page:**
   - Edit profile information
   - Change password
   - View booking history

3. **Add OAuth providers:**
   - Google sign-in
   - GitHub sign-in
   - Add buttons to login page

4. **Enhance admin features:**
   - User activity logs
   - Booking analytics per user
   - Bulk user operations

## Support

For issues:
- Check Supabase Auth docs: https://supabase.com/docs/guides/auth
- Review middleware logs
- Check Supabase dashboard → Authentication → Logs
- Verify database triggers and policies

