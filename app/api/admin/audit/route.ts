import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Force dynamic rendering for routes using cookies/sessions
export const dynamic = "force-dynamic";

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/admin/audit - Get audit logs
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const client = createServiceRoleClient();

    // Return empty array if Supabase is not configured
    if (!client) {
      return NextResponse.json({ logs: [] });
    }

    let query = client.from("audit_logs").select("*");

    const action = searchParams.get("action");
    const resource = searchParams.get("resource");
    const search = searchParams.get("search");

    if (action) {
      query = query.eq("action", action);
    }
    if (resource) {
      query = query.eq("resource", resource);
    }
    if (search) {
      query = query.or(`resource_id.ilike.%${search}%,user_id.ilike.%${search}%`);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(1000); // Limit to last 1000 logs

    if (error) {
      throw new Error(`Error fetching audit logs: ${error.message}`);
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

