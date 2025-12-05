/**
 * Script to update court prices in Supabase
 * 
 * Updates prices to:
 * - Padel (Paddle Tennis): PKR 4000/hour
 * - Football: PKR 3000/hour
 * - Cricket: PKR 3000/hour
 * 
 * Usage: 
 *   npm run update-prices
 *   or
 *   npx tsx scripts/update-prices.ts
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { getServerClient } from "../lib/supabaseServer";

/**
 * Update prices for all courts in Supabase
 */
async function updatePrices() {
  console.log("🚀 Starting price update in Supabase...\n");

  const supabase = getServerClient();

  if (!supabase) {
    console.error("❌ Supabase client not available. Please check your environment variables:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  // Price mapping: sport name (case-insensitive) -> price per hour
  const priceMap: Record<string, number> = {
    "paddle tennis": 4000,
    "paddle": 4000,
    "football": 3000,
    "cricket": 3000,
  };

  try {
    // Get all sports from database
    const { data: sportsData, error: sportsError } = await supabase
      .from("sports")
      .select("id, name");

    if (sportsError) {
      throw new Error(`Error fetching sports: ${sportsError.message}`);
    }

    if (!sportsData || sportsData.length === 0) {
      console.log("⚠️  No sports found in database. Run migration script first.");
      console.log("   Run: npm run db:migrate or use scripts/migrate-to-supabase.ts\n");
      return;
    }

    console.log(`📋 Found ${sportsData.length} sports in database\n`);

    let updatedCount = 0;
    let errorCount = 0;

    // Update prices for each sport
    for (const sport of sportsData) {
      const sportName = sport.name;
      const sportNameLower = sportName.toLowerCase();
      
      // Find matching price (exact match or partial match)
      let targetPrice: number | null = priceMap[sportNameLower] || null;
      if (!targetPrice) {
        const matchingKey = Object.keys(priceMap).find(key => sportNameLower.includes(key));
        targetPrice = matchingKey ? priceMap[matchingKey] : null;
      }

      if (!targetPrice) {
        console.log(`⏭️  Skipping "${sportName}" (no price mapping found)`);
        continue;
      }

      console.log(`💰 Updating "${sportName}" courts to PKR ${targetPrice.toLocaleString()}/hour...`);

      // Get all courts for this sport
      const { data: courtsData, error: courtsError } = await supabase
        .from("courts")
        .select("id, name")
        .eq("sport_id", sport.id);

      if (courtsError) {
        console.error(`  ✗ Error fetching courts for "${sportName}":`, courtsError.message);
        errorCount++;
        continue;
      }

      if (!courtsData || courtsData.length === 0) {
        console.log(`  ⚠️  No courts found for "${sportName}"`);
        continue;
      }

      // Update each court's price
      for (const court of courtsData) {
        const { error: updateError } = await supabase
          .from("courts")
          .update({ price_per_hour: targetPrice })
          .eq("id", court.id);

        if (updateError) {
          console.error(`    ✗ Error updating "${court.name}":`, updateError.message);
          errorCount++;
        } else {
          console.log(`    ✓ Updated "${court.name}" to PKR ${targetPrice.toLocaleString()}/hour`);
          updatedCount++;
        }
      }
      console.log("");
    }

    console.log("✅ Price update complete!");
    console.log(`   - Updated: ${updatedCount} courts`);
    if (errorCount > 0) {
      console.log(`   - Errors: ${errorCount} courts`);
    }
    console.log("");

  } catch (error: any) {
    console.error("❌ Error updating prices:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the update
updatePrices()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

