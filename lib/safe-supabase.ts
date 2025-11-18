/**
 * Safe Supabase client helpers
 * Returns null when Supabase is not configured, preventing null errors
 */

import { getPublicClient } from "./supabaseClient";
import { getServerClient, createServerComponentClient } from "./supabaseServer";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get public Supabase client or null (client-side safe)
 * Returns null if Supabase is not configured
 */
export function getSupabaseClientOrNull(): SupabaseClient | null {
  return getPublicClient();
}

/**
 * Get server Supabase client or null (server-side safe)
 * Returns null if Supabase is not configured
 */
export function getSupabaseServerClientOrNull(): SupabaseClient | null {
  return getServerClient();
}

/**
 * Create server component client or null (server-side safe)
 * Returns null if Supabase is not configured
 */
export async function createServerComponentClientOrNull() {
  return await createServerComponentClient();
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(
    url &&
    anonKey &&
    !url.includes("placeholder") &&
    !anonKey.includes("placeholder")
  );
}

