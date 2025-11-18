import { NextRequest, NextResponse } from "next/server";
import { localGetUser } from "@/lib/auth/local-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await localGetUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 500 }
    );
  }
}

