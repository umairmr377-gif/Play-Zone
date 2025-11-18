import { getServerClient } from "./supabaseServer";
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
  const client = getServerClient();

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
  const client = getServerClient();
  
  // Fallback to mock data if Supabase is not configured
  if (!client) {
    const { sports } = await import("@/data/sports");
    return sports.map((s, index) => ({
      id: index + 1,
      name: s.name,
      description: s.description,
      image: s.image,
      created_at: new Date().toISOString(),
    }));
  }

  const { data, error } = await (client as any).from("sports").select("*").order("id");

  if (error) {
    throw new Error(`Error fetching sports: ${error.message}`);
  }

  return data || [];
}

/**
 * Get sport by ID (server-side, for admin)
 */
export async function getSportById(id: string) {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    return null;
  }
  return getSportByIdServer(numericId);
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
 */
export async function updateSport(
  id: string,
  updates: {
    name?: string;
    description?: string;
    image?: string;
  }
) {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error("Invalid sport ID");
  }
  return updateSportServer(numericId, updates);
}

/**
 * Delete a sport
 */
export async function deleteSport(id: string) {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error("Invalid sport ID");
  }
  return deleteSportServer(numericId);
}

/**
 * Create a court for a sport
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
  const numericSportId = parseInt(sportId);
  if (isNaN(numericSportId)) {
    throw new Error("Invalid sport ID");
  }
  return createCourtServer(numericSportId, courtData);
}

/**
 * Update a court
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
  const numericCourtId = parseInt(courtId);
  if (isNaN(numericCourtId)) {
    throw new Error("Invalid court ID");
  }
  return updateCourtServer(numericCourtId, updates);
}

/**
 * Delete a court
 */
export async function deleteCourt(sportId: string, courtId: string) {
  const numericCourtId = parseInt(courtId);
  if (isNaN(numericCourtId)) {
    throw new Error("Invalid court ID");
  }
  return deleteCourtServer(numericCourtId);
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
