import { getPublicClient } from "./supabaseClient";
import { getServerClient } from "./supabaseServer";
import { Court } from "@/data/types";
import { getSportById as getMockSportById } from "@/data/sports";

/**
 * Get courts by sport ID (client-safe)
 * Falls back to mock data if Supabase is not configured
 */
export async function getCourtsBySport(sportId: string): Promise<Court[]> {
  const client = getPublicClient();

  // Fallback to mock data if Supabase is not configured
  if (!client) {
    const sport = getMockSportById(sportId);
    return sport?.courts || [];
  }

  const { data, error } = await (client as any)
    .from("courts")
    .select("*")
    .eq("sport_id", parseInt(sportId))
    .order("id");

  if (error) {
    throw new Error(`Error fetching courts: ${error.message}`);
  }

  return (data || []).map((court: any) => {
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
}

/**
 * Get court by ID (client-safe)
 * Falls back to mock data if Supabase is not configured
 */
export async function getCourtById(
  sportId: string,
  courtId: string
): Promise<Court | undefined> {
  const client = getPublicClient();
  
  // Fallback to mock data if Supabase is not configured
  if (!client) {
    const sport = getMockSportById(sportId);
    return sport?.courts.find((c) => c.id === courtId);
  }

  const courts = await getCourtsBySport(sportId);
  return courts.find((c) => c.id === courtId);
}

/**
 * Get court by ID (server-side)
 */
export async function getCourtByIdServer(courtId: number) {
  const client = getServerClient();
  const { data, error } = await (client as any)
    .from("courts")
    .select("*")
    .eq("id", courtId)
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
 */
export async function createCourtServer(
  sportId: number,
  courtData: {
    name: string;
    pricePerHour: number;
    location: string;
    image?: string;
    availableTimeSlots: string[];
  }
) {
  const client = getServerClient();
  const { data, error } = await (client as any)
    .from("courts")
    .insert({
      sport_id: sportId,
      name: courtData.name,
      price_per_hour: courtData.pricePerHour,
      location: courtData.location,
      extra_info: {
        image: courtData.image,
        availableTimeSlots: courtData.availableTimeSlots,
      },
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
 */
export async function updateCourtServer(
  courtId: number,
  updates: {
    name?: string;
    pricePerHour?: number;
    location?: string;
    image?: string;
    availableTimeSlots?: string[];
  }
) {
  const client = getServerClient();

  const extraInfo: any = {};
  if (updates.image !== undefined) {
    extraInfo.image = updates.image;
  }
  if (updates.availableTimeSlots !== undefined) {
    extraInfo.availableTimeSlots = updates.availableTimeSlots;
  }

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.pricePerHour !== undefined)
    updateData.price_per_hour = updates.pricePerHour;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (Object.keys(extraInfo).length > 0) {
    // Merge with existing extra_info
    const { data: existing } = await (client as any)
      .from("courts")
      .select("extra_info")
      .eq("id", courtId)
      .single();
    updateData.extra_info = { ...(existing?.extra_info || {}), ...extraInfo };
  }

  const { data, error } = await (client as any)
    .from("courts")
    .update(updateData)
    .eq("id", courtId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating court: ${error.message}`);
  }

  return data;
}

/**
 * Delete court (server-side only, admin)
 */
export async function deleteCourtServer(courtId: number) {
  const client = getServerClient();
  const { error } = await (client as any).from("courts").delete().eq("id", courtId);

  if (error) {
    throw new Error(`Error deleting court: ${error.message}`);
  }
}
