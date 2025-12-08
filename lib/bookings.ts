/* lib/bookings.ts — Safe version matching your bookings table:
   Columns used: booking_date (date), time_slots (text[]),
   price_per_hour (integer), total_price (integer), created_at, status, user_id, customer_name, customer_email
*/

import { createServerComponentClient, createRouteHandlerClient, createServiceRoleClient } from "./supabase/server";
import { isUniqueConstraintError } from "./db";
import { Booking } from "@/data/types";

/** Utility: check if two arrays of time-slot strings overlap */
function slotsOverlap(a: string[], b: string[]) {
  const set = new Set(a);
  return b.some((s) => set.has(s));
}

/** Normalize time slots (pad HH:MM) */
function normalizeSlots(slots: string[]) {
  return slots.map(s => {
    const [h, m] = s.split(":").map(Number);
    return `${String(h).padStart(2,'0')}:${String(m ?? 0).padStart(2,'0')}`;
  }).sort();
}

/**
 * Get bookings with optional filters
 * Uses service role client (admin) to read bookings across users
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
  const client = createServiceRoleClient();
  if (!client) return [];

  try {
    let query: any = (client as any).from("bookings").select("*");

    if (filters?.courtId) query = query.eq("court", filters.courtId);
    if (filters?.courtName) query = query.eq("court", filters.courtName);
    if (filters?.date) query = query.eq("booking_date", filters.date);
    if (filters?.userId) query = query.eq("user_id", filters.userId);
    if (filters?.search) {
      // search customer_name / customer_email
      query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      // Table might not exist yet
      if (error.code === "42P01" || (error.message || "").includes("does not exist")) {
        return [];
      }
      throw new Error(`Error fetching bookings: ${error.message}`);
    }

    const rows = data || [];
    return rows.map((r: any) => ({
      id: r.id?.toString(),
      sportId: r.sport || "",
      courtId: r.court || "",
      date: r.booking_date,
      timeSlots: Array.isArray(r.time_slots) ? r.time_slots : [],
      customerName: r.customer_name || "",
      customerEmail: r.customer_email || "",
      totalPrice: Number(r.total_price ?? r.totalPrice ?? 0),
      createdAt: r.created_at,
      status: r.status || "confirmed",
    }));
  } catch (err: any) {
    console.error("getBookings error:", err?.message || err);
    throw err;
  }
}

/**
 * Get booked slots for a court on a date.
 * Returns an array of time-slot strings (e.g., ["18:00","19:00"])
 */
export async function getBookedSlots(
  courtId: string,
  date: string,
  courtName?: string
): Promise<string[]> {
  // Use server client where possible
  let client;
  try {
    client = await createServerComponentClient();
  } catch {
    // Fallback to route handler client (server route)
    try {
      client = await createRouteHandlerClient();
    } catch {
      return [];
    }
  }
  if (!client) return [];

  try {
    const courtToUse = courtName || courtId;
    let query: any = (client as any).from("bookings").select("time_slots").eq("booking_date", date);
    if (courtToUse) query = query.eq("court", courtToUse);

    const { data, error } = await query;

    if (error) {
      const msg = error.message || "";
      if (msg.includes("does not exist") || error.code === "42P01" || error.code === "PGRST116") {
        // bookings table not present yet
        return [];
      }
      throw new Error(`Error fetching booked slots: ${error.message}`);
    }

    const slots: string[] = [];
    (data || []).forEach((row: any) => {
      if (Array.isArray(row.time_slots)) {
        row.time_slots.forEach((s: any) => {
          if (s) slots.push(String(s));
        });
      }
    });

    // Normalize & dedupe
    return Array.from(new Set(normalizeSlots(slots)));
  } catch (err: any) {
    console.warn("getBookedSlots error:", err?.message || err);
    return [];
  }
}

/**
 * Create booking — stores booking_date and time_slots array (presentation-only formatting elsewhere).
 * This function prevents overlap by checking existing bookings for same court/date.
 */
export async function createBooking(params: {
  sportName: string;
  courtName: string;
  date: string; // booking_date
  timeSlots: string[]; // array of "HH:MM"
  pricePerHour: number;
  totalPrice: number;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
}): Promise<Booking> {
  const client = createServiceRoleClient();
  if (!client) throw new Error("Database is not configured");

  if (!params.courtName || !params.date || !params.timeSlots || params.timeSlots.length === 0) {
    throw new Error("Missing required booking fields");
  }

  const normalizedRequested = normalizeSlots(params.timeSlots);

  // Fetch existing bookings for same court & date
  const { data: existing, error: existingErr } = await (client as any)
    .from("bookings")
    .select("time_slots")
    .eq("court", params.courtName)
    .eq("booking_date", params.date);

  if (existingErr && !(existingErr.message || "").includes("does not exist")) {
    throw new Error(`Error checking existing bookings: ${existingErr.message}`);
  }

  if (existing && existing.length > 0) {
    for (const eb of existing) {
      const existingSlots: string[] = Array.isArray(eb.time_slots) ? eb.time_slots.map(String) : [];
      if (slotsOverlap(existingSlots, normalizedRequested)) {
        throw new Error(`Time slot(s) conflict with existing booking: ${normalizedRequested.join(", ")}`);
      }
    }
  }

  // Prepare insert payload matching your schema
  const insertPayload: any = {
    sport: params.sportName || "",
    court: params.courtName,
    booking_date: params.date,
    time_slots: normalizedRequested,
    price_per_hour: Math.round(params.pricePerHour),
    total_price: Math.round(params.totalPrice),
    status: "confirmed",
  };

  if (params.userId) insertPayload.user_id = params.userId;
  if (params.customerName) insertPayload.customer_name = params.customerName;
  if (params.customerEmail) insertPayload.customer_email = params.customerEmail;

  const { data: inserted, error: insertErr } = await (client as any)
    .from("bookings")
    .insert(insertPayload)
    .select("*")
    .single();

  if (insertErr) {
    if (isUniqueConstraintError(insertErr)) {
      throw new Error("This booking conflicts with an existing booking. Please choose different slots.");
    }
    throw new Error(`Error creating booking: ${insertErr.message}`);
  }

  // Build Booking response object
  return {
    id: inserted.id?.toString(),
    sportId: inserted.sport || "",
    courtId: inserted.court || "",
    date: inserted.booking_date,
    timeSlots: Array.isArray(inserted.time_slots) ? inserted.time_slots : normalizedRequested,
    customerName: inserted.customer_name || "",
    customerEmail: inserted.customer_email || "",
    totalPrice: Number(inserted.total_price ?? 0),
    createdAt: inserted.created_at,
    status: inserted.status || "confirmed",
  };
}

/** Get booking by ID */
export async function getBookingById(id: string): Promise<Booking | null> {
  let client;
  try {
    client = await createServerComponentClient();
  } catch {
    client = await createRouteHandlerClient().catch(() => null);
  }
  if (!client) return null;

  const { data, error } = await (client as any).from("bookings").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "42P01" || (error.message || "").includes("does not exist")) return null;
    throw new Error(`Error fetching booking: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id?.toString(),
    sportId: data.sport || "",
    courtId: data.court || "",
    date: data.booking_date,
    timeSlots: Array.isArray(data.time_slots) ? data.time_slots : [],
    customerName: data.customer_name || "",
    customerEmail: data.customer_email || "",
    totalPrice: Number(data.total_price ?? 0),
    createdAt: data.created_at,
    status: data.status || "confirmed",
  };
}

/** Update booking (admin) */
export async function updateBooking(bookingId: string, updates: {
  timeSlots?: string[];
  pricePerHour?: number;
  totalPrice?: number;
}) {
  const client = createServiceRoleClient();
  if (!client) throw new Error("Database not configured");

  const updateData: any = {};
  if (updates.timeSlots && updates.timeSlots.length > 0) {
    updateData.time_slots = normalizeSlots(updates.timeSlots);
  }
  if (updates.pricePerHour !== undefined) {
    updateData.price_per_hour = Math.round(updates.pricePerHour);
  }
  if (updates.totalPrice !== undefined) {
    updateData.total_price = Math.round(updates.totalPrice);
  }

  const { data, error } = await (client as any).from("bookings").update(updateData).eq("id", bookingId).select("*").single();
  if (error) throw new Error(`Error updating booking: ${error.message}`);

  return {
    id: data.id?.toString(),
    sportId: data.sport || "",
    courtId: data.court || "",
    date: data.booking_date,
    timeSlots: Array.isArray(data.time_slots) ? data.time_slots : [],
    customerName: data.customer_name || "",
    customerEmail: data.customer_email || "",
    totalPrice: Number(data.total_price ?? 0),
    createdAt: data.created_at,
    status: data.status || "confirmed",
  };
}

/** Update booking status (admin) */
export async function updateBookingStatus(
  bookingId: string,
  status: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<Booking> {
  const client = createServiceRoleClient();
  if (!client) throw new Error("DB not configured");

  const { data, error } = await (client as any).from("bookings").update({ status }).eq("id", bookingId).select("*").single();
  if (error) throw new Error(`Error updating booking status: ${error.message}`);

  return {
    id: data.id?.toString(),
    sportId: data.sport || "",
    courtId: data.court || "",
    date: data.booking_date,
    timeSlots: Array.isArray(data.time_slots) ? data.time_slots : [],
    customerName: data.customer_name || "",
    customerEmail: data.customer_email || "",
    totalPrice: Number(data.total_price ?? 0),
    createdAt: data.created_at,
    status: data.status || "confirmed",
  };
}
