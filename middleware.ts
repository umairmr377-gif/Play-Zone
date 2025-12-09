import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Add Strict-Transport-Security in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Skip auth checks for health endpoints
  if (request.nextUrl.pathname.startsWith("/api/health")) {
    return response;
  }

  // Supabase is required - throw error if not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables missing");
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach((cookie: any) => {
            const { name, value, options } = cookie;
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach((cookie: any) => {
            const { name, value, options } = cookie;
            response.cookies.set(name, value, options);
          });
        },
      } as any,
    }
  );

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is admin (silently handle 404s)
    let profile = null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      // Check if error is 404 or table missing (suppress these errors)
      // PGRST116 from SELECT = row missing, not table missing
      // Only treat as table-missing if message mentions relation/table
      const errorMessage = String(error?.message || "").toLowerCase();
      const isTableMissing = error && (
        (error as any)?.status === 404 ||
        error.code === "42P01" ||
        (error.code === "PGRST116" && (
          errorMessage.includes("relation") ||
          errorMessage.includes("table") ||
          errorMessage.includes("schema cache")
        )) ||
        (errorMessage && (
          errorMessage.includes("404") ||
          errorMessage.includes("schema cache") ||
          errorMessage.includes("relation") ||
          errorMessage.includes("table") ||
          errorMessage.includes("does not exist")
        ))
      );
      
      // Only use profile if no error or error is not a 404/table missing
      if (!isTableMissing && !error && data) {
        profile = data;
      }
      // Silently ignore 404/table missing errors
    } catch (error: any) {
      // Silently handle table missing errors (404s) - don't log to console
      // PGRST116 from SELECT = row missing, not table missing
      const errorMessage = String(error?.message || "").toLowerCase();
      const isTableMissing = 
        (error as any)?.status === 404 || 
        error?.code === "42P01" ||
        (error?.code === "PGRST116" && (
          errorMessage.includes("relation") ||
          errorMessage.includes("table") ||
          errorMessage.includes("schema cache")
        )) ||
        errorMessage.includes("404") ||
        errorMessage.includes("does not exist") ||
        errorMessage.includes("relation") ||
        errorMessage.includes("table");
      
      // Silently ignore if table is missing (default to user role)
      if (!isTableMissing && process.env.NODE_ENV === 'development') {
        console.warn("Profile fetch error in middleware:", error?.message);
      }
    }

    const userRole = (profile?.role as "user" | "admin") || "user";

    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Add other protected routes here
  ],
};