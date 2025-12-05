import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get public Supabase client for client-side use
 * Uses public anon key - safe for client-side reads
 * This is a wrapper that ensures the client is created correctly with SSR support
 * Returns null if environment variables are not configured (for development)
 */
export function getPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables are present and not placeholders
  if (!url || !anonKey) {
    console.warn("⚠️ Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return null;
  }

  if (url.includes("placeholder") || anonKey.includes("placeholder") || 
      url.includes("your-project") || anonKey.includes("your-anon")) {
    console.warn("⚠️ Supabase env vars contain placeholder values");
    return null;
  }

  // Use createBrowserClient for proper SSR/cookie handling in Next.js
  return createBrowserClient<Database>(url, anonKey);
}

/**
 * Type definitions for Supabase database
 */
export interface Database {
  public: {
    Tables: {
      sports: {
        Row: {
          id: string; // UUID
          name: string;
          description: string | null;
          image: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string; // UUID
          name: string;
          description?: string | null;
          image?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string; // UUID
          name?: string;
          description?: string | null;
          image?: string | null;
          icon?: string | null;
          created_at?: string;
        };
      };
      courts: {
        Row: {
          id: string; // UUID
          sport_id: string; // UUID reference to sports
          name: string;
          location: string | null;
          price_per_hour: number; // NUMERIC(10, 2)
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string; // UUID
          sport_id: string; // UUID reference to sports
          name: string;
          location?: string | null;
          price_per_hour: number; // NUMERIC(10, 2)
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string; // UUID
          sport_id?: string; // UUID reference to sports
          name?: string;
          location?: string | null;
          price_per_hour?: number; // NUMERIC(10, 2)
          image_url?: string | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string; // UUID
          user_id: string | null; // UUID reference to auth.users
          court_id: string; // UUID reference to courts
          date: string; // DATE
          start_time: string; // TIME
          end_time: string; // TIME
          status: "pending" | "confirmed" | "cancelled" | "completed";
          price: number; // NUMERIC(10, 2)
          customer_name: string | null;
          customer_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string; // UUID
          user_id?: string | null; // UUID reference to auth.users
          court_id: string; // UUID reference to courts
          date: string; // DATE
          start_time: string; // TIME
          end_time: string; // TIME
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          price: number; // NUMERIC(10, 2)
          customer_name?: string | null;
          customer_email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string; // UUID
          user_id?: string | null; // UUID reference to auth.users
          court_id?: string; // UUID reference to courts
          date?: string; // DATE
          start_time?: string; // TIME
          end_time?: string; // TIME
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          price?: number; // NUMERIC(10, 2)
          customer_name?: string | null;
          customer_email?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

