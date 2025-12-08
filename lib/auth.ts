import { createServerComponentClient } from "./supabaseServer";
import { getServerClient } from "./supabaseServer";
import { getAuthProvider } from "./auth/auth-provider";
import { isSupabaseConfigured } from "./safe-supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface AuthSession {
  user: {
    id: string;
    email?: string;
    role: "user" | "admin";
  } | null;
}

/**
 * Get current auth session (server-side)
 * Works with both Supabase and Local Auth
 */
export async function getServerAuthSession(): Promise<AuthSession> {
  try {
    const useSupabase = isSupabaseConfigured();
    
    if (useSupabase) {
      const supabase = await createServerComponentClient();
      
      // If Supabase is not configured, return no user
      if (!supabase) {
        return { user: null };
      }
      
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return { user: null };
      }

      // Get user profile with role
      let profile = null;
      try {
        const { data, error: profileError } = await (supabase as any)
          .from("profiles")
          .select("role, full_name")
          .eq("id", authUser.id)
          .single();

        // Check if error is due to missing table (404 or table not found)
        const isTableMissing = profileError && (
          profileError.status === 404 ||
          profileError.code === "PGRST116" ||
          profileError.code === "42P01" ||
          (profileError.message && (
            profileError.message.includes("schema cache") ||
            profileError.message.includes("relation") ||
            profileError.message.includes("does not exist") ||
            profileError.message.includes("404")
          ))
        );

        if (!isTableMissing && !profileError && data) {
          profile = data;
        } else if (isTableMissing) {
          // Table doesn't exist - return user with default role (silently)
          return {
            user: {
              id: authUser.id,
              email: authUser.email,
              role: "user",
            },
          };
        }
      } catch (error: any) {
        // Silently handle table missing errors (404s)
        const isTableMissing = error?.status === 404 || 
          error?.message?.includes("404") ||
          error?.code === "PGRST116" ||
          error?.code === "42P01";
        
        if (isTableMissing) {
          // Table doesn't exist - return user with default role
          return {
            user: {
              id: authUser.id,
              email: authUser.email,
              role: "user",
            },
          };
        }
        // For other errors, continue with default role (don't throw)
      }

      if (profileError || !profile || typeof profile !== 'object' || !('role' in profile)) {
        // Profile doesn't exist but table does - try to create one
        try {
          const { error: createError } = await (supabase as any)
            .from("profiles")
            .insert({
              id: authUser.id,
              role: "user",
              full_name: authUser.email?.split("@")[0] || null,
            });

          if (createError) {
            // If creation fails, return user with default role
            return {
              user: {
                id: authUser.id,
                email: authUser.email,
                role: "user",
              },
            };
          }

          return {
            user: {
              id: authUser.id,
              email: authUser.email,
              role: "user",
            },
          };
        } catch (error) {
          // If insert fails (e.g., table doesn't exist), return user with default role
          return {
            user: {
              id: authUser.id,
              email: authUser.email,
              role: "user",
            },
          };
        }
      }

      const profileData = profile as { role: string; full_name?: string | null };
      return {
        user: {
          id: authUser.id,
          email: authUser.email,
          role: (profileData.role as "user" | "admin") || "user",
        },
      };
    } else {
      // Use local auth
      const auth = getAuthProvider();
      const session = await auth.getSession();
      return session;
    }
  } catch (error) {
    console.error("Error getting auth session:", error);
    return { user: null };
  }
}

/**
 * Get current user (server-side)
 * Throws if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerAuthSession();
  if (!session.user) {
    throw new Error("Not authenticated");
  }
  return session.user;
}

/**
 * Require user to be authenticated
 * Throws if not authenticated
 */
export async function requireUser() {
  const user = await getCurrentUser();
  return user;
}

/**
 * Require user to be admin
 * Throws if not authenticated or not admin
 * Redirects to home if not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (user.role !== "admin") {
    redirect("/403");
  }
  
  return user;
}

/**
 * Check if user is admin (server-side)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerAuthSession();
    return session.user?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Get user profile by ID (server-side, admin only)
 * Works with both Supabase and Local Auth
 */
export async function getUserProfile(userId: string) {
  const useSupabase = isSupabaseConfigured();
  
  if (useSupabase) {
    const client = getServerClient();
    if (!client) {
      return null;
    }
    const { data, error } = await (client as any)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Error fetching user profile: ${error.message}`);
    }

    return data;
  } else {
    // Local auth - get user from local storage
    const auth = getAuthProvider();
    if (auth.getAllUsers) {
      const users = await auth.getAllUsers();
      return users.find((u) => u.id === userId) || null;
    }
    return null;
  }
}

/**
 * Update user role (server-side, admin only)
 * Works with both Supabase and Local Auth
 */
export async function updateUserRole(
  userId: string,
  role: "user" | "admin"
) {
  const useSupabase = isSupabaseConfigured();
  
  if (useSupabase) {
    const client = getServerClient();
    if (!client) {
      throw new Error("Supabase is not configured. Cannot update user role.");
    }
    const { data, error } = await (client as any)
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user role: ${error.message}`);
    }

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      full_name: data.full_name,
    };
  } else {
    // Local auth - update role
    const auth = getAuthProvider();
    if (auth.updateUserRole) {
      return await auth.updateUserRole(userId, role);
    } else {
      throw new Error("Role update not supported in local auth");
    }
  }
}

