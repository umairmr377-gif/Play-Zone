"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/Card";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"password" | "magic-link">("password");

  const redirectTo = searchParams.get("redirectTo") || "/";
  const supabase = createClient();

  useEffect(() => {
    // Check if already logged in
    if (!supabase) return;
    
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectTo);
      }
    };
    checkSession();
  }, [router, redirectTo, supabase]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!supabase) {
      setError("Supabase is not configured. Please create a .env.local file with your Supabase credentials. See QUICK_FIX_SUPABASE.md for instructions.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (error: any) {
      // Parse Supabase error messages for better UX
      const errorMessage = error.message || error.error_description || "Failed to sign in";
      
      if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("invalid_credentials")) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (errorMessage.includes("Email not confirmed") || errorMessage.includes("email_not_confirmed")) {
        setError("Please check your email and click the confirmation link before signing in. If you didn't receive it, try signing up again.");
      } else if (errorMessage.includes("User not found") || errorMessage.includes("user_not_found")) {
        setError("No account found with this email. Please sign up first.");
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("ERR_NAME_NOT_RESOLVED")) {
        setError("Cannot connect to Supabase. Please check your internet connection and try again.");
      } else if (errorMessage.includes("environment variables") || errorMessage.includes("not configured")) {
        setError("Supabase is not configured. Please set up your .env.local file with Supabase credentials.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!supabase) {
      setError("Supabase is not configured. Please create a .env.local file with your Supabase credentials.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;

      setError("");
      alert("Check your email for the magic link!");
    } catch (error: any) {
      setError(error.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 animate-fade-in">
      <Card className="p-10 max-w-md w-full" hover={false}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary mb-3">Sign In to Play Zone</h1>
          <p className="text-text-secondary">Access your account</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-background-card rounded-xl">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === "password"
                  ? "bg-primary text-white shadow-smooth"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("magic-link")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === "magic-link"
                  ? "bg-primary text-white shadow-smooth"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Magic Link
            </button>
          </div>

        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-text-primary mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background-card text-text-primary"
              placeholder="your@email.com"
              required
            />
          </div>

          {mode === "password" && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-text-primary mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background-card text-text-primary"
                placeholder="Enter your password"
                required
              />
            </div>
          )}

          {error && (
            <div className="animate-slide-in">
              <ErrorMessage message={error} onDismiss={() => setError("")} />
            </div>
          )}

          <Button type="submit" fullWidth variant="primary" disabled={loading} className="shadow-smooth mt-6">
            {loading
              ? "Signing in..."
              : mode === "password"
              ? "Sign In"
              : "Send Magic Link"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:text-primary-light font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

