import { createServerComponentClient, createServiceRoleClient } from "./supabase/server";
import { Sport, Court } from "@/data/types";
import { sports as mockSports, getSportById as getMockSportById } from "@/data/sports";

/**
 * Get all sports (server-side, uses server component client)
 * Falls back to mock data if Supabase is not configured or tables don't exist
 */
export async function getAllSports(): Promise<Sport[]> {
  // Try to use server component client first (for server-side rendering)
  let client;
  try {
    client = await createServerComponentClient();
  } catch {
    // If server client fails, fall back to mock data
    console.warn("Supabase not configured, using mock data");
    return mockSports;
  }

  // Fallback to mock data if Supabase is not configured
  if (!client) {
    console.warn("Supabase not configured, using mock data");
    return mockSports;
  }

  try {
    const { data: sportsData, error: sportsError } = await (client as any)
      .from("sports")
      .select("*")
      .order("id");

    // If table doesn't exist or other error, fall back to mock data
    if (sportsError) {
      const errorMessage = sportsError.message || "";
      if (
        errorMessage.includes("schema cache") ||
        errorMessage.includes("relation") ||
        errorMessage.includes("does not exist") ||
        errorMessage.includes("PGRST")
      ) {
        console.warn("Sports table not found in database, using mock data. Run supabase/schema.sql to create tables.");
        return mockSports;
      }
      throw new Error(`Error fetching sports: ${sportsError.message}`);
    }

    if (!sportsData || sportsData.length === 0) {
      // Empty table - return empty array (or mock data for development)
      return [];
    }

    // Fetch courts for each sport
    const { data: courtsData, error: courtsError } = await (client as any)
      .from("courts")
      .select("*")
      .order("id");

    if (courtsError) {
      const errorMessage = courtsError.message || "";
      if (
        errorMessage.includes("schema cache") ||
        errorMessage.includes("relation") ||
        errorMessage.includes("does not exist")
      ) {
        console.warn("Courts table not found, continuing without courts data");
        // Continue with empty courts array
      } else {
        throw new Error(`Error fetching courts: ${courtsError.message}`);
      }
    }

    // Map database rows to Sport interface
    const sports: Sport[] = sportsData.map((sport: any) => {
      const courts: Court[] = (courtsData || [])
        .filter((court: any) => court.sport_id === sport.id)
        .map((court: any) => {
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

      return {
        id: sport.id.toString(),
        name: sport.name,
        description: sport.description || "",
        image: sport.image || "",
        courts,
      };
    });

    return sports;
  } catch (error: any) {
    // If any other error occurs, fall back to mock data
    console.warn("Error fetching from Supabase, using mock data:", error.message);
    return mockSports;
  }
}

/**
 * Get sport by ID or name (server-safe)
 * Falls back to mock data if Supabase is not configured
 * Works in both server and client components
 * Supports both UUID lookups and name-based lookups (e.g., "football", "cricket")
 */
export async function getSportById(id: string): Promise<Sport | undefined> {
  // getAllSports() already handles server/client correctly and fallbacks
  const sports = await getAllSports();
  
  // First try exact ID match (works for UUIDs and exact name matches)
  let sport = sports.find((s) => s.id === id);
  
  // If not found and ID doesn't look like a UUID, try matching by name or slug
  if (!sport && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    const normalizedId = id.toLowerCase().trim();
    // Try matching by exact name (case-insensitive)
    sport = sports.find((s) => s.name.toLowerCase() === normalizedId || s.id.toLowerCase() === normalizedId);
    
    // If still not found, try matching by creating a slug from the name
    // (e.g., "Paddle Tennis" -> "paddle-tennis" or "paddletennis")
    if (!sport) {
      sport = sports.find((s) => {
        const nameSlug = s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const nameSlugNoDash = s.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        return nameSlug === normalizedId || nameSlugNoDash === normalizedId || 
               s.name.toLowerCase().includes(normalizedId) || normalizedId.includes(s.name.toLowerCase());
      });
    }
  }
  
  return sport;
}

/**
 * Get all sports (server-side, for admin)
 */
export async function getAllSportsServer() {
  const client = createServiceRoleClient();
  
  // Fallback to mock data if Supabase is not configured
  if (!client) {
    return mockSports.map((s) => ({
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
 * Get sport by ID (server-side)
 * Accepts UUID string or number (for backward compatibility)
 */
export async function getSportByIdServer(id: number | string) {
  const client = createServiceRoleClient();
  
  // Fallback to mock data if Supabase is not configured
  if (!client) {
    const sport = getMockSportById(id.toString());
    if (!sport) return null;
    return {
      id: sport.id, // UUID string
      name: sport.name,
      description: sport.description,
      image: sport.image,
      created_at: new Date().toISOString(),
    };
  }

  // Convert to string if number (for backward compatibility)
  const sportId = typeof id === 'number' ? id.toString() : id;

  const { data, error } = await (client as any).from("sports").select("*").eq("id", sportId).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Error fetching sport: ${error.message}`);
  }

  return data;
}

/**
 * Create sport (server-side only, admin)
 */
export async function createSportServer(sportData: {
  name: string;
  description: string;
  image: string;
}) {
  const client = createServiceRoleClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to create sports.");
  }
  
  const { data, error } = await (client as any)
    .from("sports")
    .insert({
      name: sportData.name,
      description: sportData.description,
      image: sportData.image,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating sport: ${error.message}`);
  }

  return data;
}

/**
 * Update sport (server-side only, admin)
 * Accepts UUID string or number (for backward compatibility)
 */
export async function updateSportServer(
  id: number | string,
  updates: {
    name?: string;
    description?: string;
    image?: string;
  }
) {
  const client = createServiceRoleClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to update sports.");
  }
  
  // Convert to string if number (for backward compatibility)
  const sportId = typeof id === 'number' ? id.toString() : id;
  
  const { data, error } = await (client as any)
    .from("sports")
    .update(updates)
    .eq("id", sportId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating sport: ${error.message}`);
  }

  return data;
}

/**
 * Delete sport (server-side only, admin)
 * Accepts UUID string or number (for backward compatibility)
 */
export async function deleteSportServer(id: number | string) {
  const client = createServiceRoleClient();
  
  if (!client) {
    throw new Error("Database is not configured. Please set up Supabase to delete sports.");
  }
  
  // Convert to string if number (for backward compatibility)
  const sportId = typeof id === 'number' ? id.toString() : id;
  
  const { error } = await (client as any).from("sports").delete().eq("id", sportId);

  if (error) {
    throw new Error(`Error deleting sport: ${error.message}`);
  }
}
