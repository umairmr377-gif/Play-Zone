/**
 * Script to inspect the bookings table structure in Supabase
 * This will show you the actual table schema, columns, and foreign key relationships
 */

import { createServiceRoleClient } from "../lib/supabase/server";

async function inspectBookingTable() {
  console.log("🔍 Inspecting bookings table in Supabase...\n");

  const client = createServiceRoleClient();

  if (!client) {
    console.error("❌ Supabase is not configured. Please set up your environment variables.");
    process.exit(1);
  }

  try {
    // 1. Check if table exists and get basic info
    console.log("1️⃣ Checking if bookings table exists...");
    const { data: tableExists, error: tableError } = await (client as any)
      .from("bookings")
      .select("id")
      .limit(1);

    if (tableError) {
      if (tableError.code === "42P01" || tableError.message?.includes("does not exist")) {
        console.error("❌ Bookings table does NOT exist in Supabase!");
        console.log("\n📝 To create it, run the schema:");
        console.log("   Go to Supabase Dashboard → SQL Editor");
        console.log("   Copy and paste the contents of supabase/schema.sql");
        console.log("   Click Run\n");
        process.exit(1);
      }
      throw tableError;
    }

    console.log("✅ Bookings table exists!\n");

    // 2. Get table structure by querying information_schema
    console.log("2️⃣ Getting table structure...");
    const { data: columns, error: columnsError } = await (client.rpc as any)(
      "get_table_columns",
      { table_name: "bookings" }
    ).catch(async () => {
      // Fallback: Query information_schema directly
      const query = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'bookings'
        ORDER BY ordinal_position;
      `;
      
      // Use raw SQL query if RPC doesn't work
      const { data, error } = await (client as any).rpc('exec_sql', { sql: query }).catch(() => {
        // If that doesn't work, try a different approach
        return { data: null, error: new Error("Cannot query information_schema directly") };
      });
      
      return { data, error };
    });

    // 3. Get sample data to see actual structure
    console.log("3️⃣ Getting sample booking data...");
    const { data: sampleBooking, error: sampleError } = await (client as any)
      .from("bookings")
      .select("*")
      .limit(1)
      .single();

    if (sampleError && sampleError.code !== "PGRST116") {
      console.warn("⚠️  Could not fetch sample data:", sampleError.message);
    }

    // 4. Check foreign key relationships
    console.log("4️⃣ Checking foreign key relationships...");
    const { data: courtRelationship, error: courtError } = await (client as any)
      .from("bookings")
      .select(`
        *,
        courts(
          id,
          name
        )
      `)
      .limit(1)
      .single();

    // 5. Display results
    console.log("\n" + "=".repeat(60));
    console.log("📊 BOOKINGS TABLE STRUCTURE");
    console.log("=".repeat(60) + "\n");

    if (sampleBooking) {
      console.log("✅ Sample booking data structure:");
      console.log(JSON.stringify(sampleBooking, null, 2));
      console.log("\n");

      console.log("📋 Columns found in sample data:");
      Object.keys(sampleBooking).forEach((key) => {
        const value = sampleBooking[key];
        const type = typeof value;
        const isNull = value === null ? "NULL" : "NOT NULL";
        console.log(`   - ${key}: ${type} (${isNull})`);
      });
    } else {
      console.log("ℹ️  No bookings found in table (table is empty)");
      console.log("\n📋 Expected columns based on schema:");
      console.log("   - id: UUID (PRIMARY KEY)");
      console.log("   - user_id: UUID (nullable, FK to auth.users)");
      console.log("   - court_id: UUID (NOT NULL, FK to courts)");
      console.log("   - date: DATE (NOT NULL)");
      console.log("   - start_time: TIME (NOT NULL)");
      console.log("   - end_time: TIME (NOT NULL)");
      console.log("   - status: TEXT (default: 'pending')");
      console.log("   - price: NUMERIC(10, 2) (NOT NULL)");
      console.log("   - customer_name: TEXT (nullable)");
      console.log("   - customer_email: TEXT (nullable)");
      console.log("   - created_at: TIMESTAMP WITH TIME ZONE (default: NOW())");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🔗 FOREIGN KEY RELATIONSHIPS");
    console.log("=".repeat(60) + "\n");

    if (courtRelationship && courtRelationship.courts) {
      console.log("✅ Relationship to 'courts' table: WORKING");
      console.log("   Sample court data:", JSON.stringify(courtRelationship.courts, null, 2));
    } else if (courtError) {
      console.log("❌ Relationship to 'courts' table: FAILED");
      console.log("   Error:", courtError.message);
      console.log("   Code:", courtError.code);
      console.log("\n   This might be a relationship cache issue.");
      console.log("   Try refreshing Supabase schema cache or check foreign key constraints.");
    } else {
      console.log("ℹ️  No data to test relationship (table is empty)");
    }

    // 6. Get row count
    console.log("\n" + "=".repeat(60));
    console.log("📈 TABLE STATISTICS");
    console.log("=".repeat(60) + "\n");

    const { count, error: countError } = await (client as any)
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (!countError) {
      console.log(`   Total bookings: ${count || 0}`);
    }

    console.log("\n✅ Inspection complete!\n");

  } catch (error: any) {
    console.error("❌ Error inspecting bookings table:", error.message);
    console.error("   Stack:", error.stack);
    process.exit(1);
  }
}

// Run the inspection
inspectBookingTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

