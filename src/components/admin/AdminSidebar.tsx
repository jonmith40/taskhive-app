"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  LogOut,
  Zap,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "KYC Queue",
    href: "/admin/kyc",
    icon: <ShieldCheck size={18} />,
    badge: 12,
  },
  {
    label: "Job Approvals",
    href: "/admin/jobs",
    icon: <Briefcase size={18} />,
    badge: 5,
  },
  {
    label: "Transactions",
    href: "/admin/transactions",
    icon: <Receipt size={18} />,
  },
];

const bottomItems: NavItem[] = [
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: <Bell size={18} />,
    badge: 3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings size={18} />,
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear any local bypass tokens just in case
      localStorage.removeItem("nexus_admin_auth");
      // Sign out from Firebase
      await signOut(auth);
      // Redirect back to login page
      router.push("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
      style={{
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(10,16,32,0.98) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap size={18} className="text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0A1020] animate-pulse" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold tracking-wider text-white font-mono leading-tight">
              NEXUS<span className="text-blue-400">ADMIN</span>
            </p>
            <p className="text-[10px] text-white/30 tracking-widest uppercase">
              Control Panel
            </p>
          </div>
        )}
      </div>

      {/* ── Main Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-white/20 tracking-[0.2em] uppercase px-3 mb-3">
            Navigation
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* ── Bottom Nav ── */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>

      {/* ── Admin Avatar ── */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            SA
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              Super Admin
            </p>
            <p className="text-[10px] text-white/30 truncate">
              admin@nexus.io
            </p>
          </div>
        </div>
      )}

      {/* ── Collapse Toggle ── */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0F1729] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-200 shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

// ── NavLink sub-component ────────────────────────────────────────────────────
function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-blue-500/15 text-blue-400"
          : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
      }`}
    >
      {/* Active left bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
      )}

      <span
        className={`flex-shrink-0 transition-colors ${
          active
            ? "text-blue-400"
            : "text-white/35 group-hover:text-white/70"
        }`}
      >
        {item.icon}
      </span>

      {!collapsed && (
        <span className="flex-1 text-sm font-medium">{item.label}</span>
      )}

      {/* Badge — expanded */}
      {item.badge !== undefined && !collapsed && (
        <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center border border-blue-500/20">
          {item.badge}
        </span>
      )}

      {/* Badge — collapsed (dot) */}
      {item.badge !== undefined && collapsed && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400 border border-[#0A1020]" />
      )}
    </Link>
  );
}
