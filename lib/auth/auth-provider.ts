/**
 * Auth Provider Abstraction
 * Automatically switches between Supabase Auth and Local Auth
 * based on configuration
 */

import { getPublicClient } from "../supabaseClient";
import { isSupabaseConfigured } from "../safe-supabase";
import {
  localSignUp,
  localSignIn,
  localGetUser,
  localSignOut,
  localUpdateUserRole,
  localGetAllUsers,
  LocalUser,
  getLocalSession,
  LocalSession,
} from "./local-auth";

export interface AuthUser {
  id: string;
  email?: string;
  role: "user" | "admin";
  full_name?: string;
}

export interface AuthProvider {
  signUp: (email: string, password: string, fullName?: string) => Promise<{ user: AuthUser; sessionToken?: string }>;
  signIn: (email: string, password: string) => Promise<{ user: AuthUser; sessionToken?: string }>;
  signOut: (sessionToken?: string) => Promise<void>;
  getUser: () => Promise<AuthUser | null>;
  getSession: () => Promise<{ user: AuthUser | null }>;
  updateUserRole?: (userId: string, role: "user" | "admin") => Promise<AuthUser>;
  getAllUsers?: () => Promise<AuthUser[]>;
}

/**
 * Get the appropriate auth provider
 * Returns Supabase auth if configured, otherwise local auth
 */
export function getAuthProvider(): AuthProvider {
  const useSupabase = isSupabaseConfigured();
  
  if (useSupabase) {
    return getSupabaseAuthProvider();
  } else {
    return getLocalAuthProvider();
  }
}

/**
 * Supabase Auth Provider
 */
function getSupabaseAuthProvider(): AuthProvider {
  return {
    async signUp(email: string, password: string, fullName?: string) {
      const supabase = getPublicClient();
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || "",
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
        },
      });
      
      if (error) throw error;
      if (!data.user) throw new Error("Failed to create user");
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: "user",
          full_name: fullName,
        },
      };
    },
    
    async signIn(email: string, password: string) {
      const supabase = getPublicClient();
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error("Failed to sign in");
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: "user", // Will be fetched from profile
          full_name: data.user.user_metadata?.full_name,
        },
      };
    },
    
    async signOut() {
      const supabase = getPublicClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    },
    
    async getUser() {
      const supabase = getPublicClient();
      if (!supabase) {
        return null;
      }
      
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      
      if (!authUser) {
        return null;
      }
      
      // Fetch profile for role
      let profile = null;
      try {
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("role, full_name")
          .eq("id", authUser.id)
          .single();
        
        // Only use profile if no error or error is not a 404/table missing
        // PostgrestError doesn't have status property, only code
        if (!error || (error.code !== "PGRST116" && error.code !== "42P01")) {
          profile = data;
        }
      } catch {
        // Table doesn't exist - use defaults
      }
      
      return {
        id: authUser.id,
        email: authUser.email,
        role: (profile?.role as "user" | "admin") || "user",
        full_name: profile?.full_name || authUser.user_metadata?.full_name,
      };
    },
    
    async getSession() {
      const supabase = getPublicClient();
      if (!supabase) {
        return { user: null };
      }
      
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { user: null };
      }
      
      // Fetch profile for role
      let profile = null;
      try {
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single();
        
        // Only use profile if no error or error is not a 404/table missing
        // PostgrestError doesn't have status property, only code
        if (!error || (error.code !== "PGRST116" && error.code !== "42P01")) {
          profile = data;
        }
      } catch {
        // Table doesn't exist - use defaults
      }
      
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: (profile?.role as "user" | "admin") || "user",
          full_name: profile?.full_name || session.user.user_metadata?.full_name,
        },
      };
    },
  };
}

/**
 * Local Auth Provider
 */
function getLocalAuthProvider(): AuthProvider {
  return {
    async signUp(email: string, password: string, fullName?: string) {
      const result = await localSignUp(email, password, fullName || email.split("@")[0]);
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          full_name: result.user.full_name,
        },
        sessionToken: result.sessionToken,
      };
    },
    
    async signIn(email: string, password: string) {
      const result = await localSignIn(email, password);
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          full_name: result.user.full_name,
        },
        sessionToken: result.sessionToken,
      };
    },
    
    async signOut(sessionToken?: string) {
      if (sessionToken) {
        await localSignOut(sessionToken);
      }
    },
    
    async getUser() {
      const user = await localGetUser();
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      };
    },
    
    async getSession() {
      const session = await getLocalSession();
      if (!session) {
        return { user: null };
      }
      
      const user = await localGetUser();
      if (!user) {
        return { user: null };
      }
      
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
        },
      };
    },
    
    async updateUserRole(userId: string, role: "user" | "admin") {
      const user = await localUpdateUserRole(userId, role);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      };
    },
    
    async getAllUsers() {
      const users = await localGetAllUsers();
      return users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        full_name: u.full_name,
      }));
    },
  };
}

