/**
 * RESTORE FROM BACKUP - USE WITH EXTREME CAUTION
 * 
 * This script will OVERWRITE existing data in Supabase.
 * Only use this if you need to restore from a backup.
 * 
 * Usage:
 *   npx tsx scripts/restore-from-backup.ts <backup-file-prefix>
 * 
 * Example:
 *   npx tsx scripts/restore-from-backup.ts sports-2024-01-15T10-30-00
 * 
 * WARNING: This will DELETE all existing data in the target tables!
 */

import { promises as fs } from "fs";
import path from "path";
import { getServerClient } from "../lib/supabaseServer";
import readline from "readline";

const BACKUP_DIR = path.join(process.cwd(), "backups");

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function restoreTable(tableName: string, backupFile: string) {
  const client = getServerClient();
  console.log(`\nRestoring ${tableName} from ${backupFile}...`);

  // Read backup file
  const data = JSON.parse(await fs.readFile(backupFile, "utf-8"));

  if (!Array.isArray(data)) {
    throw new Error(`Invalid backup format for ${tableName}`);
  }

  // Clear existing data
  console.log(`  Clearing existing ${tableName}...`);
  const { error: deleteError } = await (client as any).from(tableName).delete().neq("id", 0);
  if (deleteError) {
    throw new Error(`Error clearing ${tableName}: ${deleteError.message}`);
  }

  // Restore data
  if (data.length === 0) {
    console.log(`  No data to restore for ${tableName}`);
    return { table: tableName, restored: 0 };
  }

  console.log(`  Restoring ${data.length} rows...`);
  const { error: insertError } = await (client as any).from(tableName).insert(data);

  if (insertError) {
    throw new Error(`Error restoring ${tableName}: ${insertError.message}`);
  }

  console.log(`  ✓ Restored ${data.length} rows to ${tableName}`);
  return { table: tableName, restored: data.length };
}

async function restore(backupPrefix: string) {
  console.log("⚠️  WARNING: This will OVERWRITE existing data!");
  console.log(`Backup prefix: ${backupPrefix}\n`);

  const confirm = await askQuestion("Type 'RESTORE' to confirm: ");

  if (confirm !== "RESTORE") {
    console.log("Restore cancelled.");
    process.exit(0);
  }

  console.log("\n🚀 Starting restore...\n");

  const tables = ["sports", "courts", "bookings", "profiles"];
  const results = [];

  for (const table of tables) {
    const backupFile = path.join(BACKUP_DIR, `${table}-${backupPrefix}.json`);

    try {
      await fs.access(backupFile);
      const result = await restoreTable(table, backupFile);
      results.push(result);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.log(`⚠️  Backup file not found for ${table}, skipping...`);
        results.push({ table, error: "File not found" });
      } else {
        console.error(`✗ Failed to restore ${table}:`, error);
        results.push({ table, error: String(error) });
      }
    }
  }

  console.log("\n✅ Restore complete!");
  console.log("\nResults:");
  results.forEach((r) => {
    if (r.error) {
      console.log(`  ${r.table}: ERROR - ${r.error}`);
    } else {
      console.log(`  ${r.table}: ${r.restored} rows restored`);
    }
  });
}

const backupPrefix = process.argv[2];

if (!backupPrefix) {
  console.error("Error: Backup prefix required");
  console.error("Usage: npx tsx scripts/restore-from-backup.ts <backup-prefix>");
  process.exit(1);
}

restore(backupPrefix).catch((error) => {
  console.error("❌ Restore failed:", error);
  process.exit(1);
});

