import { createServerComponentClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";

  if (code) {
    const supabase = await createServerComponentClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
    // If Supabase is not configured, just redirect (auth won't work but page won't crash)
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}

