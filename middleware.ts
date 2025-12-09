import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { analyzeProfileError, getDefaultProfile } from "./lib/utils/profile-error-handler";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Skip health endpoint
  if (request.nextUrl.pathname.startsWith("/api/health")) return response;

  // Require Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response; // Gracefully skip auth checks if Supabase not configured
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    } as any, // Edge Runtime uses getAll/setAll, not get/set/remove
  });

  // Admin route protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Fetch profile → determine role
    let profile: { role: "user" | "admin" } | null = null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // Use unified error analysis
      const errorAnalysis = analyzeProfileError(error, false);

      if (!error && data) {
        // Valid profile found
        profile = { role: (data.role as "user" | "admin") || "user" };
      } else if (errorAnalysis.isRowMissing) {
        // User has no profile → treat as normal user
        profile = getDefaultProfile();
      } else if (errorAnalysis.isTableMissing) {
        // Profiles table missing → treat as user (silent)
        profile = getDefaultProfile();
      } else if (error) {
        // Unknown error → log only in dev, default to user
        if (process.env.NODE_ENV === "development") {
          console.warn("Profile fetch error in middleware:", error.message);
        }
        profile = getDefaultProfile();
      }
    } catch (err: any) {
      // Extreme fallback - default to user
      profile = getDefaultProfile();
    }

    const userRole = profile?.role === "admin" ? "admin" : "user";

    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
