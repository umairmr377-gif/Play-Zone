"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { getPublicClient } from "@/lib/supabase-client-helper";
import Button from "../ui/Button";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = getPublicClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-[#0C0C10]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-white/60 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">Play Zone Admin</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}

