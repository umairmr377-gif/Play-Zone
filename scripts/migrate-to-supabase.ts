/**
 * Migration script to import data from JSON/TS files to Supabase
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-supabase.ts
 * 
 * Or with ts-node:
 *   ts-node scripts/migrate-to-supabase.ts
 */

import { promises as fs } from "fs";
import path from "path";
import { getServerClient } from "../lib/supabaseServer";
import { Sport } from "../data/types";

const SPORTS_FILE = path.join(process.cwd(), "data", "sports.ts");
const SPORTS_JSON_FILE = path.join(process.cwd(), "data", "sports.json");
const BOOKINGS_FILE = path.join(process.cwd(), "data", "bookings.json");

interface OldCourt {
  id: string;
  name: string;
  pricePerHour: number;
  location: string;
  image?: string;
  availableTimeSlots: string[];
}

interface OldSport {
  id: string;
  name: string;
  description: string;
  image: string;
  courts: OldCourt[];
}

interface OldBooking {
  id: string;
  sportId: string;
  courtId: string;
  date: string;
  timeSlots: string[];
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  createdAt: string;
}

/**
 * Read sports from TS or JSON file
 */
async function readSports(): Promise<OldSport[]> {
  try {
    // Try JSON first
    const jsonData = await fs.readFile(SPORTS_JSON_FILE, "utf-8");
    return JSON.parse(jsonData);
  } catch {
    // Fallback to TS file
    try {
      const { sports } = await import(SPORTS_FILE);
      return sports;
    } catch (error) {
      console.error("Error reading sports file:", error);
      throw new Error("Could not read sports data");
    }
  }
}

/**
 * Read bookings from JSON file
 */
async function readBookings(): Promise<OldBooking[]> {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return []; // File doesn't exist, return empty array
    }
    throw error;
  }
}

/**
 * Create backup files
 */
async function createBackups() {
  const backupDir = path.join(process.cwd(), "data", "backups");
  await fs.mkdir(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  try {
    const sportsData = await fs.readFile(SPORTS_JSON_FILE, "utf-8");
    await fs.writeFile(
      path.join(backupDir, `sports-${timestamp}.json`),
      sportsData
    );
    console.log("✓ Created sports backup");
  } catch {
    // No sports.json, skip
  }

  try {
    const bookingsData = await fs.readFile(BOOKINGS_FILE, "utf-8");
    await fs.writeFile(
      path.join(backupDir, `bookings-${timestamp}.json`),
      bookingsData
    );
    console.log("✓ Created bookings backup");
  } catch {
    // No bookings.json, skip
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log("🚀 Starting migration to Supabase...\n");

  // Create backups
  console.log("📦 Creating backups...");
  await createBackups();
  console.log("");

  // Initialize Supabase client
  const supabase = getServerClient();

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🗑️  Clearing existing data...");
  await supabase.from("bookings").delete().neq("id", 0); // Delete all
  await supabase.from("courts").delete().neq("id", 0);
  await supabase.from("sports").delete().neq("id", 0);
  console.log("✓ Cleared existing data\n");

  // Read source data
  console.log("📖 Reading source data...");
  const sports = await readSports();
  const bookings = await readBookings();
  console.log(`✓ Found ${sports.length} sports and ${bookings.length} bookings\n`);

  // Mapping from old IDs to new DB IDs
  const sportIdMap: Record<string, number> = {};
  const courtIdMap: Record<string, number> = {};

  // Migrate sports
  console.log("🏃 Migrating sports...");
  for (const sport of sports) {
    const { data, error } = await supabase
      .from("sports")
      .insert({
        name: sport.name,
        description: sport.description,
        image: sport.image,
      })
      .select()
      .single();

    if (error) {
      console.error(`✗ Error migrating sport ${sport.name}:`, error.message);
      continue;
    }

    sportIdMap[sport.id] = data.id;
    console.log(`  ✓ Migrated sport: ${sport.name} (ID: ${data.id})`);

    // Migrate courts for this sport
    for (const court of sport.courts) {
      const { data: courtData, error: courtError } = await supabase
        .from("courts")
        .insert({
          sport_id: data.id,
          name: court.name,
          price_per_hour: court.pricePerHour,
          location: court.location,
          extra_info: {
            image: court.image,
            availableTimeSlots: court.availableTimeSlots,
          },
        })
        .select()
        .single();

      if (courtError) {
        console.error(`    ✗ Error migrating court ${court.name}:`, courtError.message);
        continue;
      }

      courtIdMap[court.id] = courtData.id;
      console.log(`    ✓ Migrated court: ${court.name} (ID: ${courtData.id})`);
    }
  }
  console.log("");

  // Migrate bookings
  console.log("📅 Migrating bookings...");
  let successCount = 0;
  let errorCount = 0;

  for (const booking of bookings) {
    const newSportId = sportIdMap[booking.sportId];
    const newCourtId = courtIdMap[booking.courtId];

    if (!newSportId || !newCourtId) {
      console.warn(
        `  ⚠ Skipping booking ${booking.id}: sport or court not found in mapping`
      );
      errorCount++;
      continue;
    }

    // Insert each time slot as a separate booking (or combine if needed)
    for (const timeSlot of booking.timeSlots) {
      const { error } = await supabase.from("bookings").insert({
        sport_id: newSportId,
        court_id: newCourtId,
        date: booking.date,
        time_slot: timeSlot,
        price: booking.totalPrice / booking.timeSlots.length, // Divide price if multiple slots
        user_name: booking.customerName || null,
        status: "confirmed",
        created_at: booking.createdAt,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - slot already exists
          console.warn(
            `  ⚠ Skipping duplicate booking: ${booking.date} ${timeSlot}`
          );
        } else {
          console.error(`  ✗ Error migrating booking ${booking.id}:`, error.message);
          errorCount++;
        }
      } else {
        successCount++;
      }
    }
  }

  console.log(`✓ Migrated ${successCount} booking slots`);
  if (errorCount > 0) {
    console.log(`⚠ ${errorCount} bookings had errors\n`);
  }
  console.log("");

  // Summary
  console.log("✅ Migration complete!");
  console.log(`   - Sports: ${sports.length}`);
  console.log(`   - Courts: ${Object.keys(courtIdMap).length}`);
  console.log(`   - Bookings: ${successCount} slots migrated`);
  console.log("\n💾 Backups saved to data/backups/");
}

// Run migration
migrate().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

