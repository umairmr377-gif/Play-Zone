/**
 * Safe Supabase client helpers (server-safe)
 * Returns null when Supabase is not configured, preventing null errors
 * This file can be safely imported in both server and client components
 * For client-side Supabase client, use lib/supabase-client-helper.ts instead
 */

import { getServerClient, createServerComponentClient } from "./supabaseServer";
import { SupabaseClient } from "@supabase/supabase-js";

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

