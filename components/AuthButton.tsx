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
    
    // Listen for auth changes
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

    // Prevent parallel queries
    if (isCheckingRef.current) {
      return;
    }

    isCheckingRef.current = true;

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch profile with role
        let profile = null;
        
        // Skip query if we know table doesn't exist (prevents repeated 404s)
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
              setProfilesTableExists(true); // Cache that table exists
            } else if (error) {
              // Check if it's a table not found error (404) or schema cache error
              const errorMessage = error.message || "";
              const errorAny = error as any; // Type assertion for PostgrestError which may have status
              const isTableMissing = 
                errorAny.status === 404 ||
                error.code === "PGRST116" ||
                error.code === "42P01" ||
                errorMessage.includes("schema cache") ||
                errorMessage.includes("relation") ||
                errorMessage.includes("does not exist");
              
              if (isTableMissing) {
                // Cache that table doesn't exist to prevent future requests
                setProfilesTableExists(false);
              } else {
                // Other error - log it but don't spam console
                console.warn("Profile fetch error (non-critical):", error.message);
                // Assume table exists for other errors
                setProfilesTableExists(true);
              }
            }
          } catch (error: any) {
            // Profile table might not exist yet - cache it
            setProfilesTableExists(false);
          }
        }

        setUser({
          id: authUser.id,
          email: authUser.email,
          role: (profile?.role as "user" | "admin") || "user",
          full_name: profile?.full_name || undefined,
        });
      } else {
        setUser(null);
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
          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
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

