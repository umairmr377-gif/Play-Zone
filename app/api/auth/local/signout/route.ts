import { NextRequest, NextResponse } from "next/server";
import { localSignOut } from "@/lib/auth/local-auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("local-auth-session")?.value;

    if (sessionToken) {
      await localSignOut(sessionToken);
    }

    // Clear session cookie
    cookieStore.delete("local-auth-session");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to sign out" },
      { status: 500 }
    );
  }
}

