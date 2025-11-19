import { getPublicClient } from "./supabaseClient";
import { getServerClient, createServerComponentClient } from "./supabaseServer";
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
    // Fallback to public client if server client fails
    client = getPublicClient();
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
          const extraInfo = court.extra_info as any;
          return {
            id: court.id.toString(),
            name: court.name,
            pricePerHour: court.price_per_hour,
            location: court.location || "",
            image: extraInfo?.image || undefined,
            availableTimeSlots: extraInfo?.availableTimeSlots || [],
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
 * Get sport by ID (client-safe)
 * Falls back to mock data if Supabase is not configured
 */
export async function getSportById(id: string): Promise<Sport | undefined> {
  const client = getPublicClient();
  
  // Fallback to mock data if Supabase is not configured
  if (!client) {
    return getMockSportById(id);
  }

  const sports = await getAllSports();
  return sports.find((s) => s.id === id);
}

/**
 * Get all sports (server-side, for admin)
 */
export async function getAllSportsServer() {
  const client = getServerClient();
  
  // Fallback to mock data if Supabase is not configured
  if (!client) {
    return mockSports.map((s) => ({
      id: parseInt(s.id) || 0,
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
 * Get sport by ID (server-side)
 */
export async function getSportByIdServer(id: number) {
  const client = getServerClient();
  
  // Fallback to mock data if Supabase is not configured
  if (!client) {
    const sport = getMockSportById(id.toString());
    if (!sport) return null;
    return {
      id: parseInt(sport.id) || 0,
      name: sport.name,
      description: sport.description,
      image: sport.image,
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await (client as any).from("sports").select("*").eq("id", id).single();

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
  const client = getServerClient();
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
 */
export async function updateSportServer(
  id: number,
  updates: {
    name?: string;
    description?: string;
    image?: string;
  }
) {
  const client = getServerClient();
  const { data, error } = await (client as any)
    .from("sports")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating sport: ${error.message}`);
  }

  return data;
}

/**
 * Delete sport (server-side only, admin)
 */
export async function deleteSportServer(id: number) {
  const client = getServerClient();
  const { error } = await (client as any).from("sports").delete().eq("id", id);

  if (error) {
    throw new Error(`Error deleting sport: ${error.message}`);
  }
}
