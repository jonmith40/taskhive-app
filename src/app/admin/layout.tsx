"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#070B14] text-white overflow-hidden">
        {/* ── Ambient background glows ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#3B82F6]/5 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/5 blur-[120px]" />
          <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-[#06B6D4]/3 blur-[100px]" />
        </div>

        {!isLoginPage && (
          <AdminSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
          />
        )}

        <main
          className={`relative z-10 flex-1 transition-all duration-300 ease-in-out ${
            isLoginPage ? "ml-0" : sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
          }`}
        >
          <div className="min-h-screen p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
