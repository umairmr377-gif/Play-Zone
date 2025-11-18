import { NextRequest, NextResponse } from "next/server";
import { createBooking, getBookedSlots } from "@/lib/bookings";
import { bookingRateLimiter } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { requireUser } from "@/lib/auth";

// GET /api/bookings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courtId = searchParams.get("courtId");
    const date = searchParams.get("date");

    // If filtering by court and date, return booked slots
    if (courtId && date) {
      const bookedSlots = await getBookedSlots(courtId, date);
      return NextResponse.json({ bookedSlots });
    }

    // Otherwise return empty (bookings are fetched via admin API or client-side)
    return NextResponse.json({ bookings: [] });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = bookingRateLimiter.check(request);
    if (!rateLimit.allowed) {
      logger.warn("Rate limit exceeded for booking creation", {
        ip: request.headers.get("x-forwarded-for") || "unknown",
        retryAfter: rateLimit.retryAfter,
      });
      return NextResponse.json(
        {
          message: "Too many booking attempts. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter || 60),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.resetTime),
          },
        }
      );
    }

    // Require authentication (optional - uncomment if bookings require auth)
    // const user = await requireUser();

    const body = await request.json();
    
    // Support both old format (timeSlot, price, userName) and new format (timeSlots, totalPrice, customerName, customerEmail)
    const {
      sportId,
      courtId,
      date,
      timeSlot, // Old format: single slot
      timeSlots, // New format: array of slots
      price, // Old format: price per slot
      totalPrice, // New format: total price for all slots
      userName, // Old format
      customerName, // New format
      customerEmail, // New format
    } = body;

    // Determine which format is being used
    const slots = timeSlots || (timeSlot ? [timeSlot] : []);
    const name = customerName || userName || "";
    const total = totalPrice || price || 0;
    const pricePerSlot = slots.length > 0 ? total / slots.length : 0;

    // Validation
    if (!sportId || !courtId || !date || slots.length === 0 || total <= 0) {
      return NextResponse.json(
        { message: "Missing required fields: sportId, courtId, date, timeSlots, and totalPrice are required" },
        { status: 400 }
      );
    }

    if (customerName && (!customerEmail || customerEmail.trim() === "")) {
      return NextResponse.json(
        { message: "Customer email is required when customer name is provided" },
        { status: 400 }
      );
    }

    // Create a booking for each time slot
    const bookings = [];
    const errors = [];

    for (const slot of slots) {
      try {
        const booking = await createBooking({
          sportId,
          courtId,
          timeSlot: slot,
          date,
          price: pricePerSlot,
          userName: name,
        });
        bookings.push(booking);
      } catch (error: any) {
        // If one slot fails, collect the error but continue with others
        errors.push(`${slot}: ${error.message}`);
      }
    }

    // If all bookings failed, return error
    if (bookings.length === 0) {
      return NextResponse.json(
        { 
          message: errors.length > 0 
            ? `Failed to create bookings: ${errors.join("; ")}` 
            : "Failed to create bookings" 
        },
        { status: 400 }
      );
    }

    // If some bookings failed, log warnings but return success for the ones that succeeded
    if (errors.length > 0) {
      logger.warn("Some bookings failed", {
        sportId,
        courtId,
        date,
        errors,
        successful: bookings.length,
      });
    }

    // Return a combined booking object (using the first booking's ID)
    const firstBooking = bookings[0];
    const combinedBooking = {
      id: firstBooking.id,
      sportId: firstBooking.sportId,
      courtId: firstBooking.courtId,
      date: firstBooking.date,
      timeSlots: bookings.map((b) => b.timeSlots[0]),
      customerName: name,
      customerEmail: customerEmail || "",
      totalPrice: total,
      createdAt: firstBooking.createdAt,
      status: firstBooking.status || "confirmed",
    };

    // Log successful booking
    logger.bookingCreated(combinedBooking.id, name || "anonymous", {
      sportId,
      courtId,
      date,
      timeSlots: combinedBooking.timeSlots,
      totalPrice: total,
    });

    return NextResponse.json(combinedBooking, {
      status: 201,
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetTime),
      },
    });
  } catch (error: any) {
    logger.bookingFailed(null, "anonymous", error, {
      error: error.message || "Unknown error",
    });

    // Handle duplicate booking error
    if (error.message.includes("already booked")) {
      return NextResponse.json(
        { message: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
