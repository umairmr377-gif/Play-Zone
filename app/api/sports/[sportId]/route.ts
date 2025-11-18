import { NextRequest, NextResponse } from "next/server";
import { getSportById } from "@/lib/sports";

// GET /api/sports/[sportId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sportId: string }> }
) {
  try {
    const { sportId } = await params;
    const sport = await getSportById(sportId);

    if (!sport) {
      return NextResponse.json(
        { message: "Sport not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(sport);
  } catch (error) {
    console.error("Error fetching sport:", error);
    return NextResponse.json(
      { message: "Failed to fetch sport" },
      { status: 500 }
    );
  }
}

