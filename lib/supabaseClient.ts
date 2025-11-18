import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Get public Supabase client for client-side use
 * Uses public anon key - safe for client-side reads
 * This is a wrapper that ensures the client is created correctly
 * Returns null if environment variables are not configured (for development)
 */
export function getPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if we have valid (non-placeholder) values
  if (!url || !anonKey || url.includes("placeholder") || anonKey.includes("placeholder")) {
    return null;
  }

  return createClient(url, anonKey);
}

/**
 * Type definitions for Supabase database
 */
export interface Database {
  public: {
    Tables: {
      sports: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          image: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          image?: string | null;
          created_at?: string;
        };
      };
      courts: {
        Row: {
          id: number;
          sport_id: number;
          name: string;
          price_per_hour: number;
          location: string | null;
          extra_info: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          sport_id: number;
          name: string;
          price_per_hour: number;
          location?: string | null;
          extra_info?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          sport_id?: number;
          name?: string;
          price_per_hour?: number;
          location?: string | null;
          extra_info?: Record<string, any> | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: number;
          sport_id: number;
          court_id: number;
          date: string;
          time_slot: string;
          user_name: string | null;
          status: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          sport_id: number;
          court_id: number;
          date: string;
          time_slot: string;
          user_name?: string | null;
          status?: string;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          sport_id?: number;
          court_id?: number;
          date?: string;
          time_slot?: string;
          user_name?: string | null;
          status?: string;
          price?: number;
          created_at?: string;
        };
      };
    };
  };
}

