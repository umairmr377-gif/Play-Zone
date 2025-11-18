/**
 * Backup Supabase database to JSON files
 * 
 * Usage:
 *   npx tsx scripts/backup-supabase.ts
 * 
 * Requires:
 *   - SUPABASE_SERVICE_ROLE_KEY in environment
 *   - NEXT_PUBLIC_SUPABASE_URL in environment
 */

import { promises as fs } from "fs";
import path from "path";
import { getServerClient } from "../lib/supabaseServer";

const BACKUP_DIR = path.join(process.cwd(), "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

async function backupTable(tableName: string) {
  const client = getServerClient();
  if (!client) {
    throw new Error("Supabase is not configured. Cannot backup.");
  }
  console.log(`Backing up ${tableName}...`);

  const { data, error } = await (client as any).from(tableName).select("*");

  if (error) {
    throw new Error(`Error backing up ${tableName}: ${error.message}`);
  }

  const backupFile = path.join(BACKUP_DIR, `${tableName}-${timestamp}.json`);
  await fs.writeFile(backupFile, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✓ Backed up ${data?.length || 0} rows from ${tableName} to ${backupFile}`);
  return { table: tableName, count: data?.length || 0, file: backupFile };
}

async function backup() {
  console.log("🚀 Starting Supabase backup...\n");

  // Create backup directory
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const tables = ["sports", "courts", "bookings", "profiles"];

  const results = [];
  for (const table of tables) {
    try {
      const result = await backupTable(table);
      results.push(result);
    } catch (error) {
      console.error(`✗ Failed to backup ${table}:`, error);
      results.push({ table, error: String(error) });
    }
  }

  // Create summary
  const summary = {
    timestamp: new Date().toISOString(),
    tables: results,
  };

  const summaryFile = path.join(BACKUP_DIR, `backup-summary-${timestamp}.json`);
  await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2), "utf-8");

  console.log("\n✅ Backup complete!");
  console.log(`Summary saved to: ${summaryFile}`);
  console.log(`\nTotal tables backed up: ${results.filter((r: any) => !r.error).length}`);
}

backup().catch((error) => {
  console.error("❌ Backup failed:", error);
  process.exit(1);
});

