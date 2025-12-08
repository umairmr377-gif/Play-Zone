/**
 * Type definitions for Supabase database
 * This file contains only types and can be safely imported in both server and client components
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
          court: string; // TEXT - court name (not UUID foreign key)
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
          court: string; // TEXT - court name (not UUID foreign key)
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
          court?: string; // TEXT - court name (not UUID foreign key)
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
      profiles: {
        Row: {
          id: string; // UUID reference to auth.users
          full_name: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // UUID reference to auth.users
          full_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID reference to auth.users
          full_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string; // UUID
          user_id: string | null; // UUID reference to auth.users
          action: string;
          resource: string;
          resource_id: string | null;
          details: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string; // UUID
          user_id?: string | null; // UUID reference to auth.users
          action: string;
          resource: string;
          resource_id?: string | null;
          details?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string; // UUID
          user_id?: string | null; // UUID reference to auth.users
          action?: string;
          resource?: string;
          resource_id?: string | null;
          details?: Record<string, any> | null;
          created_at?: string;
        };
      };
    };
  };
}

