"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "./Button";
import { User, LogOut, Settings, Calendar } from "lucide-react";
import {
  shouldSkipProfilesQuery,
  setProfilesTableExists,
  setSessionTableMissing,
} from "@/lib/utils/profiles-cache";

interface UserProfile {
  id: string;
  email?: string;
  role: "user" | "admin";
  full_name?: string;
}

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const supabase = createClient();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const checkUser = async () => {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        // Don't return early - let finally block reset isCheckingRef.current
      } else {
        let profile = null;

        const skipQuery = shouldSkipProfilesQuery();

        if (!skipQuery) {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("role, full_name")
              .eq("id", authUser.id)
              .single();

            if (!error && data) {
              profile = data;
              setProfilesTableExists(true);
            } else if (error) {
              const errorMessage = String(error.message || "").toLowerCase();

              // PGRST116 from SELECT = row missing, not table missing
              // Only treat as table-missing if message mentions relation/table
              const isTableMissing =
                (error as any)?.status === 404 ||
                error?.code === "42P01" ||
                (error?.code === "PGRST116" && (
                  errorMessage.includes("relation") ||
                  errorMessage.includes("table") ||
                  errorMessage.includes("schema cache")
                )) ||
                errorMessage.includes("does not exist") ||
                errorMessage.includes("relation") ||
                errorMessage.includes("table") ||
                errorMessage.includes("schema cache") ||
                errorMessage.includes("404");

              if (isTableMissing) {
                setProfilesTableExists(false);
                setSessionTableMissing(true);
              } else {
                if (process.env.NODE_ENV === "development") {
                  console.warn("Profile fetch error (non-critical):", error.message);
                }
                setProfilesTableExists(true);
              }
            }
          } catch (error: any) {
            const msg = String(error?.message || "").toLowerCase();

            // PGRST116 from SELECT = row missing, not table missing
            // Only treat as table-missing if message mentions relation/table
            const isTableMissing =
              (error as any)?.status === 404 ||
              error?.code === "42P01" ||
              (error?.code === "PGRST116" && (
                msg.includes("relation") ||
                msg.includes("table") ||
                msg.includes("schema cache")
              )) ||
              msg.includes("404") ||
              msg.includes("does not exist") ||
              msg.includes("relation") ||
              msg.includes("table");

            if (isTableMissing) {
              setProfilesTableExists(false);
              setSessionTableMissing(true);
            } else if (process.env.NODE_ENV === "development") {
              console.warn("Profile fetch error:", error?.message);
            }
          }
        }

        setUser({
          id: authUser.id,
          email: authUser.email,
          role: (profile?.role as "user" | "admin") || "user",
          full_name: profile?.full_name || undefined,
        });
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
      isCheckingRef.current = false;
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-8 h-8 border-2 border-text-secondary border-t-primary rounded-full animate-spin" />
    );
  }

  if (!user) {
    return (
      <Link href="/auth/login">
        <button className="px-6 py-2.5 rounded-xl bg-[#0C0C10] text-white font-medium text-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/20 hover:shadow-[0_12px_48px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 tracking-wide">
          Sign In
        </button>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#0C0C10]/50 border border-transparent hover:border-white/10 transition-all duration-300"
      >
        <div className="w-9 h-9 bg-[#0C0C10] border border-white/10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          {user.full_name?.[0]?.toUpperCase() ||
            user.email?.[0]?.toUpperCase() ||
            "U"}
        </div>
        <span className="hidden md:block text-sm font-medium text-white/90 tracking-wide">
          {user.full_name || user.email?.split("@")[0] || "User"}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-[#0A0A0C]/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/10 z-20 animate-slide-in">
            <div className="p-4">
              <div className="px-4 py-4 border-b border-white/10 mb-2">
                <p className="text-sm font-semibold text-white mb-1 tracking-wide">
                  {user.full_name || "User"}
                </p>
                <p className="text-xs text-white/50 font-light">{user.email}</p>
                {user.role === "admin" && (
                  <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold bg-[#0C0C10] border border-white/20 text-white rounded-xl">
                    Admin
                  </span>
                )}
              </div>

              <Link
                href="/bookings/my"
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-[#0C0C10]/50 rounded-xl transition-all duration-300 mb-1 group"
                onClick={() => setShowMenu(false)}
              >
                <Calendar className="w-4 h-4" />
                <span className="font-medium tracking-wide">My Bookings</span>
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-[#0C0C10]/50 rounded-xl transition-all duration-300 mb-1 group"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium tracking-wide">Admin Panel</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-[#0C0C10]/50 rounded-xl transition-all duration-300 mt-2 border-t border-white/10 pt-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium tracking-wide">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
