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
  sportName?: string;
  courtId?: string;
  courtName?: string;
  date?: string;
  userId?: string;
  search?: string;
}): Promise<Booking[]> {
  const client = getPublicClient();
  
  // Fallback to empty array if Supabase is not configured
  if (!client) {
    return [];
  }

  let query = (client as any).from("bookings").select("*");

  if (filters?.sportName) {
    query = query.eq("sport", filters.sportName);
  }
  if (filters?.courtName) {
    query = query.eq("court", filters.courtName);
  }
  if (filters?.date) {
    query = query.eq("booking_date", filters.date);
  }
  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching bookings: ${error.message}`);
  }

  let bookings = (data || []).map((booking: any) => ({
    id: booking.id.toString(),
    sportId: booking.sport || "", // Use sport name as sportId for compatibility
    courtId: booking.court || "", // Use court name as courtId for compatibility
    date: booking.booking_date,
    timeSlots: booking.time_slots || [], // Use time_slots array
    customerName: "", // Not stored in schema
    customerEmail: "", // Not stored in schema
    totalPrice: booking.total_price || 0,
    createdAt: booking.created_at,
    status: "confirmed", // Default status since not stored in schema
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
  date: string,
  courtName?: string
): Promise<string[]> {
  const client = getPublicClient();

  // Fallback to empty array if Supabase is not configured
  if (!client) {
    return [];
  }

  try {
    const court = courtName || courtId;
    const { data, error } = await (client as any)
      .from("bookings")
      .select("time_slots")
      .eq("court", court)
      .eq("booking_date", date);

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

    // Flatten all time_slots arrays into a single array
    const allSlots: string[] = [];
    (data || []).forEach((booking: any) => {
      if (booking.time_slots && Array.isArray(booking.time_slots)) {
        allSlots.push(...booking.time_slots);
      }
    });

    return allSlots;
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
  sportName: string;
  courtName: string;
  date: string;
  timeSlots: string[];
  pricePerHour: number;
  totalPrice: number;
  userId?: string;
}): Promise<Booking> {
  const client = getServerClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to create bookings.");
  }

  // Check if any of the slots are already booked (optimistic check)
  const { data: existingBookings } = await (client as any)
    .from("bookings")
    .select("time_slots")
    .eq("court", params.courtName)
    .eq("booking_date", params.date);

  if (existingBookings && existingBookings.length > 0) {
    // Flatten all existing time slots
    const existingSlots: string[] = [];
    existingBookings.forEach((booking: any) => {
      if (booking.time_slots && Array.isArray(booking.time_slots)) {
        existingSlots.push(...booking.time_slots);
      }
    });

    // Check if any requested slot overlaps with existing slots
    const overlappingSlots = params.timeSlots.filter((slot) => 
      existingSlots.includes(slot)
    );

    if (overlappingSlots.length > 0) {
      throw new Error(
        `Time slot(s) ${overlappingSlots.join(", ")} are already booked. Please select another slot.`
      );
    }
  }

  // Insert booking with all time slots in a single row
  const insertData: any = {
    sport: params.sportName,
    court: params.courtName,
    booking_date: params.date,
    time_slots: params.timeSlots, // Array of time slots
    price_per_hour: Math.round(params.pricePerHour), // Integer
    total_price: Math.round(params.totalPrice), // Integer
  };
  
  // Only add user_id if provided (not null or undefined)
  if (params.userId) {
    insertData.user_id = params.userId;
  }
  
  const { data, error } = await (client as any)
    .from("bookings")
    .insert(insertData)
    .select()
    .single();
  
  // Log for debugging
  if (params.userId) {
    console.log("✅ Booking created with user_id:", params.userId);
  } else {
    console.log("⚠️ Booking created without user_id");
  }

  if (error) {
    // Handle unique constraint violation
    if (isUniqueConstraintError(error)) {
      throw new Error("This booking conflicts with an existing booking. Please select another time slot.");
    }
    throw new Error(`Error creating booking: ${error.message}`);
  }

  return {
    id: data.id.toString(),
    sportId: data.sport || "", // Use sport name as sportId for compatibility
    courtId: data.court || "", // Use court name as courtId for compatibility
    date: data.booking_date,
    timeSlots: data.time_slots || [],
    customerName: "", // Not stored in schema
    customerEmail: "", // Not stored in schema
    totalPrice: data.total_price || 0,
    createdAt: data.created_at,
    status: "confirmed", // Default status
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
    .eq("id", id) // UUID - don't parse as integer
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Error fetching booking: ${error.message}`);
  }

  return {
    id: data.id.toString(),
    sportId: data.sport || "", // Use sport name as sportId for compatibility
    courtId: data.court || "", // Use court name as courtId for compatibility
    date: data.booking_date,
    timeSlots: data.time_slots || [],
    customerName: "", // Not stored in schema
    customerEmail: "", // Not stored in schema
    totalPrice: data.total_price || 0,
    createdAt: data.created_at,
    status: "confirmed", // Default status
  };
}

/**
 * Update booking (server-side only, admin)
 * Note: Status field doesn't exist in schema, so this function is limited
 */
export async function updateBooking(bookingId: string, updates: {
  timeSlots?: string[];
  pricePerHour?: number;
  totalPrice?: number;
}) {
  const client = getServerClient();
  
  const updateData: any = {};
  if (updates.timeSlots) {
    updateData.time_slots = updates.timeSlots;
  }
  if (updates.pricePerHour !== undefined) {
    updateData.price_per_hour = Math.round(updates.pricePerHour);
  }
  if (updates.totalPrice !== undefined) {
    updateData.total_price = Math.round(updates.totalPrice);
  }

  const { data, error } = await (client as any)
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating booking: ${error.message}`);
  }

  return {
    id: data.id.toString(),
    sportId: data.sport || "",
    courtId: data.court || "",
    date: data.booking_date,
    timeSlots: data.time_slots || [],
    customerName: "",
    customerEmail: "",
    totalPrice: data.total_price || 0,
    createdAt: data.created_at,
    status: "confirmed",
  };
}