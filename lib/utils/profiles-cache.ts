/**
 * Utility to cache whether the profiles table exists
 * Prevents repeated 404 errors in console
 */

const CACHE_KEY = "supabase_profiles_table_exists";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  const cached = getProfilesTableExistsCache();
  return cached === false; // Skip if we know table doesn't exist
}
