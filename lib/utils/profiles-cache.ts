/**
 * Utility to cache whether the profiles table exists
 * Prevents repeated 404 errors in console
 */

const CACHE_KEY = "supabase_profiles_table_exists";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (longer cache to prevent repeated queries)

// Session-level flag to prevent queries in the same session after first 404
let sessionTableMissing: boolean | null = null;

// Track in-flight requests to prevent duplicate simultaneous requests
let inFlightRequest: Promise<any> | null = null;

interface CacheEntry {
  exists: boolean;
  timestamp: number;
}

/**
 * Check if profiles table exists (from cache)
 */
export function getProfilesTableExistsCache(): boolean | null {
  if (typeof window === "undefined") {
    return null; // Server-side - no cache
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null; // No cache entry
    }

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null; // Cache expired
    }

    return entry.exists;
  } catch {
    return null;
  }
}

/**
 * Cache that profiles table exists
 */
export function setProfilesTableExists(exists: boolean): void {
  if (typeof window === "undefined") {
    return; // Server-side - no cache
  }

  try {
    const entry: CacheEntry = {
      exists,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear the profiles table cache
 */
export function clearProfilesTableCache(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Check if we should skip querying profiles table
 * Returns true if we should skip (table doesn't exist)
 */
export function shouldSkipProfilesQuery(): boolean {
  if (typeof window === "undefined") {
    return false; // Server-side - don't skip
  }

  // Check session-level flag first (fastest check)
  if (sessionTableMissing === true) {
    return true;
  }
  
  // Check localStorage cache
  const cached = getProfilesTableExistsCache();
  if (cached === false) {
    sessionTableMissing = true; // Update session flag
    return true;
  }
  
  return false;
}

/**
 * Set session-level flag that table doesn't exist
 * This prevents queries within the same session
 */
export function setSessionTableMissing(missing: boolean): void {
  sessionTableMissing = missing;
  // Also update localStorage immediately for persistence
  if (missing && typeof window !== "undefined") {
    try {
      const entry: CacheEntry = {
        exists: false,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Ignore localStorage errors
    }
  }
}

/* -----------------------------------------------------
   SERVER-SIDE CACHE (In-Memory)
----------------------------------------------------- */
// Server-side in-memory cache (persists for Node.js process lifetime)
let serverCache: boolean | null = null;

/**
 * Check if profiles table exists (server-side cache)
 * Returns null if unknown, true if exists, false if doesn't exist
 */
export function getServerProfilesTableCache(): boolean | null {
  return serverCache;
}

/**
 * Set server-side cache for profiles table existence
 */
export function setServerProfilesTableCache(exists: boolean): void {
  serverCache = exists;
}

/**
 * Check if we should skip querying profiles table (server-side)
 * Returns true if we should skip (table doesn't exist)
 */
export function shouldSkipProfilesQueryServer(): boolean {
  return serverCache === false;
}
