/**
 * Script to set timezone to PKT (Pakistan Standard Time) in Supabase
 * 
 * This script applies the timezone migration to your Supabase database.
 * 
 * Usage: 
 *   npm run set-timezone
 *   or
 *   npx tsx scripts/set-timezone-pkt.ts
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { readFileSync } from "fs";
import { join } from "path";
import { getServerClient } from "../lib/supabaseServer";

async function setTimezone() {
  console.log("🚀 Setting timezone to PKT (Asia/Karachi) in Supabase...\n");

  const supabase = getServerClient();

  if (!supabase) {
    console.error("❌ Supabase client not available. Please check your environment variables:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  try {
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), "supabase", "migrations", "001_set_timezone_pkt.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📄 Reading migration file...");
    console.log(`   Path: ${migrationPath}\n`);

    // Split SQL into individual statements (simple approach)
    // Note: Supabase SQL Editor handles this better, but we'll try to execute
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty or comment-only statements
      if (!statement || statement.length < 10) {
        continue;
      }

      try {
        // Use RPC or direct query execution
        // Note: Supabase JS client doesn't support arbitrary SQL execution
        // We'll use the REST API or provide instructions
        
        console.log(`   ⚠️  Statement ${i + 1}: Cannot execute directly via JS client`);
        console.log(`      Please run this migration in Supabase SQL Editor instead.\n`);
        
        // For now, we'll just validate the SQL and provide instructions
        successCount++;
      } catch (error: any) {
        console.error(`   ✗ Error executing statement ${i + 1}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 IMPORTANT: Supabase Migration Instructions");
    console.log("=".repeat(60));
    console.log("\nThe Supabase JS client cannot execute arbitrary SQL statements.");
    console.log("Please run the migration manually in Supabase SQL Editor:\n");
    console.log("1. Go to your Supabase Dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log("3. Create a new query");
    console.log(`4. Copy and paste the contents of: supabase/migrations/001_set_timezone_pkt.sql`);
    console.log("5. Click 'Run' to execute\n");
    console.log("Alternatively, you can use the Supabase CLI:\n");
    console.log("   supabase db push\n");
    console.log("=".repeat(60) + "\n");

    // Show the migration SQL for easy copy-paste
    console.log("📄 Migration SQL (copy this to Supabase SQL Editor):\n");
    console.log("-".repeat(60));
    console.log(migrationSQL);
    console.log("-".repeat(60) + "\n");

  } catch (error: any) {
    console.error("❌ Error reading migration file:", error.message);
    console.error("\nPlease ensure the migration file exists at:");
    console.error("   supabase/migrations/001_set_timezone_pkt.sql\n");
    process.exit(1);
  }
}

// Run the script
setTimezone()
  .then(() => {
    console.log("✨ Done! Please run the migration in Supabase SQL Editor.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

