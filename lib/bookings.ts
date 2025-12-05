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

  // Build query with joins to get sport and court names
  let query = (client as any)
    .from("bookings")
    .select(`
      *,
      courts!inner(
        id,
        name,
        sport_id,
        sports!inner(
          id,
          name
        )
      )
    `);

  if (filters?.sportId) {
    query = query.eq("courts.sport_id", filters.sportId);
  }
  if (filters?.courtId) {
    query = query.eq("court_id", filters.courtId);
  }
  if (filters?.date) {
    query = query.eq("date", filters.date);
  }
  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching bookings: ${error.message}`);
  }

  // Convert database format to application format
  let bookings = (data || []).map((booking: any) => {
    // Convert start_time and end_time to timeSlots array
    const timeSlots: string[] = [];
    if (booking.start_time && booking.end_time) {
      const start = new Date(`2000-01-01T${booking.start_time}`);
      const end = new Date(`2000-01-01T${booking.end_time}`);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      for (let i = 0; i < durationHours; i++) {
        const slotTime = new Date(start.getTime() + i * 60 * 60 * 1000);
        const hours = String(slotTime.getHours()).padStart(2, '0');
        const minutes = String(slotTime.getMinutes()).padStart(2, '0');
        timeSlots.push(`${hours}:${minutes}`);
      }
    }

    return {
      id: booking.id.toString(),
      sportId: booking.courts?.sports?.name || booking.courts?.sport_id || "",
      courtId: booking.courts?.name || booking.court_id || "",
      date: booking.date,
      timeSlots: timeSlots,
      customerName: booking.customer_name || "",
      customerEmail: booking.customer_email || "",
      totalPrice: Number(booking.price) || 0,
      createdAt: booking.created_at,
      status: booking.status || "confirmed",
    };
  });

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
    // Use court_id (UUID) if available, otherwise try to find by name
    let query = (client as any)
      .from("bookings")
      .select("start_time, end_time")
      .eq("date", date);

    // Try to match by court_id (UUID) first
    if (courtId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courtId)) {
      query = query.eq("court_id", courtId);
    } else {
      // If not a UUID, try to find court by name via join
      query = query.eq("courts.name", courtName || courtId);
    }

    const { data, error } = await query;

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

    // Convert start_time and end_time to timeSlots array
    const allSlots: string[] = [];
    (data || []).forEach((booking: any) => {
      if (booking.start_time && booking.end_time) {
        const start = new Date(`2000-01-01T${booking.start_time}`);
        const end = new Date(`2000-01-01T${booking.end_time}`);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        for (let i = 0; i < durationHours; i++) {
          const slotTime = new Date(start.getTime() + i * 60 * 60 * 1000);
          const hours = String(slotTime.getHours()).padStart(2, '0');
          const minutes = String(slotTime.getMinutes()).padStart(2, '0');
          allSlots.push(`${hours}:${minutes}`);
        }
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
  customerName?: string;
  customerEmail?: string;
}): Promise<Booking> {
  const client = getServerClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to create bookings.");
  }

  // First, find the court_id by name (or use courtName if it's already a UUID)
  let courtId: string;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.courtName)) {
    // Already a UUID
    courtId = params.courtName;
  } else {
    // Find court by name
    const { data: courtData, error: courtError } = await (client as any)
      .from("courts")
      .select("id")
      .eq("name", params.courtName)
      .single();

    if (courtError || !courtData) {
      throw new Error(`Court "${params.courtName}" not found in database.`);
    }
    courtId = courtData.id;
  }

  // Convert timeSlots array to start_time and end_time
  if (params.timeSlots.length === 0) {
    throw new Error("At least one time slot is required.");
  }

  // Sort time slots and ensure they're consecutive
  const sortedSlots = [...params.timeSlots].sort();
  const startTime = sortedSlots[0];
  
  // Calculate end time (last slot + 1 hour)
  const lastSlot = sortedSlots[sortedSlots.length - 1];
  const [lastHours, lastMinutes] = lastSlot.split(':').map(Number);
  const endHours = String((lastHours + 1) % 24).padStart(2, '0');
  const endTime = `${endHours}:${String(lastMinutes).padStart(2, '0')}`;

  // Check for conflicts with existing bookings
  const { data: existingBookings, error: conflictError } = await (client as any)
    .from("bookings")
    .select("start_time, end_time")
    .eq("court_id", courtId)
    .eq("date", params.date);

  if (conflictError && !conflictError.message.includes("does not exist")) {
    throw new Error(`Error checking for conflicts: ${conflictError.message}`);
  }

  if (existingBookings && existingBookings.length > 0) {
    const requestedStart = new Date(`2000-01-01T${startTime}`);
    const requestedEnd = new Date(`2000-01-01T${endTime}`);

    for (const booking of existingBookings) {
      const existingStart = new Date(`2000-01-01T${booking.start_time}`);
      const existingEnd = new Date(`2000-01-01T${booking.end_time}`);

      // Check for overlap
      if (
        (requestedStart >= existingStart && requestedStart < existingEnd) ||
        (requestedEnd > existingStart && requestedEnd <= existingEnd) ||
        (requestedStart <= existingStart && requestedEnd >= existingEnd)
      ) {
        throw new Error(
          `Time slot(s) ${params.timeSlots.join(", ")} conflict with an existing booking. Please select another time slot.`
        );
      }
    }
  }

  // Insert booking with correct schema fields
  const insertData: any = {
    court_id: courtId,
    date: params.date,
    start_time: startTime,
    end_time: endTime,
    price: Math.round(params.totalPrice * 100) / 100, // Round to 2 decimal places
    status: "confirmed",
  };
  
  // Only add user_id if provided (not null or undefined)
  if (params.userId) {
    insertData.user_id = params.userId;
  }

  // Add customer info if provided
  if (params.customerName) {
    insertData.customer_name = params.customerName;
  }
  if (params.customerEmail) {
    insertData.customer_email = params.customerEmail;
  }
  
  const { data, error } = await (client as any)
    .from("bookings")
    .insert(insertData)
    .select(`
      *,
      courts!inner(
        id,
        name,
        sport_id,
        sports!inner(
          id,
          name
        )
      )
    `)
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

  // Convert back to application format
  const timeSlots: string[] = [];
  if (data.start_time && data.end_time) {
    const start = new Date(`2000-01-01T${data.start_time}`);
    const end = new Date(`2000-01-01T${data.end_time}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    for (let i = 0; i < durationHours; i++) {
      const slotTime = new Date(start.getTime() + i * 60 * 60 * 1000);
      const hours = String(slotTime.getHours()).padStart(2, '0');
      const minutes = String(slotTime.getMinutes()).padStart(2, '0');
      timeSlots.push(`${hours}:${minutes}`);
    }
  }

  return {
    id: data.id.toString(),
    sportId: data.courts?.sports?.name || "",
    courtId: data.courts?.name || "",
    date: data.date,
    timeSlots: timeSlots,
    customerName: data.customer_name || "",
    customerEmail: data.customer_email || "",
    totalPrice: Number(data.price) || 0,
    createdAt: data.created_at,
    status: data.status || "confirmed",
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

  // Convert start_time and end_time to timeSlots array
  const timeSlots: string[] = [];
  if (data.start_time && data.end_time) {
    const start = new Date(`2000-01-01T${data.start_time}`);
    const end = new Date(`2000-01-01T${data.end_time}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    for (let i = 0; i < durationHours; i++) {
      const slotTime = new Date(start.getTime() + i * 60 * 60 * 1000);
      const hours = String(slotTime.getHours()).padStart(2, '0');
      const minutes = String(slotTime.getMinutes()).padStart(2, '0');
      timeSlots.push(`${hours}:${minutes}`);
    }
  }

  return {
    id: data.id.toString(),
    sportId: data.courts?.sports?.name || "",
    courtId: data.courts?.name || "",
    date: data.date,
    timeSlots: timeSlots,
    customerName: data.customer_name || "",
    customerEmail: data.customer_email || "",
    totalPrice: Number(data.price) || 0,
    createdAt: data.created_at,
    status: data.status || "confirmed",
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
  
  // Convert timeSlots array to start_time and end_time if provided
  if (updates.timeSlots && updates.timeSlots.length > 0) {
    const sortedSlots = [...updates.timeSlots].sort();
    const startTime = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    const [lastHours, lastMinutes] = lastSlot.split(':').map(Number);
    const endHours = String((lastHours + 1) % 24).padStart(2, '0');
    const endTime = `${endHours}:${String(lastMinutes).padStart(2, '0')}`;
    updateData.start_time = startTime;
    updateData.end_time = endTime;
  }
  
  if (updates.totalPrice !== undefined) {
    updateData.price = Math.round(updates.totalPrice * 100) / 100;
  }

  const { data, error } = await (client as any)
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select(`
      *,
      courts!inner(
        id,
        name,
        sport_id,
        sports!inner(
          id,
          name
        )
      )
    `)
    .single();

  if (error) {
    throw new Error(`Error updating booking: ${error.message}`);
  }

  // Convert start_time and end_time to timeSlots array
  const timeSlots: string[] = [];
  if (data.start_time && data.end_time) {
    const start = new Date(`2000-01-01T${data.start_time}`);
    const end = new Date(`2000-01-01T${data.end_time}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    for (let i = 0; i < durationHours; i++) {
      const slotTime = new Date(start.getTime() + i * 60 * 60 * 1000);
      const hours = String(slotTime.getHours()).padStart(2, '0');
      const minutes = String(slotTime.getMinutes()).padStart(2, '0');
      timeSlots.push(`${hours}:${minutes}`);
    }
  }

  return {
    id: data.id.toString(),
    sportId: data.courts?.sports?.name || "",
    courtId: data.courts?.name || "",
    date: data.date,
    timeSlots: timeSlots,
    customerName: data.customer_name || "",
    customerEmail: data.customer_email || "",
    totalPrice: Number(data.price) || 0,
    createdAt: data.created_at,
    status: data.status || "confirmed",
  };
}