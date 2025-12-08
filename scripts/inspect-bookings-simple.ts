/**
 * Simple script to inspect bookings table
 * Uses environment variables from .env.local
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

import { createServiceRoleClient } from "../lib/supabase/server";

async function main() {
  console.log("🔍 Inspecting bookings table in Supabase...\n");

  const client = createServiceRoleClient();

  if (!client) {
    console.error("❌ Supabase is not configured.");
    console.error("   Make sure you have .env.local with:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY\n");
    process.exit(1);
  }

  try {
    // 1. Check if table exists
    console.log("1️⃣ Checking if bookings table exists...");
    const { data, error } = await (client as any)
      .from("bookings")
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.error("❌ Bookings table does NOT exist!");
        console.log("\n📝 Create it by running supabase/schema.sql in Supabase SQL Editor\n");
        process.exit(1);
      }
      throw error;
    }

    console.log("✅ Bookings table exists!\n");

    // 2. Get sample data
    console.log("2️⃣ Getting sample booking...");
    const { data: sample, error: sampleError } = await (client as any)
      .from("bookings")
      .select("*")
      .limit(1)
      .single();

    if (sampleError && sampleError.code !== "PGRST116") {
      console.warn("⚠️  No bookings found (table is empty)\n");
    } else if (sample) {
      console.log("✅ Sample booking structure:");
      console.log(JSON.stringify(sample, null, 2));
      console.log("\n📋 Columns:");
      Object.keys(sample).forEach((key) => {
        console.log(`   - ${key}: ${typeof sample[key]}${sample[key] === null ? " (NULL)" : ""}`);
      });
    }

    // 3. Test relationship
    console.log("\n3️⃣ Testing relationship to courts table...");
    const { data: withCourt, error: relError } = await (client as any)
      .from("bookings")
      .select(`
        *,
        courts(
          id,
          name,
          sport_id
        )
      `)
      .limit(1)
      .single();

    if (relError) {
      console.log("❌ Relationship test failed:");
      console.log(`   Error: ${relError.message}`);
      console.log(`   Code: ${relError.code}`);
      console.log("\n   This indicates a relationship cache issue.");
      console.log("   The foreign key might not be properly set up in Supabase.");
    } else if (withCourt) {
      console.log("✅ Relationship works!");
      console.log("   Court data:", JSON.stringify(withCourt.courts, null, 2));
    } else {
      console.log("ℹ️  No data to test relationship");
    }

    // 4. Count
    console.log("\n4️⃣ Getting row count...");
    const { count } = await (client as any)
      .from("bookings")
      .select("*", { count: "exact", head: true });
    console.log(`   Total bookings: ${count || 0}\n`);

    console.log("✅ Inspection complete!\n");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();

