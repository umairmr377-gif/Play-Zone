import { NextRequest, NextResponse } from "next/server";
import { localSignUp } from "@/lib/auth/local-auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await localSignUp(email, password, fullName || email.split("@")[0]);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("local-auth-session", result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        full_name: result.user.full_name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to sign up" },
      { status: 400 }
    );
  }
}

