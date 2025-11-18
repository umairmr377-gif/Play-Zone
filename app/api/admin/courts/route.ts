import { NextRequest, NextResponse } from "next/server";
import {
  createCourt,
  updateCourt,
  deleteCourt,
} from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { logAdminMutation } from "@/lib/audit";
import { logger } from "@/lib/logger";

// POST /api/admin/courts
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { sportId, ...courtData } = body;
    const court = await createCourt(sportId, courtData);
    
    // Log audit event
    const courtId = (court as any)?.id?.toString() || "unknown";
    await logAdminMutation("create", "court", courtId, { name: (court as any)?.name || courtData.name, sportId }, request);
    logger.adminMutation("create", admin.id, "court", courtId, { name: (court as any)?.name || courtData.name });
    
    return NextResponse.json(court, { status: 201 });
  } catch (error: any) {
    logger.error("Error creating court", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to create court" },
      { status: 400 }
    );
  }
}

// PUT /api/admin/courts
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { sportId, courtId, ...updates } = body;
    const court = await updateCourt(sportId, courtId, updates);
    
    // Log audit event
    await logAdminMutation("update", "court", courtId, updates, request);
    logger.adminMutation("update", admin.id, "court", courtId, updates);
    
    return NextResponse.json(court || { success: true });
  } catch (error: any) {
    logger.error("Error updating court", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to update court" },
      { status: 400 }
    );
  }
}

// DELETE /api/admin/courts
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const sportId = searchParams.get("sportId");
    const courtId = searchParams.get("courtId");
    if (!sportId || !courtId) {
      return NextResponse.json(
        { message: "Sport ID and Court ID required" },
        { status: 400 }
      );
    }
    await deleteCourt(sportId, courtId);
    
    // Log audit event
    await logAdminMutation("delete", "court", courtId, { sportId }, request);
    logger.adminMutation("delete", admin.id, "court", courtId, { sportId });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting court", error);
    if (error.message === "Not authenticated" || error.message.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to delete court" },
      { status: 400 }
    );
  }
}

