import { NextResponse } from "next/server";
import { checkSupabaseEnv } from "@/lib/utils/env-check";

// Force Node.js runtime for process.env compatibility
export const runtime = 'nodejs';

/**
 * Environment variables health check endpoint
 * GET /api/health/env
 * 
 * Returns the status of environment variables without exposing sensitive values
 */
export async function GET() {
  try {
    const envCheck = checkSupabaseEnv();

    return NextResponse.json({
      status: envCheck.configured ? "ok" : "error",
      configured: envCheck.configured,
      missing: envCheck.missing,
      warnings: envCheck.warnings,
      details: {
        url: envCheck.details.url ? "configured" : null,
        anonKey: envCheck.details.anonKey ? "configured" : null,
        serviceRoleKey: envCheck.details.serviceRoleKey ? "configured" : null,
      },
      message: envCheck.configured
        ? "All required environment variables are configured"
        : `Missing: ${envCheck.missing.join(", ")}`,
      timestamp: new Date().toISOString(),
    }, {
      status: envCheck.configured ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

