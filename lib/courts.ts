import { createServerComponentClient } from "./supabase/server";
import { createServiceRoleClient } from "./supabase/server";
import { Court } from "@/data/types";
import { getSportById as getMockSportById } from "@/data/sports";

/**
 * Get courts by sport ID (server-safe)
 * Falls back to mock data if Supabase is not configured
 * Works in both server and client components
 */
export async function getCourtsBySport(sportId: string): Promise<Court[]> {
  // Try to use server component client first (for server-side rendering)
  let client;
  try {
    client = await createServerComponentClient();
  } catch {
    // If server client fails, fall back to mock data
    const sport = getMockSportById(sportId);
    return sport?.courts || [];
  }

  // Fallback to mock data if Supabase is not configured
  if (!client) {
    const sport = getMockSportById(sportId);
    return sport?.courts || [];
  }

  try {
    // sport_id is UUID, not integer
    const { data, error } = await (client as any)
      .from("courts")
      .select("*")
      .eq("sport_id", sportId) // UUID, not parseInt
      .order("created_at", { ascending: false });

    // If table doesn't exist or other error, fall back to mock data
    if (error) {
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("schema cache") ||
        errorMessage.includes("relation") ||
        errorMessage.includes("does not exist") ||
        errorMessage.includes("PGRST")
      ) {
        console.warn("Courts table not found in database, using mock data. Run supabase/schema.sql to create tables.");
        const sport = getMockSportById(sportId);
        return sport?.courts || [];
      }
      throw new Error(`Error fetching courts: ${error.message}`);
    }

    return (data || []).map((court: any) => {
      // Schema uses image_url, not extra_info
      return {
        id: court.id.toString(),
        name: court.name,
        pricePerHour: Number(court.price_per_hour) || 0,
        location: court.location || "",
        image: court.image_url || undefined,
        availableTimeSlots: [], // Not stored in schema, would need to be added
      };
    });
  } catch (error: any) {
    // If any other error occurs, fall back to mock data
    console.warn("Error fetching from Supabase, using mock data:", error.message);
    const sport = getMockSportById(sportId);
    return sport?.courts || [];
  }
}

/**
 * Get court by ID (server-safe)
 * Falls back to mock data if Supabase is not configured
 * Works in both server and client components
 */
export async function getCourtById(
  sportId: string,
  courtId: string
): Promise<Court | undefined> {
  // getCourtsBySport() already handles server/client correctly and fallbacks
  const courts = await getCourtsBySport(sportId);
  return courts.find((c) => c.id === courtId);
}

/**
 * Get court by ID (server-side)
 * Accepts UUID string or number (for backward compatibility)
 */
export async function getCourtByIdServer(courtId: number | string) {
  const client = createServiceRoleClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to fetch courts.");
  }
  
  // Convert to string if number (for backward compatibility)
  const id = typeof courtId === 'number' ? courtId.toString() : courtId;
  
  const { data, error } = await (client as any)
    .from("courts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Error fetching court: ${error.message}`);
  }

  return data;
}

/**
 * Create court (server-side only, admin)
 * Accepts UUID string or number for sportId (for backward compatibility)
 */
export async function createCourtServer(
  sportId: number | string,
  courtData: {
    name: string;
    pricePerHour: number;
    location: string;
    image?: string;
    availableTimeSlots: string[];
  }
) {
  const client = createServiceRoleClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to create courts.");
  }
  
  // Convert to string if number (for backward compatibility)
  const id = typeof sportId === 'number' ? sportId.toString() : sportId;
  
  const { data, error } = await (client as any)
    .from("courts")
    .insert({
      sport_id: id, // UUID
      name: courtData.name,
      price_per_hour: courtData.pricePerHour,
      location: courtData.location,
      image_url: courtData.image || null, // Schema uses image_url, not extra_info
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating court: ${error.message}`);
  }

  return data;
}

/**
 * Update court (server-side only, admin)
 * Accepts UUID string or number for courtId (for backward compatibility)
 */
export async function updateCourtServer(
  courtId: number | string,
  updates: {
    name?: string;
    pricePerHour?: number;
    location?: string;
    image?: string;
    availableTimeSlots?: string[];
  }
) {
  const client = createServiceRoleClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to update courts.");
  }
  
  // Convert to string if number (for backward compatibility)
  const id = typeof courtId === 'number' ? courtId.toString() : courtId;

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.pricePerHour !== undefined)
    updateData.price_per_hour = updates.pricePerHour;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.image !== undefined) {
    // Schema uses image_url, not extra_info
    updateData.image_url = updates.image || null;
  }
  // Note: availableTimeSlots is not in schema - would need to be added to schema or stored differently

  const { data, error } = await (client as any)
    .from("courts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating court: ${error.message}`);
  }

  return data;
}

/**
 * Delete court (server-side only, admin)
 * Accepts UUID string or number (for backward compatibility)
 */
export async function deleteCourtServer(courtId: number | string) {
  const client = createServiceRoleClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to delete courts.");
  }
  
  // Convert to string if number (for backward compatibility)
  const id = typeof courtId === 'number' ? courtId.toString() : courtId;
  
  const { error } = await (client as any).from("courts").delete().eq("id", id);

  if (error) {
    throw new Error(`Error deleting court: ${error.message}`);
  }
}
