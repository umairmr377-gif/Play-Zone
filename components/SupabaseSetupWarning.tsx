"use client";

import { createClient } from "@/lib/supabase/client";
import Card from "./Card";
import { AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SupabaseSetupWarning() {
  const supabase = createClient();
  const [isVercel, setIsVercel] = useState(false);
  
  useEffect(() => {
    // Check if deployed on Vercel
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsVercel(
        hostname.includes("vercel.app") ||
        hostname.includes("vercel.com") ||
        process.env.NEXT_PUBLIC_VERCEL === "1"
      );
    }
  }, []);
  
  // Only show if Supabase is not configured
  if (supabase) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-slide-in">
      <Card className="p-4 border border-white/10" hover={false}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white/80" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-display font-semibold text-white mb-2 tracking-tight">
              Supabase Not Configured
            </h3>
            <p className="text-xs text-white/50 mb-4 font-light leading-relaxed">
              Authentication features are disabled. Set up Supabase to enable sign-in and bookings.
              {isVercel && (
                <span className="block mt-2 text-yellow-400/80 font-medium">
                  ⚠️ Deployed on Vercel? Add environment variables in Vercel dashboard (not .env.local)
                </span>
              )}
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/70 hover:text-white font-medium flex items-center gap-1 transition-colors tracking-wide"
              >
                Get Supabase Credentials
                <ExternalLink className="w-3 h-3" />
              </Link>
              {isVercel ? (
                <Link
                  href="/VERCEL_ENV_SETUP.md"
                  className="text-xs text-white/50 hover:text-white/70 font-medium transition-colors tracking-wide"
                >
                  Vercel Setup Instructions →
                </Link>
              ) : (
                <Link
                  href="/QUICK_FIX_SUPABASE.md"
                  className="text-xs text-white/50 hover:text-white/70 font-medium transition-colors tracking-wide"
                >
                  Local Setup Instructions →
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

