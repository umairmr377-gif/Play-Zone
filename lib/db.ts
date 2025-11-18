import { getServerClient } from "./supabaseServer";
import type { Database } from "./supabaseClient";

type Tables = Database["public"]["Tables"];
type TableName = keyof Tables;

/**
 * Database helper functions using Supabase server client
 * These functions should only be used server-side
 */

/**
 * Generic function to get all rows from a table
 * Returns empty array if Supabase is not configured
 */
export async function getAllRows<T extends TableName>(table: T) {
  const client = getServerClient();
  if (!client) {
    return [] as Tables[T]["Row"][];
  }
  const { data, error } = await (client as any).from(table).select("*");

  if (error) {
    throw new Error(`Error fetching ${table}: ${error.message}`);
  }

  return data as Tables[T]["Row"][];
}

/**
 * Generic function to get a row by ID
 * Returns null if Supabase is not configured
 */
export async function getRowById<T extends TableName>(
  table: T,
  id: number
) {
  const client = getServerClient();
  if (!client) {
    return null;
  }
  const { data, error } = await (client as any).from(table).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Error fetching ${table} by id: ${error.message}`);
  }

  return data as Tables[T]["Row"] | null;
}

/**
 * Generic function to insert a row
 * Throws error if Supabase is not configured
 */
export async function insertRow<T extends TableName>(
  table: T,
  row: Tables[T]["Insert"]
) {
  const client = getServerClient();
  if (!client) {
    throw new Error("Supabase is not configured. Cannot insert row.");
  }
  const { data, error } = await (client as any).from(table).insert(row).select().single();

  if (error) {
    throw new Error(`Error inserting into ${table}: ${error.message}`);
  }

  return data as Tables[T]["Row"];
}

/**
 * Generic function to update a row
 * Throws error if Supabase is not configured
 */
export async function updateRow<T extends TableName>(
  table: T,
  id: number,
  updates: Tables[T]["Update"]
) {
  const client = getServerClient();
  if (!client) {
    throw new Error("Supabase is not configured. Cannot update row.");
  }
  const { data, error } = await (client as any)
    .from(table)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating ${table}: ${error.message}`);
  }

  return data as Tables[T]["Row"];
}

/**
 * Generic function to delete a row
 * Throws error if Supabase is not configured
 */
export async function deleteRow<T extends TableName>(table: T, id: number) {
  const client = getServerClient();
  if (!client) {
    throw new Error("Supabase is not configured. Cannot delete row.");
  }
  const { error } = await (client as any).from(table).delete().eq("id", id);

  if (error) {
    throw new Error(`Error deleting from ${table}: ${error.message}`);
  }
}

/**
 * Check if a unique constraint violation occurred
 */
export function isUniqueConstraintError(error: any): boolean {
  return (
    error?.code === "23505" ||
    error?.message?.includes("duplicate key") ||
    error?.message?.includes("unique constraint")
  );
}

