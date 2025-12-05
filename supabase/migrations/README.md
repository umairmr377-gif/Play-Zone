# Supabase Migrations

This directory contains database migration scripts for the PlayZone project.

## Timezone Migration (PKT - Pakistan Standard Time)

### Migration: `001_set_timezone_pkt.sql`

This migration configures the database to use **Pakistan Standard Time (PKT - UTC+5)**.

### How to Apply

#### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `001_set_timezone_pkt.sql`
5. Click **Run** to execute

#### Option 2: Using the Helper Script

```bash
npm run set-timezone
```

This script will display the migration SQL and provide instructions. You still need to run it in Supabase SQL Editor.

#### Option 3: Supabase CLI (if configured)

```bash
supabase db push
```

### What This Migration Does

1. **Sets session timezone** to `Asia/Karachi` (PKT - UTC+5)
2. **Creates `now_pkt()` function** - Returns current timestamp in PKT
3. **Creates `today_pkt()` function** - Returns current date in PKT
4. **Updates `update_updated_at_column()` function** - Uses PKT for timestamps
5. **Creates `current_pkt_time` view** - For testing timezone conversion

### Important Notes

- **Session-level timezone**: The `SET timezone` command affects the current session. For persistent timezone, configure it in:
  - Supabase project settings
  - Connection string (if using direct PostgreSQL connection)
  - Application code (already handled in `lib/utils.ts`)

- **Application-level conversion**: The frontend code in `lib/utils.ts` already converts all timestamps to PKT for display. This migration ensures database functions also use PKT.

- **Testing**: After applying the migration, you can test with:
  ```sql
  SELECT * FROM current_pkt_time;
  ```

### Verification

After running the migration, verify it worked:

```sql
-- Check current timezone
SHOW timezone;

-- Should return: Asia/Karachi

-- Test PKT function
SELECT now_pkt();

-- Compare UTC vs PKT
SELECT 
  NOW() AS utc_time,
  now_pkt() AS pkt_time;
```

### Rollback (if needed)

If you need to revert to UTC:

```sql
SET timezone = 'UTC';
```

However, it's recommended to keep PKT as the application is designed for Pakistan Standard Time.

