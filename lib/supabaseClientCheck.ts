/**
 * Client-side helper to check if Supabase is configured
 * This is safe to use in client components
 */

export function isSupabaseConfigured(): boolean {
  if (typeof window === "undefined") {
    // Server-side: check env vars
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return !!(
      url &&
      anonKey &&
      !url.includes("placeholder") &&
      !anonKey.includes("placeholder")
    );
  }
  
  // Client-side: env vars are available via NEXT_PUBLIC_ prefix
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(
    url &&
    anonKey &&
    !url.includes("placeholder") &&
    !anonKey.includes("placeholder")
  );
}

