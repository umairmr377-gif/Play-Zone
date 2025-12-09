/**
 * Unified error handling for Supabase profile queries
 * Works in both Edge Runtime (middleware) and Node.js runtime
 * 
 * Rules:
 * - PGRST116 from SELECT = row missing (not table missing)
 * - PGRST116 from INSERT = table missing
 * - 42P01 = definite table missing
 * - Always use lowercase message checks
 * - Never access error.status directly (use type cast)
 */

export interface ProfileErrorResult {
  isTableMissing: boolean;
  isRowMissing: boolean;
  shouldSkipQuery: boolean;
}

/**
 * Analyze Supabase error to determine if table or row is missing
 * Edge Runtime compatible (no Node.js APIs)
 */
export function analyzeProfileError(
  error: any,
  isInsertOperation: boolean = false
): ProfileErrorResult {
  if (!error) {
    return {
      isTableMissing: false,
      isRowMissing: false,
      shouldSkipQuery: false,
    };
  }

  const errorCode = error.code;
  const errorMessage = String(error?.message || "").toLowerCase();
  const errorStatus = (error as any)?.status;

  // 42P01 = definite table missing (PostgreSQL error)
  if (errorCode === "42P01") {
    return {
      isTableMissing: true,
      isRowMissing: false,
      shouldSkipQuery: true,
    };
  }

  // PGRST116 = resource not found (could be table OR row)
  if (errorCode === "PGRST116") {
    if (isInsertOperation) {
      // INSERT failing with PGRST116 = table doesn't exist
      return {
        isTableMissing: true,
        isRowMissing: false,
        shouldSkipQuery: true,
      };
    }
    
    // For SELECT operations, check message to distinguish
    const mentionsTable = 
      errorMessage.includes("relation") ||
      errorMessage.includes("table") ||
      errorMessage.includes("schema cache");
    
    if (mentionsTable) {
      // Table missing
      return {
        isTableMissing: true,
        isRowMissing: false,
        shouldSkipQuery: true,
      };
    } else {
      // Row missing (normal case - user has no profile)
      return {
        isTableMissing: false,
        isRowMissing: true,
        shouldSkipQuery: false,
      };
    }
  }

  // Check error message for table-missing indicators (case-insensitive)
  const hasTableMissingIndicators =
    errorStatus === 404 ||
    (errorMessage.includes("does not exist") && (
      errorMessage.includes("relation") ||
      errorMessage.includes("table")
    )) ||
    errorMessage.includes("schema cache");

  if (hasTableMissingIndicators) {
    return {
      isTableMissing: true,
      isRowMissing: false,
      shouldSkipQuery: true,
    };
  }

  // Unknown error - assume row missing (safer fallback)
  return {
    isTableMissing: false,
    isRowMissing: false,
    shouldSkipQuery: false,
  };
}

/**
 * Get default user profile when table/row is missing
 * Edge Runtime compatible
 */
export function getDefaultProfile(): { role: "user" | "admin" } {
  return { role: "user" };
}

