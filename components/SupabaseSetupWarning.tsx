"use client";

import { createClient } from "@/lib/supabase/client";
import Card from "./Card";
import { AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SupabaseSetupWarning() {
  const supabase = createClient();
  
  // Only show if Supabase is not configured
  if (supabase) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-slide-in">
      <Card className="p-4 border-2 border-primary/30 bg-primary/10" hover={false}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary mb-1">
              Supabase Not Configured
            </h3>
            <p className="text-xs text-text-secondary mb-3">
              Authentication features are disabled. Set up Supabase to enable sign-in and bookings.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary-light font-medium flex items-center gap-1"
              >
                Get Supabase Credentials
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/QUICK_FIX_SUPABASE.md"
                className="text-xs text-text-secondary hover:text-text-primary font-medium"
              >
                View Setup Instructions →
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

