# Supabase Integration - Quick Reference

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create database schema:**
   - Go to Supabase SQL Editor
   - Run `supabase/schema.sql`

3. **Migrate data:**
   ```bash
   npx tsx scripts/migrate-to-supabase.ts
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

## Key Files

- `lib/supabaseClient.ts` - Client initialization
- `lib/sports.ts` - Sports operations
- `lib/courts.ts` - Courts operations
- `lib/bookings.ts` - Bookings operations
- `lib/admin.ts` - Admin operations
- `supabase/schema.sql` - Database schema
- `scripts/migrate-to-supabase.ts` - Migration script

## Testing

After migration, test:
- ✅ Sports list loads from Supabase
- ✅ Can create bookings
- ✅ Double booking prevention works
- ✅ Admin dashboard functions correctly

See `SUPABASE_MIGRATION.md` for detailed documentation.

