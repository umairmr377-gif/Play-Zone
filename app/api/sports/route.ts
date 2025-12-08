import { NextResponse } from "next/server";
import { getAllSports } from "@/lib/sports";

// Force dynamic rendering for routes using cookies/sessions
export const dynamic = "force-dynamic";

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/sports
export async function GET() {
  try {
    const sports = await getAllSports();
    return NextResponse.json({ sports });
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json(
      { message: "Failed to fetch sports" },
      { status: 500 }
    );
  }
}

