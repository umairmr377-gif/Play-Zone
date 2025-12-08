import { NextRequest, NextResponse } from "next/server";
import { getAllBookings, updateBookingStatus } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { logAdminMutation } from "@/lib/audit";
import { logger } from "@/lib/logger";

// Force dynamic rendering for routes using cookies/sessions
export const dynamic = "force-dynamic";

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/admin/bookings
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const filters: any = {};

    const sportId = searchParams.get("sportId");
    const courtId = searchParams.get("courtId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    if (sportId) filters.sportId = sportId;
    if (courtId) filters.courtId = courtId;
    if (date) filters.date = date;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const bookings = await getAllBookings(filters);
    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/bookings
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { bookingId, status } = body;
    if (!bookingId || !status) {
      return NextResponse.json(
        { message: "Booking ID and status required" },
        { status: 400 }
      );
    }
    const booking = await updateBookingStatus(bookingId, status);
    
    // Log audit event
    await logAdminMutation("update", "booking", bookingId, { status }, request);
    logger.adminMutation("update", admin.id, "booking", bookingId, { status });
    
    return NextResponse.json(booking);
  } catch (error: any) {
    logger.error("Error updating booking", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to update booking" },
      { status: 400 }
    );
  }
}

