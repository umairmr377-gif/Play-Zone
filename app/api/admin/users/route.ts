import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getUserProfile, updateUserRole } from "@/lib/auth";
import { getServerClient } from "@/lib/supabaseServer";
import { getAuthProvider } from "@/lib/auth/auth-provider";
import { isSupabaseConfigured } from "@/lib/safe-supabase";
import { logAdminMutation } from "@/lib/audit";
import { logger } from "@/lib/logger";

// Force Node.js runtime for Supabase and process.env compatibility
export const runtime = 'nodejs';

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const useSupabase = isSupabaseConfigured();
    
    if (useSupabase) {
      const client = getServerClient();
      if (!client) {
        return NextResponse.json({ users: [] });
      }
      
      const { data, error } = await (client as any)
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Error fetching users: ${error.message}`);
      }

      return NextResponse.json({ users: data || [] });
    } else {
      // Local auth - get all users
      const auth = getAuthProvider();
      if (auth.getAllUsers) {
        const users = await auth.getAllUsers();
        return NextResponse.json({ 
          users: users.map(u => ({
            id: u.id,
            full_name: u.full_name,
            role: u.role,
            created_at: new Date().toISOString(), // Local users don't have created_at
          }))
        });
      }
      return NextResponse.json({ users: [] });
    }
  } catch (error: any) {
    console.error("Error fetching users:", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update user role
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { message: "User ID and role required" },
        { status: 400 }
      );
    }

    if (role !== "user" && role !== "admin") {
      return NextResponse.json(
        { message: "Invalid role. Must be 'user' or 'admin'" },
        { status: 400 }
      );
    }

    const useSupabase = isSupabaseConfigured();
    let updated;
    
    if (useSupabase) {
      updated = await updateUserRole(userId, role);
    } else {
      // Local auth - update role
      const auth = getAuthProvider();
      if (auth.updateUserRole) {
        updated = await auth.updateUserRole(userId, role);
      } else {
        throw new Error("Role update not supported in local auth");
      }
    }
    
    // Log audit event
    const action = role === "admin" ? "promote" : "demote";
    await logAdminMutation(action, "user", userId, { role }, request);
    logger.adminMutation(action, admin.id, "user", userId, { role });
    logger.authEvent(action, userId, { adminId: admin.id });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    logger.error("Error updating user role", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to update user role" },
      { status: 400 }
    );
  }
}

// POST /api/admin/users/invite - Invite user by email
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email required" },
        { status: 400 }
      );
    }

    const client = getServerClient();
    
    if (!client) {
      return NextResponse.json(
        { message: "Supabase is not configured. Cannot invite users." },
        { status: 503 }
      );
    }
    
    // Send magic link invitation
    const { data, error } = await client.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    });

    if (error) {
      throw new Error(`Error inviting user: ${error.message}`);
    }

    // Log audit event
    await logAdminMutation("invite", "user", data.user?.id || email, { email }, request);
    logger.adminMutation("invite", admin.id, "user", data.user?.id || email, { email });
    
    return NextResponse.json({ 
      message: "Invitation sent successfully",
      user: data.user 
    });
  } catch (error: any) {
    logger.error("Error inviting user", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to invite user" },
      { status: 400 }
    );
  }
}

