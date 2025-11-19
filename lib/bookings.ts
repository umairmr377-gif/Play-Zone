import { getPublicClient } from "./supabaseClient";
import { getServerClient } from "./supabaseServer";
import { isUniqueConstraintError } from "./db";
import { Booking } from "@/data/types";

/**
 * Get bookings with optional filters (client-safe)
 * Falls back to empty array if Supabase is not configured
 */
export async function getBookings(filters?: {
  sportId?: string;
  courtId?: string;
  date?: string;
  status?: string;
  search?: string;
}): Promise<Booking[]> {
  const client = getPublicClient();
  
  // Fallback to empty array if Supabase is not configured
  if (!client) {
    return [];
  }

  let query = (client as any).from("bookings").select("*");

  if (filters?.sportId) {
    query = query.eq("sport_id", parseInt(filters.sportId));
  }
  if (filters?.courtId) {
    query = query.eq("court_id", parseInt(filters.courtId));
  }
  if (filters?.date) {
    query = query.eq("date", filters.date);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching bookings: ${error.message}`);
  }

  let bookings = (data || []).map((booking: any) => ({
    id: booking.id.toString(),
    sportId: booking.sport_id.toString(),
    courtId: booking.court_id.toString(),
    date: booking.date,
    timeSlots: [booking.time_slot], // Convert single slot to array for compatibility
    customerName: booking.user_name || "",
    customerEmail: "", // Not stored in current schema
    totalPrice: booking.price,
    createdAt: booking.created_at,
    status: booking.status || "confirmed",
  }));

  // Client-side search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    bookings = bookings.filter(
      (b: Booking) =>
        b.id.toLowerCase().includes(searchLower) ||
        b.customerName.toLowerCase().includes(searchLower)
    );
  }

  return bookings;
}

/**
 * Get booked time slots for a specific court and date
 * Falls back to empty array if Supabase is not configured or table doesn't exist
 */
export async function getBookedSlots(
  courtId: string,
  date: string
): Promise<string[]> {
  const client = getPublicClient();

  // Fallback to empty array if Supabase is not configured
  if (!client) {
    return [];
  }

  try {
    const { data, error } = await (client as any)
      .from("bookings")
      .select("time_slot")
      .eq("court_id", parseInt(courtId))
      .eq("date", date)
      .eq("status", "confirmed"); // Only count confirmed bookings

    // Check if error is due to missing table
    if (error) {
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("schema cache") ||
        errorMessage.includes("relation") ||
        errorMessage.includes("does not exist") ||
        error.code === "42P01" ||
        error.code === "PGRST116"
      ) {
        // Table doesn't exist yet - return empty array (no bookings)
        console.warn("Bookings table not found, returning empty slots. Run supabase/schema.sql to create tables.");
        return [];
      }
      throw new Error(`Error fetching booked slots: ${error.message}`);
    }

    return (data || []).map((b: any) => b.time_slot);
  } catch (error: any) {
    // If any other error occurs, return empty array (no bookings)
    console.warn("Error fetching booked slots, returning empty:", error.message);
    return [];
  }
}

/**
 * Create a booking (server-side, with conflict prevention)
 * Throws error if Supabase is not configured
 */
export async function createBooking(params: {
  sportId: string;
  courtId: string;
  date: string;
  timeSlot: string;
  price: number;
  userName?: string;
}): Promise<Booking> {
  const client = getServerClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to create bookings.");
  }

  // Check if slot is already booked (optimistic check)
  const { data: existing } = await (client as any)
    .from("bookings")
    .select("id")
    .eq("court_id", parseInt(params.courtId))
    .eq("date", params.date)
    .eq("time_slot", params.timeSlot)
    .eq("status", "confirmed")
    .maybeSingle();

  if (existing) {
    throw new Error("This time slot is already booked. Please select another slot.");
  }

  // Insert booking - unique constraint will prevent double booking
  const { data, error } = await (client as any)
    .from("bookings")
    .insert({
      sport_id: parseInt(params.sportId),
      court_id: parseInt(params.courtId),
      date: params.date,
      time_slot: params.timeSlot,
      price: params.price,
      user_name: params.userName || null,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (isUniqueConstraintError(error)) {
      throw new Error("This time slot is already booked. Please select another slot.");
    }
    throw new Error(`Error creating booking: ${error.message}`);
  }

  return {
    id: data.id.toString(),
    sportId: data.sport_id.toString(),
    courtId: data.court_id.toString(),
    date: data.date,
    timeSlots: [data.time_slot],
    customerName: data.user_name || "",
    customerEmail: "",
    totalPrice: data.price,
    createdAt: data.created_at,
    status: (data as any).status || "confirmed",
  };
}

/**
 * Get booking by ID (client-safe)
 * Returns null if Supabase is not configured
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const client = getPublicClient();
  
  // Return null if Supabase is not configured
  if (!client) {
    return null;
  }

  const { data, error } = await (client as any)
    .from("bookings")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Error fetching booking: ${error.message}`);
  }

  return {
    id: data.id.toString(),
    sportId: data.sport_id.toString(),
    courtId: data.court_id.toString(),
    date: data.date,
    timeSlots: [data.time_slot],
    customerName: data.user_name || "",
    customerEmail: "",
    totalPrice: data.price,
    createdAt: data.created_at,
    status: (data as any).status || "confirmed",
  };
}

/**
 * Update booking status (server-side only, admin)
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed"
) {
  const client = getServerClient();
  const { data, error } = await (client as any)
    .from("bookings")
    .update({ status })
    .eq("id", parseInt(bookingId))
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating booking status: ${error.message}`);
  }

  return {
    id: data.id.toString(),
    sportId: data.sport_id.toString(),
    courtId: data.court_id.toString(),
    date: data.date,
    timeSlots: [data.time_slot],
    customerName: data.user_name || "",
    customerEmail: "",
    totalPrice: data.price,
    createdAt: data.created_at,
    status: (data as any).status || "confirmed",
  };
}
