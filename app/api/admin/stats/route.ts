import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin";

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/admin/stats
export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

