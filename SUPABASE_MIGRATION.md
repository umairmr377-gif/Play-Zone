# Supabase Database Migration Guide

This guide covers migrating Play Zone from file-based JSON storage to Supabase (PostgreSQL).

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project
3. **Node.js**: Version 18+ required

## Installation

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_SCHEMA=public
```

**Important Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the client (safe for reads)
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** - NEVER expose to client
- Get these values from your Supabase project settings → API

## Database Setup

### 1. Create Tables

Run the SQL schema in `supabase/schema.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Paste the contents of `supabase/schema.sql`
5. Click **Run**

This creates:
- `sports` table
- `courts` table
- `bookings` table
- Unique constraint on `(court_id, date, time_slot)` to prevent double bookings
- Indexes for performance

### 2. Row Level Security (RLS)

**For Development:**
- RLS is disabled by default (easier development)
- All operations work with service role key

**For Production:**
- Enable RLS on all tables
- Create policies as shown in `supabase/schema.sql`
- Use service role key only for admin operations

## Data Migration

### 1. Backup Existing Data

The migration script automatically creates backups in `data/backups/`, but you can also manually backup:

```bash
# Backup sports data
cp data/sports.json data/sports.json.bak

# Backup bookings data
cp data/bookings.json data/bookings.json.bak
```

### 2. Run Migration Script

```bash
# Using tsx (recommended)
npx tsx scripts/migrate-to-supabase.ts

# Or using ts-node
npx ts-node scripts/migrate-to-supabase.ts
```

The script will:
1. Create backups of existing data
2. Clear existing Supabase tables (optional)
3. Migrate sports from `data/sports.ts` or `data/sports.json`
4. Migrate courts for each sport
5. Migrate bookings from `data/bookings.json`
6. Map old string IDs to new numeric IDs
7. Report migration results

### 3. Verify Migration

After migration, verify the data:

1. Check Supabase dashboard → Table Editor
2. Verify sports count matches original
3. Verify courts are linked to sports
4. Verify bookings are linked to courts

## Code Changes

### Updated Files

The following files have been updated to use Supabase:

**Library Files:**
- `lib/supabaseClient.ts` - Supabase client initialization
- `lib/db.ts` - Database helper functions
- `lib/sports.ts` - Sports operations (Supabase-backed)
- `lib/courts.ts` - Courts operations (Supabase-backed)
- `lib/bookings.ts` - Bookings operations (Supabase-backed)
- `lib/admin.ts` - Admin operations (Supabase-backed)

**Frontend Pages:**
- `app/sports/page.tsx` - Now fetches from Supabase
- `app/sports/[sportId]/page.tsx` - Uses Supabase queries
- `app/sports/[sportId]/[courtId]/page.tsx` - Uses Supabase queries
- `app/booking/confirmation/page.tsx` - Uses Supabase queries

**API Routes:**
- `app/api/bookings/route.ts` - Uses Supabase for booking creation
- `app/api/bookings/[id]/route.ts` - Uses Supabase for fetching
- `app/api/admin/*` - All admin routes use Supabase

**Components:**
- `components/CourtBookingSection.tsx` - Updated booking creation

## Conflict Prevention

### Database-Level Protection

The unique constraint `unique_court_date_slot` prevents double bookings at the database level:

```sql
ALTER TABLE bookings
  ADD CONSTRAINT unique_court_date_slot UNIQUE (court_id, date, time_slot);
```

### Application-Level Protection

1. **Optimistic Check**: Before inserting, check if slot is already booked
2. **Error Handling**: Catch unique constraint violations and show user-friendly messages
3. **Real-time Updates**: (Optional) Use Supabase realtime to update UI when bookings change

## Testing Checklist

After migration, test the following:

- [ ] **Sports List**: `/sports` shows all sports from Supabase
- [ ] **Sport Details**: `/sports/[id]` shows sport and courts
- [ ] **Court Booking**: Can select time slot and create booking
- [ ] **Double Booking**: Attempting to book an already-booked slot shows error
- [ ] **Booking Confirmation**: `/booking/confirmation` shows booking details
- [ ] **Admin Dashboard**: Can view/edit sports, courts, bookings
- [ ] **Admin Create**: Can create new sports and courts
- [ ] **Admin Delete**: Can delete sports and courts
- [ ] **Booked Slots**: TimeSlotPicker disables already-booked slots

## Deployment

### Vercel Deployment

1. **Add Environment Variables**:
   - Go to Vercel project settings → Environment Variables
   - Add all three Supabase variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (mark as sensitive)

2. **Deploy**:
   ```bash
   git push origin main
   ```

3. **Verify**:
   - Check that environment variables are set
   - Test booking creation
   - Check Supabase logs for errors

### Other Platforms

For other hosting platforms:
- Ensure all environment variables are set
- `SUPABASE_SERVICE_ROLE_KEY` should be server-only (not exposed to client)
- Test database connectivity

## Rollback Plan

If migration fails or issues occur:

### Option 1: Restore from Backup

1. Restore `data/sports.json` and `data/bookings.json` from backups
2. Revert code changes (git)
3. Continue using file-based storage

### Option 2: Clear Supabase and Re-run

1. Clear Supabase tables:
   ```sql
   DELETE FROM bookings;
   DELETE FROM courts;
   DELETE FROM sports;
   ```
2. Fix any issues in migration script
3. Re-run migration

### Option 3: Export from Supabase

1. Use Supabase export feature (Dashboard → Settings → Database)
2. Export to CSV/JSON
3. Restore to file-based storage if needed

## Troubleshooting

### Common Issues

**1. "Missing Supabase environment variables"**
- Ensure `.env.local` exists and has all required variables
- Restart dev server after adding variables

**2. "Error fetching sports"**
- Check Supabase URL and keys are correct
- Verify tables exist in Supabase
- Check Supabase project is active

**3. "Unique constraint violation"**
- This is expected when booking an already-booked slot
- Error message should be user-friendly

**4. "Migration script fails"**
- Check Node.js version (18+)
- Ensure Supabase credentials are correct
- Check network connectivity to Supabase

**5. "RLS blocking operations"**
- For development: Disable RLS
- For production: Create proper policies
- Use service role key for admin operations

## Performance Optimization

### Indexes

The schema includes indexes for common queries:
- `idx_courts_sport_id` - Fast sport → courts lookup
- `idx_bookings_court_date` - Fast availability checks
- `idx_bookings_sport_id` - Fast sport filtering
- `idx_bookings_status` - Fast status filtering

### Query Optimization

- Use `select()` with specific columns when possible
- Use `.single()` for single row queries
- Use `.maybeSingle()` when row might not exist
- Add `.limit()` for pagination

## Security Best Practices

1. **Never expose service role key**:
   - Only use in server-side code
   - Never in `NEXT_PUBLIC_*` variables
   - Never in client-side code

2. **Enable RLS for production**:
   - Create policies for each table
   - Test policies thoroughly
   - Use service role only for admin operations

3. **Validate inputs**:
   - Server-side validation for all inputs
   - Sanitize user inputs
   - Use TypeScript types

4. **Rate limiting**:
   - Consider adding rate limits for booking creation
   - Use Supabase edge functions for complex logic

## Next Steps

After successful migration:

1. **Remove file dependencies**:
   - Archive `data/sports.ts` and `data/bookings.json`
   - Update imports if needed
   - Remove file-based functions

2. **Add real-time features** (optional):
   - Subscribe to booking changes
   - Update UI in real-time
   - See `utils/realtime.ts` example

3. **Add authentication**:
   - Integrate Supabase Auth
   - Link bookings to users
   - Add user profiles

4. **Add analytics**:
   - Track booking trends
   - Revenue reports
   - Popular time slots

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Check Next.js documentation: https://nextjs.org/docs
- Review migration script logs
- Check Supabase dashboard for errors

