/**
 * Environment Variables Verification Utility
 * Use this to check if environment variables are properly configured
 */

export interface EnvCheckResult {
  configured: boolean;
  missing: string[];
  warnings: string[];
  details: {
    url: string | null;
    anonKey: string | null;
    serviceRoleKey: string | null;
  };
}

/**
 * Check if Supabase environment variables are configured
 * Returns detailed information about configuration status
 */
export function checkSupabaseEnv(): EnvCheckResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  if (!url) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!anonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  // Check for placeholder values
  if (url && (url.includes("placeholder") || url.includes("your-project"))) {
    warnings.push("NEXT_PUBLIC_SUPABASE_URL contains placeholder value");
  }
  if (anonKey && (anonKey.includes("placeholder") || anonKey.includes("your-anon"))) {
    warnings.push("NEXT_PUBLIC_SUPABASE_ANON_KEY contains placeholder value");
  }

  // Check URL format
  if (url && !url.startsWith("https://") && !url.startsWith("http://")) {
    warnings.push("NEXT_PUBLIC_SUPABASE_URL should start with https://");
  }
  if (url && !url.includes(".supabase.co")) {
    warnings.push("NEXT_PUBLIC_SUPABASE_URL doesn't appear to be a valid Supabase URL");
  }

  // Check key format (JWT tokens start with eyJ)
  if (anonKey && !anonKey.startsWith("eyJ")) {
    warnings.push("NEXT_PUBLIC_SUPABASE_ANON_KEY doesn't appear to be a valid JWT token");
  }

  const configured = missing.length === 0 && warnings.length === 0;

  return {
    configured,
    missing,
    warnings,
    details: {
      url: url || null,
      anonKey: anonKey ? `${anonKey.substring(0, 20)}...` : null, // Show first 20 chars only
      serviceRoleKey: serviceRoleKey ? "***configured***" : null, // Don't expose service role key
    },
  };
}

/**
 * Get environment-specific message
 */
export function getEnvMessage(): string {
  const check = checkSupabaseEnv();

  if (check.configured) {
    return "✅ Supabase environment variables are properly configured";
  }

  if (check.missing.length > 0) {
    return `❌ Missing environment variables: ${check.missing.join(", ")}`;
  }

  if (check.warnings.length > 0) {
    return `⚠️ Configuration warnings: ${check.warnings.join("; ")}`;
  }

  return "❓ Unable to determine configuration status";
}

