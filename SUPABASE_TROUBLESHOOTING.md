# Supabase Authentication Troubleshooting

## Common 400 Errors

### Error: `400 Bad Request` on `/auth/v1/token?grant_type=password`

This usually means one of the following:

#### 1. **Email Confirmation Required**
If email confirmation is enabled in Supabase, you need to verify your email before logging in.

**Solution:**
- Check your email inbox (and spam folder) for the confirmation link
- Click the confirmation link
- Then try logging in again

**Or disable email confirmation (for development):**
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. Toggle it OFF (for development only)
4. Save changes

#### 2. **User Doesn't Exist**
The email/password combination doesn't match any user.

**Solution:**
- Make sure you've signed up first at `/auth/signup`
- Check that the email is correct
- Try signing up again if needed

#### 3. **Invalid Credentials**
Wrong email or password.

**Solution:**
- Double-check your email and password
- Try resetting your password if needed

#### 4. **Database Schema Not Run**
If the `profiles` table doesn't exist, auth might work but profile creation fails.

**Solution:**
- Run the SQL schema from `supabase/schema.sql` in Supabase SQL Editor
- This creates the profiles table and triggers

## Quick Fixes

### Check Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Users**
4. Check if your user exists
5. Check if email is confirmed

### Test Sign Up First

1. Go to `/auth/signup`
2. Create a new account
3. Check your email for confirmation (if enabled)
4. Then try logging in

### Disable Email Confirmation (Development)

1. Supabase Dashboard → **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle **"Enable email confirmations"** OFF
4. Save

This allows immediate login after signup (development only).

## Debug Steps

1. **Check Browser Console** - Look for specific error messages
2. **Check Network Tab** - See the exact request/response
3. **Check Supabase Logs** - Dashboard → Logs → API
4. **Verify Environment Variables** - Make sure `.env.local` is correct
5. **Restart Dev Server** - After changing `.env.local`

## Common Error Messages

- **"Invalid login credentials"** - Wrong email/password or user doesn't exist
- **"Email not confirmed"** - Need to click confirmation link
- **"User already registered"** - Try logging in instead of signing up
- **"Failed to fetch"** - Network issue or wrong Supabase URL

