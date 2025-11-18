import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./supabaseClient";

/**
 * Create Supabase client for server-side operations
 * Uses service role key for admin operations (bypasses RLS)
 * 
 * WARNING: Only use this for admin operations after verifying user role
 * Never expose service role key to client
 * 
 * Returns null if Supabase is not configured (safe fallback)
 */
export function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if we have valid (non-placeholder) values
  if (!url || !serviceRoleKey || url.includes("placeholder") || serviceRoleKey.includes("placeholder")) {
    return null;
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create Supabase client for server components with user session
 * Reads cookies to get user session
 * 
 * Returns null if Supabase is not configured (safe fallback)
 */
export async function createServerComponentClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if we have valid (non-placeholder) values
  if (!url || !anonKey || url.includes("placeholder") || anonKey.includes("placeholder")) {
    return null;
  }

  const cookieStore = await cookies();
  
  return createSSRClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  } as any);
}
