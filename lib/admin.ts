import { createServiceRoleClient } from "./supabase/server";
import {
  getAllSports as getAllSportsLib,
  getSportByIdServer,
  createSportServer,
  updateSportServer,
  deleteSportServer,
} from "./sports";
import {
  getCourtByIdServer,
  createCourtServer,
  updateCourtServer,
  deleteCourtServer,
} from "./courts";
import { getBookings, updateBookingStatus as updateBookingStatusLib } from "./bookings";

/**
 * Get admin statistics
 * Returns mock stats if Supabase is not configured
 */
export async function getAdminStats() {
  const client = createServiceRoleClient();

  // Fallback to mock stats if Supabase is not configured
  if (!client) {
    const { sports } = await import("@/data/sports");
    const totalCourts = sports.reduce((sum, sport) => sum + sport.courts.length, 0);
    return {
      totalSports: sports.length,
      totalCourts,
      totalBookings: 0,
      bookingsToday: 0,
    };
  }

  const [sportsResult, courtsResult, bookingsResult] = await Promise.all([
    (client as any).from("sports").select("id", { count: "exact", head: true }),
    (client as any).from("courts").select("id", { count: "exact", head: true }),
    (client as any).from("bookings").select("id", { count: "exact", head: true }),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const { count: bookingsToday } = await (client as any)
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("date", today);

  return {
    totalSports: sportsResult.count || 0,
    totalCourts: courtsResult.count || 0,
    totalBookings: bookingsResult.count || 0,
    bookingsToday: bookingsToday || 0,
  };
}

/**
 * Get all sports (server-side, for admin)
 * Returns full Sport objects with courts
 */
export async function getAllSports() {
  return getAllSportsLib();
}

/**
 * Get all sports as raw database rows (for admin API)
 * Returns mock data if Supabase is not configured
 */
export async function getAllSportsRaw() {
  const client = createServiceRoleClient();
  
  // Fallback to mock data if Supabase is not configured
  if (!client) {
    const { sports } = await import("@/data/sports");
    return sports.map((s) => ({
      id: s.id, // UUID string
      name: s.name,
      description: s.description,
      image: s.image,
      created_at: new Date().toISOString(),
    }));
  }

  const { data, error } = await (client as any).from("sports").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching sports: ${error.message}`);
  }

  return data || [];
}

/**
 * Get sport by ID (server-side, for admin)
 * Accepts UUID string
 */
export async function getSportById(id: string) {
  return getSportByIdServer(id);
}

/**
 * Create a new sport
 */
export async function createSport(sportData: {
  name: string;
  description: string;
  image: string;
}) {
  return createSportServer(sportData);
}

/**
 * Update a sport
 * Accepts UUID string
 */
export async function updateSport(
  id: string,
  updates: {
    name?: string;
    description?: string;
    image?: string;
  }
) {
  return updateSportServer(id, updates);
}

/**
 * Delete a sport
 * Accepts UUID string
 */
export async function deleteSport(id: string) {
  return deleteSportServer(id);
}

/**
 * Create a court for a sport
 * Accepts UUID string for sportId
 */
export async function createCourt(
  sportId: string,
  courtData: {
    name: string;
    pricePerHour: number;
    location: string;
    image?: string;
    availableTimeSlots: string[];
  }
) {
  return createCourtServer(sportId, courtData);
}

/**
 * Update a court
 * Accepts UUID strings for sportId and courtId
 */
export async function updateCourt(
  sportId: string,
  courtId: string,
  updates: {
    name?: string;
    pricePerHour?: number;
    location?: string;
    image?: string;
    availableTimeSlots?: string[];
  }
) {
  return updateCourtServer(courtId, updates);
}

/**
 * Delete a court
 * Accepts UUID strings for sportId and courtId
 */
export async function deleteCourt(sportId: string, courtId: string) {
  return deleteCourtServer(courtId);
}

/**
 * Get all bookings with optional filters
 */
export async function getAllBookings(filters?: {
  sportId?: string;
  courtId?: string;
  date?: string;
  status?: string;
  search?: string;
}) {
  return getBookings(filters);
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed"
) {
  return updateBookingStatusLib(bookingId, status);
}
