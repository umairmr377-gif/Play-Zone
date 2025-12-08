import { createServerComponentClient } from "./supabaseServer";
import { getServerClient } from "./supabaseServer";
import { getAuthProvider } from "./auth/auth-provider";
import { isSupabaseConfigured } from "./safe-supabase";
import { redirect } from "next/navigation";

export interface AuthSession {
  user: {
    id: string;
    email?: string;
    role: "user" | "admin";
  } | null;
}

/* -----------------------------------------------------
   SERVER AUTH SESSION (SUPABASE + FALLBACK LOCAL AUTH)
----------------------------------------------------- */
export async function getServerAuthSession(): Promise<AuthSession> {
  try {
    const useSupabase = isSupabaseConfigured();

    // 🟦 If using Supabase
    if (useSupabase) {
      const supabase = await createServerComponentClient();
      if (!supabase) return { user: null };

      const {
        data: { user: authUser },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr || !authUser) return { user: null };

      /* -----------------------------------------
         FETCH PROFILE (SAFE FOR MISSING TABLE)
      ----------------------------------------- */
      let profile: any = null;

      // Check server-side cache before making query
      let shouldSkipQuery = false;
      try {
        const { shouldSkipProfilesQueryServer } = await import("@/lib/utils/profiles-cache");
        shouldSkipQuery = shouldSkipProfilesQueryServer();
      } catch {
        // Cache utility not available - continue with query
      }

      let profileData: any = null;
      let profileFetchError: any = null;

      if (!shouldSkipQuery) {
        const result = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", authUser.id)
          .single();
        
        profileData = result.data;
        profileFetchError = result.error;
      }

      const tableMissing =
        profileFetchError &&
        (
          profileFetchError.code === "42P01" || // table missing
          profileFetchError.code === "PGRST116" || // resource not found
          profileFetchError.message?.includes("does not exist") ||
          profileFetchError.message?.includes("404") ||
          profileFetchError.message?.includes("relation")
        );

      // Update server-side cache if table is missing
      if (tableMissing) {
        try {
          const { setServerProfilesTableCache } = await import("@/lib/utils/profiles-cache");
          setServerProfilesTableCache(false);
        } catch {
          // Cache utility not available - ignore
        }
        // Table missing → user still logs in with default role
        return {
          user: {
            id: authUser.id,
            email: authUser.email,
            role: "user",
          },
        };
      }

      if (!profileFetchError && profileData) {
        profile = profileData;
        // Update cache that table exists
        try {
          const { setServerProfilesTableCache } = await import("@/lib/utils/profiles-cache");
          setServerProfilesTableCache(true);
        } catch {
          // Cache utility not available - ignore
        }
      }

      /* -----------------------------------------
         HANDLE MISSING PROFILE ROW
      ----------------------------------------- */
      if (!profile) {
        // Check cache before attempting insert (if table doesn't exist, skip insert)
        let skipInsert = false;
        try {
          const { shouldSkipProfilesQueryServer } = await import("@/lib/utils/profiles-cache");
          skipInsert = shouldSkipProfilesQueryServer();
        } catch {
          // Cache utility not available - continue with insert attempt
        }

        if (!skipInsert) {
          const { error: createErr } = await supabase
            .from("profiles")
            .insert({
              id: authUser.id,
              role: "user",
              full_name: authUser.email?.split("@")[0] || null,
            });

          // If insert fails due to missing table, update cache
          if (createErr && (
            createErr.code === "42P01" ||
            createErr.code === "PGRST116" ||
            createErr.message?.includes("does not exist") ||
            createErr.message?.includes("404") ||
            createErr.message?.includes("relation")
          )) {
            try {
              const { setServerProfilesTableCache } = await import("@/lib/utils/profiles-cache");
              setServerProfilesTableCache(false);
            } catch {
              // Cache utility not available - ignore
            }
          }
        }

        // If profile creation fails → still return safe user
        return {
          user: {
            id: authUser.id,
            email: authUser.email,
            role: "user",
          },
        };
      }

      // ✅ Return final user
      return {
        user: {
          id: authUser.id,
          email: authUser.email,
          role: (profile.role as "user" | "admin") || "user",
        },
      };
    }

    /* -----------------------------------------
       FALLBACK: LOCAL AUTH SYSTEM
    ----------------------------------------- */
    const auth = getAuthProvider();
    const session = await auth.getSession();
    return session;

  } catch (e) {
    console.error("Auth error:", e);
    return { user: null };
  }
}

/* -----------------------------------------------------
   HELPERS
----------------------------------------------------- */

export async function getCurrentUser() {
  const session = await getServerAuthSession();
  if (!session.user) throw new Error("Not authenticated");
  return session.user;
}

export async function requireUser() {
  return await getCurrentUser();
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "admin") redirect("/403");
  return user;
}

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerAuthSession();
    return session.user?.role === "admin";
  } catch {
    return false;
  }
}

/* -----------------------------------------------------
   GET USER PROFILE (ADMIN ONLY)
----------------------------------------------------- */
export async function getUserProfile(userId: string) {
  const useSupabase = isSupabaseConfigured();

  if (useSupabase) {
    const client = getServerClient();
    if (!client) return null;

    // Check server-side cache before making query
    let shouldSkipQuery = false;
    try {
      const { shouldSkipProfilesQueryServer } = await import("@/lib/utils/profiles-cache");
      shouldSkipQuery = shouldSkipProfilesQueryServer();
    } catch {
      // Cache utility not available - continue with query
    }

    if (shouldSkipQuery) {
      return null; // Table doesn't exist, return null
    }

    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Check if error is due to missing table
      const tableMissing =
        error.code === "42P01" ||
        error.code === "PGRST116" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("404") ||
        error.message?.includes("relation");

      if (tableMissing) {
        // Update cache and return null
        try {
          const { setServerProfilesTableCache } = await import("@/lib/utils/profiles-cache");
          setServerProfilesTableCache(false);
        } catch {
          // Cache utility not available - ignore
        }
        return null;
      }
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
    return data;
  }

  const auth = getAuthProvider();
  if (auth.getAllUsers) {
    const users = await auth.getAllUsers();
    return users.find((u) => u.id === userId) || null;
  }

  return null;
}

/* -----------------------------------------------------
   UPDATE USER ROLE (ADMIN ONLY)
----------------------------------------------------- */
export async function updateUserRole(userId: string, role: "user" | "admin") {
  const useSupabase = isSupabaseConfigured();

  if (useSupabase) {
    const client = getServerClient();
    if (!client) throw new Error("Supabase not configured.");

    // Check server-side cache before making query
    let shouldSkipQuery = false;
    try {
      const { shouldSkipProfilesQueryServer } = await import("@/lib/utils/profiles-cache");
      shouldSkipQuery = shouldSkipProfilesQueryServer();
    } catch {
      // Cache utility not available - continue with query
    }

    if (shouldSkipQuery) {
      throw new Error("Profiles table does not exist");
    }

    const { data, error } = await (client as any)
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      // Check if error is due to missing table
      const tableMissing =
        error.code === "42P01" ||
        error.code === "PGRST116" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("404") ||
        error.message?.includes("relation");

      if (tableMissing) {
        // Update cache
        try {
          const { setServerProfilesTableCache } = await import("@/lib/utils/profiles-cache");
          setServerProfilesTableCache(false);
        } catch {
          // Cache utility not available - ignore
        }
        throw new Error("Profiles table does not exist");
      }
      throw new Error(`Error updating role: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from update");
    }

    const profileData = data as { id: string; email: string; role: string; full_name: string | null };
    return {
      id: profileData.id,
      email: profileData.email,
      role: profileData.role,
      full_name: profileData.full_name,
    };
  }

  const auth = getAuthProvider();
  if (auth.updateUserRole) {
    return await auth.updateUserRole(userId, role);
  }

  throw new Error("Role update not supported in local auth");
}
