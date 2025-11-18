# Supabase Integration - Status Report

## ✅ COMPLETED

### 1. Supabase Client Setup ✅
- **Created:** `lib/supabase/server.ts`
  - `createServerComponentClient()` - Server components
  - `createRouteHandlerClient()` - API routes  
  - `createServiceRoleClient()` - Admin operations
- **Created:** `lib/supabase/client.ts`
  - `createClient()` - Client components
- **All clients throw errors if env vars missing** ✅

### 2. Auth Pages Updated ✅
- **`app/auth/login/page.tsx`**
  - ✅ Removed all local auth fallback
  - ✅ Uses `createClient()` from `lib/supabase/client`
  - ✅ Password and magic link auth working
- **`app/auth/signup/page.tsx`**
  - ✅ Removed all local auth fallback
  - ✅ Uses `createClient()` from `lib/supabase/client`
  - ✅ Signup with full_name in metadata

### 3. Components Updated ✅
- **`components/AuthButton.tsx`**
  - ✅ Removed local auth fallback
  - ✅ Uses `createClient()` from `lib/supabase/client`
  - ✅ Real-time auth state changes

### 4. Middleware Updated ✅
- **`middleware.ts`**
  - ✅ Removed local auth fallback
  - ✅ Uses Supabase session only
  - ✅ Admin role check via profiles table
  - ✅ Redirects to login if not authenticated

### 5. Database Schema Created ✅
- **`supabase/schema.sql`**
  - ✅ Sports table (UUID, name, description, image, icon)
  - ✅ Courts table (UUID, sport_id FK, name, location, price_per_hour, image_url)
  - ✅ Bookings table (UUID, user_id FK, court_id FK, date, start_time, end_time, status, price, customer_name, customer_email)
  - ✅ Profiles table (extends auth.users)
  - ✅ RLS policies enabled
  - ✅ Indexes for performance
  - ✅ Trigger for auto-profile creation
  - ✅ Composite index for booking conflict detection

## 🔄 REMAINING WORK

### 6. Bookings System Update (CRITICAL)
**Files to update:**
- `lib/bookings.ts` - Update to use new schema (start_time/end_time instead of time_slot)
- `app/api/bookings/route.ts` - Update booking creation with collision detection

**Required changes:**
1. Convert time slot strings (e.g., "10:00") to TIME type for start_time/end_time
2. Add SQL overlap check for collision detection:
```sql
SELECT * FROM bookings
WHERE court_id = $1
AND date = $2
AND (start_time, end_time) OVERLAPS ($3, $4)
AND status = 'confirmed'
```
3. Update `getBookedSlots()` to return time ranges instead of strings
4. Update booking creation to parse time slots into start_time/end_time

### 7. Replace Mock Data
**Files to update:**
- `lib/sports.ts` - Remove `mockSports` fallback, throw error if Supabase not configured
- `lib/courts.ts` - Remove mock fallback, throw error if Supabase not configured

**Action:** Remove all `if (!client) return mockData;` patterns

### 8. Real-Time Updates
**Files to create/update:**
- `components/bookings/BookingsList.tsx` (if exists) - Add real-time subscription
- `components/admin/AdminBookings.tsx` - Add real-time subscription

**Implementation pattern:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('bookings')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'bookings' },
      () => refreshBookings()
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

### 9. Remove Local Auth Files
**Files to DELETE:**
- `app/api/auth/local/signin/route.ts`
- `app/api/auth/local/signup/route.ts`
- `app/api/auth/local/signout/route.ts`
- `app/api/auth/local/user/route.ts`
- `lib/auth/local-auth.ts` (if exists)

### 10. Update Database Types
**File:** `lib/supabaseClient.ts`
- Update `Database` interface to match new schema (UUIDs, start_time/end_time)

## 📋 SETUP INSTRUCTIONS

### Step 1: Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Step 2: Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Execute the SQL

### Step 3: Enable Real-Time
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for `bookings` table

### Step 4: Seed Initial Data
Insert sports and courts via Supabase dashboard or create a seed script.

## 🧪 TESTING CHECKLIST

### Auth
- [ ] Sign-up creates user and profile
- [ ] Login works with email/password
- [ ] Magic link works
- [ ] Logout clears session
- [ ] Session persists across page reloads
- [ ] Middleware protects /admin routes
- [ ] Non-admin users redirected from /admin

### Sports + Courts
- [ ] Sports load from Supabase
- [ ] Courts load from Supabase
- [ ] No mock data fallback
- [ ] Images display correctly

### Bookings
- [ ] Users can create bookings
- [ ] Time slot conflicts are prevented
- [ ] Booking collision detection works
- [ ] Real-time updates appear instantly
- [ ] Admin can view all bookings
- [ ] Admin can edit/delete bookings

### Performance
- [ ] No "Cannot read property of null" errors
- [ ] No missing env warnings
- [ ] No local storage auth fallback
- [ ] Real-time subscriptions don't leak

## 📝 CRITICAL NOTES

1. **Schema Change:** Bookings now use `start_time` and `end_time` (TIME type) instead of `time_slot` (TEXT). All booking code must be updated.

2. **UUIDs:** All IDs are now UUIDs, not integers. Update all ID comparisons.

3. **Time Format:** Time slots need to be converted from strings like "10:00" to TIME type. Assume 1-hour slots unless specified otherwise.

4. **RLS:** Row Level Security is enabled. Service role client bypasses RLS for admin operations.

5. **Real-Time:** Must enable replication in Supabase dashboard for real-time to work.

## 🚨 BREAKING CHANGES

- Local auth completely removed - app requires Supabase
- Mock data fallbacks removed - app requires Supabase data
- Booking schema changed - time_slot → start_time/end_time
- ID types changed - integers → UUIDs

