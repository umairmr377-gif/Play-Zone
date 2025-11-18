"use client";

import { useState, useEffect } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Lock } from "lucide-react";

interface AdminGateProps {
  onAuthenticated: () => void;
}

export default function AdminGate({ onAuthenticated }: AdminGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const isAuth = localStorage.getItem("admin_authenticated");
    if (isAuth === "true") {
      onAuthenticated();
    }
  }, [onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsChecking(true);

    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

    setTimeout(() => {
      if (password === adminPassword) {
        localStorage.setItem("admin_authenticated", "true");
        onAuthenticated();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
      setIsChecking(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 p-4">
              <Lock className="w-12 h-12 text-gray-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Access Required
          </h1>
          <p className="text-gray-600">
            Please enter the admin password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isChecking}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? "Checking..." : "Access Admin Panel"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This is a basic client-side authentication gate.
            For production, implement proper authentication (NextAuth, Firebase, etc.).
          </p>
        </div>
      </Card>
    </div>
  );
}

