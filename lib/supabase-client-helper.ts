/**
 * Client-side Supabase helper
 * This file should ONLY be imported in client components
 * DO NOT import this in server components or API routes
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./supabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get public Supabase client for client-side use
 * Uses public anon key - safe for client-side reads
 * Returns null if environment variables are not configured
 */
export function getPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables are present and not placeholders
  if (!url || !anonKey) {
    console.warn("⚠️ Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return null;
  }

  if (url.includes("placeholder") || anonKey.includes("placeholder") || 
      url.includes("your-project") || anonKey.includes("your-anon")) {
    console.warn("⚠️ Supabase env vars contain placeholder values");
    return null;
  }

  // Use createBrowserClient for proper SSR/cookie handling in Next.js
  return createBrowserClient<Database>(url, anonKey);
}

/**
 * Get public Supabase client or null (client-side safe)
 * Returns null if Supabase is not configured
 */
export function getSupabaseClientOrNull(): SupabaseClient | null {
  return getPublicClient();
}

