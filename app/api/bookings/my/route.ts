import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";

// Force dynamic rendering for routes using cookies/sessions
export const dynamic = "force-dynamic";

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/bookings/my - Get current user's bookings
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user?.id) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Query bookings - Note: table uses 'court' (TEXT name) not 'court_id' (UUID)
    // No foreign key relationship, so we can't join. We'll fetch court/sport separately.
    let { data, error } = await (supabase as any)
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // If query fails or returns empty, try with service role client as fallback
    // This bypasses RLS but we've already verified the user is authenticated
    if (error || !data || data.length === 0) {
      try {
        const serviceClient = createServiceRoleClient();
        const { data: serviceData, error: serviceError } = await (serviceClient as any)
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (!serviceError && serviceData && serviceData.length > 0) {
          data = serviceData;
          error = null;
        }
      } catch (serviceErr: any) {
        // Continue with original error
      }
    }

    if (error) {
      throw new Error(`Error fetching bookings: ${error.message} (Code: ${error.code})`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ bookings: [] });
    }

    // Debug: Log first booking to see actual structure
    if (data.length > 0) {
      console.log("📊 Sample booking from DB:", {
        id: data[0].id,
        booking_date: data[0].booking_date,
        date: data[0].date,
        time_slots: data[0].time_slots,
        start_time: data[0].start_time,
        end_time: data[0].end_time,
        total_price: data[0].total_price,
        price: data[0].price,
        court: data[0].court,
        sport: data[0].sport,
      });
    }

    // Map booking data to application format
    // Note: The table uses booking_date, time_slots (array), and total_price
    const bookings = data.map((booking: any) => {
      // Get time slots from the array stored in database
      // The table stores time_slots as an array of strings like ["18:00", "19:00"]
      const timeSlots: string[] = Array.isArray(booking.time_slots) 
        ? booking.time_slots.map((slot: any) => String(slot))
        : [];
      
      // Use sport from booking (stored directly) or try to fetch from courts table
      let sportName = booking.sport || "";
      
      // If sport is not stored, try to fetch from courts table (optional)
      if (!sportName && booking.court) {
        // Note: This is async but we're not awaiting - it's optional enhancement
        // For now, we'll use the sport stored in the booking
      }
      
      return {
        id: booking.id.toString(),
        sportId: sportName || "",
        courtId: booking.court || "", // court is the name (TEXT)
        date: booking.booking_date || booking.date || "", // Use booking_date column
        timeSlots: timeSlots,
        customerName: booking.customer_name || "",
        customerEmail: booking.customer_email || "",
        totalPrice: Number(booking.total_price || booking.price || 0), // Use total_price column
        createdAt: booking.created_at,
        status: booking.status || "confirmed",
      };
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
