"use client";

import { AlertTriangle } from "lucide-react";
import Card from "./ui/Card";
import Link from "next/link";

export default function SupabaseWarning() {
  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200 border-2 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">
            Supabase Not Configured
          </h3>
          <p className="text-sm text-yellow-700 mb-2">
            The app is running with mock data. To enable full functionality (authentication, bookings, admin features), please configure Supabase.
          </p>
          <Link
            href="/SETUP_SUPABASE.md"
            className="text-sm text-yellow-800 underline hover:text-yellow-900"
            target="_blank"
          >
            View Setup Instructions →
          </Link>
        </div>
      </div>
    </Card>
  );
}

