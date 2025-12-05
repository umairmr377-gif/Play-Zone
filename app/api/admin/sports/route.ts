import { NextRequest, NextResponse } from "next/server";
import {
  getAllSports,
  getAllSportsRaw,
  createSport,
  updateSport,
  deleteSport,
} from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { logAdminMutation } from "@/lib/audit";

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';
import { logger } from "@/lib/logger";

// GET /api/admin/sports
export async function GET() {
  try {
    // Return full Sport objects with courts for admin UI
    const sports = await getAllSports();
    return NextResponse.json({ sports });
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json(
      { message: "Failed to fetch sports" },
      { status: 500 }
    );
  }
}

// POST /api/admin/sports
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const sport = await createSport(body);
    
    // Log audit event
    const sportId = (sport as any)?.id?.toString() || "unknown";
    await logAdminMutation("create", "sport", sportId, { name: (sport as any)?.name || body.name }, request);
    logger.adminMutation("create", admin.id, "sport", sportId, { name: (sport as any)?.name || body.name });
    
    return NextResponse.json(sport, { status: 201 });
  } catch (error: any) {
    logger.error("Error creating sport", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to create sport" },
      { status: 400 }
    );
  }
}

// PUT /api/admin/sports
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { id, ...updates } = body;
    const sport = await updateSport(id, updates);
    
    // Log audit event
    await logAdminMutation("update", "sport", id, updates, request);
    logger.adminMutation("update", admin.id, "sport", id, updates);
    
    return NextResponse.json(sport);
  } catch (error: any) {
    logger.error("Error updating sport", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to update sport" },
      { status: 400 }
    );
  }
}

// DELETE /api/admin/sports
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { message: "Sport ID required" },
        { status: 400 }
      );
    }
    await deleteSport(id);
    
    // Log audit event
    await logAdminMutation("delete", "sport", id, {}, request);
    logger.adminMutation("delete", admin.id, "sport", id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting sport", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to delete sport" },
      { status: 400 }
    );
  }
}

