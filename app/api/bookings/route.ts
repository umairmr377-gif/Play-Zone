import { NextRequest, NextResponse } from "next/server";
import { createBooking, getBookedSlots } from "@/lib/bookings";
import { bookingRateLimiter } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { createRouteHandlerClient } from "@/lib/supabase/server";

// GET /api/bookings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courtId = searchParams.get("courtId");
    const courtName = searchParams.get("courtName");
    const date = searchParams.get("date");

    // If filtering by court and date, return booked slots
    if ((courtId || courtName) && date) {
      const bookedSlots = await getBookedSlots(courtId || courtName || "", date, courtName || undefined);
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

    // Get authenticated user from Supabase
    let userId: string | undefined;
    try {
      const supabase = await createRouteHandlerClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!authError && user?.id) {
        userId = user.id;
        console.log("✅ Found authenticated user_id:", userId);
      } else {
        console.log("⚠️ No authenticated user found for booking");
      }
    } catch (error) {
      // Not authenticated - booking will be created without user_id
      console.warn("Could not get authenticated user for booking:", error);
    }

    const body = await request.json();
    
    // Support both old format and new format
    const {
      sportId,
      sportName,
      courtId,
      courtName,
      date,
      timeSlot, // Old format: single slot
      timeSlots, // New format: array of slots
      price, // Old format: price per slot
      pricePerHour,
      totalPrice,
      userName, // Old format
      customerName, // New format
      customerEmail, // New format
    } = body;

    // Determine which format is being used
    const slots = timeSlots || (timeSlot ? [timeSlot] : []);
    const sport = sportName || ""; // Sport name (text)
    const court = courtName || courtId || ""; // Court name (text)
    const pricePerHourValue = pricePerHour || price || 0;
    const total = totalPrice || (slots.length > 0 ? pricePerHourValue * slots.length : 0);

    // Validation
    if (!sport || !court || !date || slots.length === 0 || total <= 0) {
      return NextResponse.json(
        { message: "Missing required fields: sportName, courtName, date, timeSlots, and totalPrice are required" },
        { status: 400 }
      );
    }

    // Create a single booking with all time slots
    try {
      const booking = await createBooking({
        sportName: sport,
        courtName: court,
        date,
        timeSlots: slots,
        pricePerHour: pricePerHourValue,
        totalPrice: total,
        userId: userId || undefined, // Ensure it's undefined if null
      });

      // Log successful booking
      logger.bookingCreated(booking.id, customerName || userName || "anonymous", {
        sportName: sport,
        courtName: court,
        date,
        timeSlots: slots,
        totalPrice: total,
      });

      return NextResponse.json(booking, {
        status: 201,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetTime),
        },
      });
    } catch (error: any) {
      logger.bookingFailed(null, customerName || userName || "anonymous", error, {
        error: error.message || "Unknown error",
      });

      // Handle duplicate booking error
      if (error.message.includes("already booked") || error.message.includes("conflicts")) {
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
  } catch (error: any) {
    logger.bookingFailed(null, "anonymous", error, {
      error: error.message || "Unknown error",
    });

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}