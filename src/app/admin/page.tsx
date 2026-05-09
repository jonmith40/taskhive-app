"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  ArrowDownToLine,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import GlassCard from "@/components/admin/GlassCard";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { useDashboardStats, useActivityFeed } from "@/lib/hooks/useAdminData";

// ── Types ─────────────────────────────────────────────────────────────────────
type AccentColor = "blue" | "violet" | "emerald" | "amber";

// ── Accent style maps ─────────────────────────────────────────────────────────
const accentTextMap: Record<AccentColor, string> = {
  blue: "text-blue-400",
  violet: "text-violet-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
};

const accentBgMap: Record<AccentColor, string> = {
  blue: "bg-blue-500/10",
  violet: "bg-violet-500/10",
  emerald: "bg-emerald-500/10",
  amber: "bg-amber-500/10",
};

const accentBarMap: Record<AccentColor, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
};

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  prefix?: string;
  accent: AccentColor;
}

function StatCard({
  label,
  value,
  change,
  icon,
  prefix = "",
  accent,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const isPositive = change >= 0;

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = Math.max(1, value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <GlassCard accentColor={accent} hover className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentBgMap[accent]} ${accentTextMap[accent]}`}
        >
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(change)}%
        </span>
      </div>

      <p className="text-2xl font-bold text-white tracking-tight mb-1">
        {prefix}
        {displayValue.toLocaleString()}
      </p>
      <p className="text-xs text-white/35 font-medium">{label}</p>

      <div className="mt-3 h-0.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${accentBarMap[accent]} opacity-60`}
          style={{
            width: `${Math.min(80, 40 + Math.abs(change) * 2)}%`,
            transition: "width 1.2s ease",
          }}
        />
      </div>
    </GlassCard>
  );
}

// ── ActionQueueItem ───────────────────────────────────────────────────────────
function ActionQueueItem({
  icon,
  label,
  count,
  href,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
  colorClass: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors group"
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
      >
        {icon}
      </div>
      <span className="flex-1 text-xs text-white/60 group-hover:text-white/90 transition-colors">
        {label}
      </span>
      <span className="text-xs font-bold text-white/80 bg-white/5 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </a>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { items: recentActivity, loading: activityLoading } = useActivityFeed(6);

  if (statsLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle={`Last updated: ${new Date().toLocaleTimeString()}`}
        icon={<Activity size={20} />}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">Live</span>
          </div>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 0}
          change={0}
          icon={<Users size={18} />}
          accent="blue"
        />
        <StatCard
          label="Active Jobs"
          value={stats?.activeJobs || 0}
          change={0}
          icon={<Briefcase size={18} />}
          accent="violet"
        />
        <StatCard
          label="Pending Withdrawals"
          value={stats?.pendingWithdrawals || 0}
          change={0}
          icon={<ArrowDownToLine size={18} />}
          accent="amber"
        />
        <StatCard
          label="Total Revenue"
          value={stats?.totalRevenue || 0}
          change={0}
          icon={<DollarSign size={18} />}
          prefix="$"
          accent="emerald"
        />
      </div>

      {/* ── Lower Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <GlassCard className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-white">Recent Activity</h2>
            <span className="text-xs text-white/30">Real-time</span>
          </div>
          <div className="space-y-3">
            {activityLoading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 flex-shrink-0 text-xs font-bold uppercase">
                    {item.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">
                      {item.user}
                    </p>
                    <p className="text-xs text-white/30 truncate">{item.action}</p>
                  </div>
                  <StatusBadge status={item.status} />
                  <div className="flex items-center gap-1 text-[10px] text-white/20 flex-shrink-0">
                    <Clock size={10} />
                    {item.createdAt}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-white/20 text-xs italic">
                No recent activity recorded
              </div>
            )}
          </div>
        </GlassCard>

        {/* Action Queue + System Health */}
        <GlassCard className="p-5" accentColor="violet">
          <h2 className="text-sm font-bold text-white mb-5">Action Queue</h2>
          <div className="space-y-3">
            <ActionQueueItem
              icon={<AlertCircle size={16} />}
              label="KYC Pending"
              count={stats?.pendingWithdrawals || 0}
              href="/admin/kyc"
              colorClass="text-amber-400 bg-amber-500/10"
            />
            <ActionQueueItem
              icon={<Briefcase size={16} />}
              label="Jobs Awaiting Approval"
              count={0}
              href="/admin/jobs"
              colorClass="text-violet-400 bg-violet-500/10"
            />
            <ActionQueueItem
              icon={<ArrowDownToLine size={16} />}
              label="Withdrawal Requests"
              count={stats?.pendingWithdrawals || 0}
              href="/admin/transactions"
              colorClass="text-rose-400 bg-rose-500/10"
            />
            <ActionQueueItem
              icon={<CheckCircle2 size={16} />}
              label="Disputes Open"
              count={0}
              href="/admin"
              colorClass="text-blue-400 bg-blue-500/10"
            />
          </div>

          {/* System Health */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-3">
              System Health
            </p>
            {[
              { label: "API Uptime", pct: 99.9, color: "bg-emerald-500" },
              { label: "DB Response", pct: 87, color: "bg-blue-500" },
              { label: "Storage Used", pct: 63, color: "bg-violet-500" },
            ].map((m) => (
              <div key={m.label} className="mb-3">
                <div className="flex justify-between text-[10px] text-white/30 mb-1">
                  <span>{m.label}</span>
                  <span>{m.pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${m.color} opacity-70`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
