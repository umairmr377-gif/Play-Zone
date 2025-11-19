# Quick Fix: 400 Error on Login

## The Problem

You're seeing this error:
```
Failed to load resource: the server responded with a status of 400
zpkojuhplrhweiznnnda.supabase.co/auth/v1/token?grant_type=password
```

## Most Common Causes

### 1. **Email Confirmation Required** ⭐ (Most Common)

Supabase requires email confirmation by default. You need to:
1. **Sign up first** at `/auth/signup`
2. **Check your email** (including spam folder)
3. **Click the confirmation link** in the email
4. **Then try logging in**

### 2. **User Doesn't Exist**

You're trying to log in with an email that hasn't been registered yet.

**Solution:** Go to `/auth/signup` and create an account first.

### 3. **Wrong Password**

The password doesn't match the email.

**Solution:** Double-check your password or use "Forgot Password" if available.

## Quick Fix: Disable Email Confirmation (Development Only)

For faster testing during development, you can disable email confirmation:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `zpkojuhplrhweiznnnda`
3. Go to **Authentication** → **Settings** (gear icon)
4. Scroll to **Email Auth** section
5. Find **"Enable email confirmations"**
6. **Toggle it OFF**
7. Click **Save**

⚠️ **Warning:** Only disable this for development. Re-enable it for production!

## Step-by-Step Solution

### Option A: Use Email Confirmation (Recommended)

1. **Sign Up:**
   - Go to `http://localhost:3000/auth/signup`
   - Enter your email, password, and name
   - Click "Sign Up"

2. **Check Email:**
   - Open your email inbox
   - Look for an email from Supabase
   - Check spam folder if not found
   - Click the confirmation link

3. **Log In:**
   - Go to `http://localhost:3000/auth/login`
   - Enter your email and password
   - Click "Sign In"

### Option B: Disable Email Confirmation (Development)

1. Follow the steps above to disable email confirmation
2. Sign up at `/auth/signup`
3. Immediately log in at `/auth/login` (no email confirmation needed)

## Verify Your Setup

1. **Check `.env.local`** - Make sure it has your Supabase credentials
2. **Restart Dev Server** - After changing `.env.local` or Supabase settings
3. **Check Supabase Dashboard** - Go to Authentication → Users to see if your user exists

## Still Having Issues?

1. **Check Browser Console** - Look for specific error messages
2. **Check Network Tab** - See the exact request/response
3. **Check Supabase Logs** - Dashboard → Logs → API
4. **Verify Database Schema** - Make sure you've run `supabase/schema.sql`

## Common Error Messages

- **"Invalid login credentials"** → Wrong email/password or user doesn't exist
- **"Email not confirmed"** → Need to click confirmation link
- **"User already registered"** → Try logging in instead
- **"Failed to fetch"** → Network issue or wrong Supabase URL

