import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabaseServer";

/**
 * Database health check endpoint
 * GET /api/health/db
 */
export async function GET() {
  try {
    const supabase = await createServerComponentClient();
    
    // If Supabase is not configured, return disconnected status
    if (!supabase) {
      return NextResponse.json({
        status: "ok",
        database: "not_configured",
        message: "Supabase is not configured",
        timestamp: new Date().toISOString(),
      });
    }
    
    // Simple query to test database connection
    const startTime = Date.now();
    const { data, error } = await supabase
      .from("sports")
      .select("id")
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
