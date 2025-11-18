"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "./Button";
import { User, LogOut, Settings, Calendar } from "lucide-react";

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

  useEffect(() => {
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
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch profile with role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", authUser.id)
          .single()
          .catch(() => ({ data: null }));

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
    }
  };

  const handleLogout = async () => {
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

