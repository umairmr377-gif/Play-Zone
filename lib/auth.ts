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

      const {
        data: profileData,
        error: profileFetchError,
      } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", authUser.id)
        .single();

      const tableMissing =
        profileFetchError &&
        (
          profileFetchError.code === "42P01" || // table missing
          profileFetchError.code === "PGRST116" || // resource not found
          profileFetchError.message?.includes("does not exist") ||
          profileFetchError.message?.includes("404") ||
          profileFetchError.message?.includes("relation")
        );

      if (!profileFetchError && profileData) {
        profile = profileData;
      } else if (tableMissing) {
        // Table missing → user still logs in with default role
        return {
          user: {
            id: authUser.id,
            email: authUser.email,
            role: "user",
          },
        };
      }

      /* -----------------------------------------
         HANDLE MISSING PROFILE ROW
      ----------------------------------------- */
      if (!profile) {
        const { error: createErr } = await supabase
          .from("profiles")
          .insert({
            id: authUser.id,
            role: "user",
            full_name: authUser.email?.split("@")[0] || null,
          });

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

    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error(`Error fetching user profile: ${error.message}`);
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

    const { data, error } = await client
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(`Error updating role: ${error.message}`);

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      full_name: data.full_name,
    };
  }

  const auth = getAuthProvider();
  if (auth.updateUserRole) {
    return await auth.updateUserRole(userId, role);
  }

  throw new Error("Role update not supported in local auth");
}
