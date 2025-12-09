import { createServerComponentClient } from "./supabaseServer";
import { getServerClient } from "./supabaseServer";
import { getAuthProvider } from "./auth/auth-provider";
import { isSupabaseConfigured } from "./safe-supabase";
import { redirect } from "next/navigation";
import { analyzeProfileError, getDefaultProfile } from "./utils/profile-error-handler";

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

      // Use unified error analysis
      const errorAnalysis = analyzeProfileError(profileFetchError, false);

      // Update server-side cache if table is missing
      if (errorAnalysis.isTableMissing) {
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
        // Row missing (PGRST116) - try to create profile
        // Skip insert if we know table doesn't exist
        if (!errorAnalysis.shouldSkipQuery && errorAnalysis.isRowMissing) {
          try {
            const { error: createErr } = await supabase
              .from("profiles")
              .insert({
                id: authUser.id,
                role: "user",
                full_name: authUser.email?.split("@")[0] || null,
              });

            // If insert succeeds, fetch the new profile
            if (!createErr) {
              const { data: newProfile } = await supabase
                .from("profiles")
                .select("role, full_name")
                .eq("id", authUser.id)
                .single();
              
              if (newProfile) {
                profile = newProfile;
              }
            } else {
              // If insert fails due to missing table, update cache
              const insertErrorAnalysis = analyzeProfileError(createErr, true);
              if (insertErrorAnalysis.isTableMissing) {
                try {
                  const { setServerProfilesTableCache } = await import("@/lib/utils/profiles-cache");
                  setServerProfilesTableCache(false);
                } catch {
                  // Cache utility not available - ignore
                }
              }
            }
          } catch (insertErr) {
            // Insert failed - continue with default role
          }
        }

        // If profile creation fails → still return safe user
        if (!profile) {
          return {
            user: {
              id: authUser.id,
              email: authUser.email,
              role: "user",
            },
          };
        }
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
      // Use unified error analysis
      const errorAnalysis = analyzeProfileError(error, false);

      if (errorAnalysis.isTableMissing) {
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
      // Use unified error analysis
      const errorAnalysis = analyzeProfileError(error, false);

      if (errorAnalysis.isTableMissing) {
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
