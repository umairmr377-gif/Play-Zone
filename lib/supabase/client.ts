"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../supabaseClient";

/**
 * Create Supabase client for client components
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

