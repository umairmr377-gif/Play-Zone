# Supabase Migration - Implementation Guide

## ✅ Completed

### Phase 1: Supabase Client Setup
- ✅ Created `lib/supabase/server.ts` with:
  - `createServerComponentClient()` - for server components
  - `createRouteHandlerClient()` - for API routes
  - `createServiceRoleClient()` - for admin operations
- ✅ Created `lib/supabase/client.ts` with:
  - `createClient()` - for client components

### Phase 2: Auth Pages Updated
- ✅ `app/auth/login/page.tsx` - Removed local auth fallback, uses Supabase only
- ✅ `app/auth/signup/page.tsx` - Removed local auth fallback, uses Supabase only

### Phase 4: Database Schema
- ✅ Created `supabase/schema.sql` with:
  - Sports table (UUID, name, description, image, icon)
  - Courts table (UUID, sport_id FK, name, location, price_per_hour, image_url)
  - Bookings table (UUID, user_id FK, court_id FK, date, start_time, end_time, status, price, customer_name, customer_email)
  - Profiles table (extends auth.users)
  - RLS policies
  - Indexes for performance
  - Triggers for auto-profile creation

## 🔄 In Progress / To Complete

### Phase 3: Environment Variables
**Action Required:**
1. Update `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

2. Add validation in `lib/supabase/server.ts` and `lib/supabase/client.ts` (already done - throws errors if missing)

### Phase 5: Update Middleware
**File:** `middleware.ts`
- Remove local auth fallback logic
- Use `createServerClient` from `@supabase/ssr`
- Check `session.user.app_metadata.role === 'admin'` for admin routes

### Phase 6: Update AuthButton Component
**File:** `components/AuthButton.tsx`
- Replace `getPublicClient()` with `createClient()` from `lib/supabase/client`
- Remove local auth fallback

### Phase 7: Update Bookings System
**Files to update:**
- `lib/bookings.ts` - Update to use new schema (start_time/end_time instead of time_slot)
- `app/api/bookings/route.ts` - Update booking creation logic
- Add booking collision detection using SQL overlap check

**New booking collision query:**
```sql
SELECT * FROM bookings
WHERE court_id = $1
AND date = $2
AND (start_time, end_time) OVERLAPS ($3, $4)
AND status = 'confirmed'
```

### Phase 8: Replace Mock Data
**Files to update:**
- `lib/sports.ts` - Remove mock fallback, require Supabase
- `lib/courts.ts` - Remove mock fallback, require Supabase
- `data/sports.ts` - Keep for reference but mark as deprecated

### Phase 9: Real-Time Updates
**Files to create/update:**
- `components/bookings/BookingsList.tsx` - Add real-time subscription
- `components/admin/AdminBookings.tsx` - Add real-time subscription

**Real-time implementation:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('bookings')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'bookings' },
      (payload) => {
        // Refresh bookings list
        refreshBookings();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Phase 10: Remove Local Auth Files
**Files to delete:**
- `app/api/auth/local/signin/route.ts`
- `app/api/auth/local/signup/route.ts`
- `app/api/auth/local/signout/route.ts`
- `app/api/auth/local/user/route.ts`
- `lib/auth/local-auth.ts` (if exists)

## 📋 Database Setup Steps

1. **Run SQL Schema:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/schema.sql`
   - Execute the SQL

2. **Seed Initial Data:**
   - Create a seed script or manually insert sports/courts via Supabase dashboard
   - Example sports: Football, Cricket, Paddle Tennis

3. **Enable Real-Time:**
   - Go to Supabase Dashboard → Database → Replication
   - Enable replication for `bookings` table

## 🧪 Testing Checklist

### Auth
- [ ] Sign-up works
- [ ] Login works
- [ ] Logout works
- [ ] User session persists
- [ ] Middleware protects routes
- [ ] Admin roles enforced

### Sports + Courts
- [ ] Data loads from Supabase
- [ ] No mock data remains
- [ ] Images display correctly

### Bookings
- [ ] Users can create bookings
- [ ] Conflicts prevented (overlapping times)
- [ ] Real-time updates appear instantly
- [ ] Admin can edit/delete bookings

### Performance
- [ ] No "Cannot read property of null" errors
- [ ] No missing env warnings
- [ ] No local storage auth fallback

## 📝 Notes

- The new schema uses UUIDs instead of integers for IDs
- Bookings use `start_time` and `end_time` (TIME type) instead of `time_slot` (TEXT)
- All tables have RLS enabled with appropriate policies
- Profile creation is automatic via trigger on user signup

