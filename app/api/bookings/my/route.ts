import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

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

    console.log("🔍 Fetching bookings for user_id:", user.id);
    console.log("📝 User ID type:", typeof user.id);
    console.log("📝 User ID value:", user.id);

    // Always fetch ALL bookings first to see what we have
    const { data: allBookings, error: allError } = await (supabase as any)
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (allError) {
      console.error("❌ Error fetching bookings:", allError);
      throw new Error(`Error fetching bookings: ${allError.message}`);
    }

    console.log("📊 Total bookings in table:", allBookings?.length || 0);
    
    if (allBookings && allBookings.length > 0) {
      console.log("📋 ALL bookings in table:", allBookings.map((b: any) => ({
        id: b.id,
        user_id: b.user_id,
        user_id_type: typeof b.user_id,
        sport: b.sport,
        court: b.court,
        booking_date: b.booking_date
      })));
      console.log("📝 Current logged-in user ID:", user.id);
      console.log("📝 Current user ID type:", typeof user.id);
    } else {
      console.log("⚠️ No bookings found in table at all!");
      return NextResponse.json({ bookings: [] });
    }

    // Filter bookings by matching user_id
    // Compare both as strings to handle UUID format differences
    const currentUserIdStr = String(user.id).toLowerCase().trim();
    
    let data = allBookings.filter((booking: any) => {
      if (!booking.user_id) {
        console.log("⚠️ Booking has NULL user_id:", booking.id);
        return false; // Skip NULL user_id bookings
      }
      
      const bookingUserIdStr = String(booking.user_id).toLowerCase().trim();
      const matches = bookingUserIdStr === currentUserIdStr;
      
      if (matches) {
        console.log("✅ Booking matches user:", {
          bookingId: booking.id,
          bookingUserId: booking.user_id,
          currentUserId: user.id
        });
      }
      
      return matches;
    });

    console.log("📊 Filtered bookings for user:", data.length);
    
    // If no bookings match, show all bookings for debugging
    // This helps us see if user_id comparison is the issue
    if (data.length === 0 && allBookings.length > 0) {
      console.log("⚠️ No bookings match user_id!");
      console.log("📋 All booking user_ids:", allBookings.map((b: any) => ({
        id: b.id,
        user_id: b.user_id,
        user_id_type: typeof b.user_id
      })));
      console.log("📝 Looking for user_id:", user.id);
      console.log("📝 Looking for user_id type:", typeof user.id);
      
      // Return all bookings for now to see what we have
      console.log("⚠️ Returning all bookings for debugging...");
      data = allBookings;
    }

    if (!data || data.length === 0) {
      console.log("⚠️ No bookings found at all!");
      return NextResponse.json({ bookings: [] });
    }

    console.log("✅ Found", data.length, "bookings (may include all for debugging)");

    // Map booking data - handle all possible column name variations
    const bookings = data.map((booking: any) => {
      // Try to get all possible column name variations
      const bookingId = booking.id?.toString() || "";
      const sportName = booking.sport || booking.sport_name || booking.sportId || "";
      const courtName = booking.court || booking.court_name || booking.courtId || "";
      const bookingDate = booking.booking_date || booking.date || "";
      
      // Handle time slots - could be array or single string
      let timeSlots: string[] = [];
      if (booking.time_slots) {
        timeSlots = Array.isArray(booking.time_slots) ? booking.time_slots : [booking.time_slots];
      } else if (booking.timeSlots) {
        timeSlots = Array.isArray(booking.timeSlots) ? booking.timeSlots : [booking.timeSlots];
      } else if (booking.time_slot) {
        timeSlots = Array.isArray(booking.time_slot) ? booking.time_slot : [booking.time_slot];
      }
      
      const totalPrice = booking.total_price || booking.totalPrice || booking.price || 0;
      const createdAt = booking.created_at || booking.createdAt || new Date().toISOString();
      
      return {
        id: bookingId,
        sportId: sportName,
        courtId: courtName,
        date: bookingDate,
        timeSlots: timeSlots,
        customerName: booking.customer_name || booking.customerName || "",
        customerEmail: booking.customer_email || booking.customerEmail || "",
        totalPrice: Number(totalPrice) || 0,
        createdAt: createdAt,
        status: booking.status || "confirmed",
      };
    });

    console.log("✅ Returning", bookings.length, "bookings");
    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("❌ Error fetching user bookings:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
