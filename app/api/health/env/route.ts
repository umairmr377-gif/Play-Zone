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

    // Build appropriate message based on status
    let message: string;
    if (envCheck.configured) {
      message = "All required environment variables are configured";
    } else if (envCheck.missing.length > 0) {
      message = `Missing required variables: ${envCheck.missing.join(", ")}`;
      if (envCheck.warnings.length > 0) {
        message += `. Warnings: ${envCheck.warnings.join("; ")}`;
      }
    } else if (envCheck.warnings.length > 0) {
      message = `Configuration warnings: ${envCheck.warnings.join("; ")}`;
    } else {
      message = "Unable to determine configuration status";
    }

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
      message,
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

