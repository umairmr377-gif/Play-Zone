"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/Card";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 animate-fade-in">
        <Card className="p-10 max-w-md w-full text-center" hover={false}>
          <div className="mb-6">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto border-2 border-accent/30">
              <svg
                className="w-10 h-10 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-primary mb-3">
            Account Created!
          </h2>
          <p className="text-text-secondary mb-6">
            Please check your email to verify your account.
          </p>
          <p className="text-sm text-text-secondary">
            Redirecting to login...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 animate-fade-in">
      <Card className="p-10 max-w-md w-full" hover={false}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary mb-3">Welcome to Play Zone</h1>
          <p className="text-text-secondary">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-text-primary mb-2"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background-card text-text-primary"
              placeholder="John Doe"
            />
          </div>

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
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="animate-slide-in">
              <ErrorMessage message={error} onDismiss={() => setError("")} />
            </div>
          )}

          <Button type="submit" fullWidth variant="primary" disabled={loading} className="shadow-smooth mt-6">
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary-light font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

