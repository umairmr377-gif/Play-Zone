import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/bookings";

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/bookings/[bookingId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const booking = await getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { message: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

