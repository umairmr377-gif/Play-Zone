"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SupabaseWarning from "@/components/SupabaseWarning";
import { isSupabaseConfigured } from "@/lib/supabaseClientCheck";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <AdminTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-8">
          {!supabaseConfigured && <SupabaseWarning />}
          {children}
        </div>
      </main>
    </div>
  );
}

