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
              const isTableMissing = 
                error.status === 404 ||
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
        <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark shadow-smooth hover:shadow-glow transition-all duration-300 active:scale-95">
          Sign In
        </button>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-background-card transition-colors duration-300"
      >
        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-smooth">
          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="hidden md:block text-sm font-medium text-text-primary">
          {user.full_name || user.email?.split("@")[0] || "User"}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 card-glass rounded-2xl shadow-smooth border border-white/10 z-20 animate-slide-in">
            <div className="p-3">
              <div className="px-3 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-text-primary">
                  {user.full_name || "User"}
                </p>
                <p className="text-xs text-text-secondary mt-1">{user.email}</p>
                {user.role === "admin" && (
                  <span className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold bg-danger/10 text-danger rounded-xl">
                    Admin
                  </span>
                )}
              </div>
              
              <Link
                href="/bookings/my"
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-primary hover:bg-background-card rounded-xl transition-colors duration-300 mt-1"
                onClick={() => setShowMenu(false)}
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-primary hover:bg-background-card rounded-xl transition-colors duration-300 mt-1"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-xl transition-colors duration-300 mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

