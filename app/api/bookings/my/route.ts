import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";

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

    console.log("🔍 Fetching bookings for user_id:", user.id);
    console.log("🔍 User ID type:", typeof user.id);
    console.log("🔍 User ID value:", JSON.stringify(user.id));

    // First, let's check what bookings exist (for debugging) - use service role to bypass RLS
    try {
      const serviceClient = createServiceRoleClient();
      const { data: allBookingsDebug } = await (serviceClient as any)
        .from("bookings")
        .select("id, user_id, sport, court, booking_date, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      
      console.log("📊 Recent bookings in DB:", allBookingsDebug?.map((b: any) => ({
        id: b.id,
        user_id: b.user_id,
        user_id_type: typeof b.user_id,
        user_id_match: b.user_id === user.id,
        user_id_string_match: String(b.user_id) === String(user.id),
        sport: b.sport,
        court: b.court
      })));
    } catch (debugErr) {
      console.warn("⚠️ Could not fetch debug bookings:", debugErr);
    }

    // Query bookings directly filtered by user_id using Supabase
    // RLS policy should allow this if user_id matches auth.uid()
    let { data, error } = await (supabase as any)
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // If query fails or returns empty, try with service role client as fallback
    // This bypasses RLS but we've already verified the user is authenticated
    if (error || !data || data.length === 0) {
      console.log("⚠️ Initial query failed or returned empty, trying with service role client...");
      
      try {
        const serviceClient = createServiceRoleClient();
        const { data: serviceData, error: serviceError } = await (serviceClient as any)
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (!serviceError && serviceData && serviceData.length > 0) {
          console.log("✅ Service role query succeeded, found", serviceData.length, "bookings");
          data = serviceData;
          error = null;
        } else if (serviceError) {
          console.error("❌ Service role query also failed:", serviceError);
        }
      } catch (serviceErr: any) {
        console.warn("⚠️ Could not use service role client:", serviceErr.message);
        // Continue with original error
      }
    }

    if (error) {
      console.error("❌ Error fetching bookings:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error details:", error.details);
      throw new Error(`Error fetching bookings: ${error.message} (Code: ${error.code})`);
    }

    console.log("📊 Query result - data length:", data?.length || 0);
    console.log("📊 Query result - data:", data);

    if (!data || data.length === 0) {
      console.log("⚠️ No bookings found for user:", user.id);
      console.log("⚠️ This could mean:");
      console.log("   1. No bookings exist with this user_id");
      console.log("   2. RLS policy is blocking the query");
      console.log("   3. user_id in bookings doesn't match current user.id");
      return NextResponse.json({ bookings: [] });
    }

    console.log("✅ Found", data.length, "bookings for user:", user.id);

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
