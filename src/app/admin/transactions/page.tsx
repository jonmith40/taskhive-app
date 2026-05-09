"use client";

import { useState } from "react";
import {
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import GlassCard from "@/components/admin/GlassCard";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { useTransactions } from "@/lib/hooks/useAdminData";

// ── Types ─────────────────────────────────────────────────────────────────────
type TxType   = "deposit" | "withdrawal";
type TxStatus = "completed" | "pending" | "rejected";

interface Transaction {
  id:        string;
  userId:    string;
  userName:  string;
  type:      TxType;
  amount:    number;
  method:    string;
  status:    TxStatus;
  ref:       string;
  createdAt: string;
}

const METHOD_COLORS: Record<string, string> = {
  PayPal:      "text-blue-400",
  Payoneer:    "text-amber-400",
  Card:        "text-violet-400",
  "Bank Wire": "text-cyan-400",
  Crypto:      "text-emerald-400",
  Wise:        "text-pink-400",
};

function TxMetric({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1.5 font-semibold">
        {label}
      </p>
      <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
      <p className="text-xs text-white/30 mt-0.5">{sub}</p>
    </div>
  );
}

export default function TransactionsPage() {
  const { transactions, totals, loading } = useTransactions();
  const [filterType, setFilterType]     = useState<"all" | TxType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | TxStatus>("all");
  const [search, setSearch]             = useState("");
  const [showMethodFilter, setShowMethodFilter] = useState(false);

  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filtered = transactions.filter((t) => {
    const matchType   = filterType   === "all" || t.type   === filterType;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch =
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.ref.toLowerCase().includes(search.toLowerCase()) ||
      t.method.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Transaction Ledger"
        subtitle="All platform deposits and withdrawal requests"
        icon={<Receipt size={20} />}
        actions={
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/90 text-xs font-medium transition-all">
            <Download size={13} /> Export CSV
          </button>
        }
      />

      <GlassCard accentColor="cyan" className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x-0 lg:divide-x divide-white/[0.05]">
          <TxMetric
            label="Total Deposits"
            value={fmt(totals.depositTotal)}
            sub="Completed deposits"
            color="text-emerald-400"
          />
          <TxMetric
            label="Total Withdrawals"
            value={fmt(totals.withdrawalTotal)}
            sub="Processed payouts"
            color="text-rose-400"
          />
          <TxMetric
            label="Pending Value"
            value={fmt(totals.pendingTotal)}
            sub={`${totals.pendingCount} awaiting action`}
            color="text-amber-400"
          />
          <TxMetric
            label="Net Revenue"
            value={fmt(totals.depositTotal - totals.withdrawalTotal)}
            sub="Platform balance"
            color="text-blue-400"
          />
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/[0.05]">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
            />
            <input
              type="text"
              placeholder="Search user, ref or method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {(["all", "deposit", "withdrawal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterType === t
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {(["all", "completed", "pending", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterStatus === s
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/20"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMethodFilter((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60 text-xs transition-all"
          >
            <Filter size={12} /> More{" "}
            <ChevronDown
              size={10}
              className={`transition-transform ${showMethodFilter ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {[
                  "Ref ID",
                  "User",
                  "Type",
                  "Amount",
                  "Method",
                  "Status",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-sm text-white/20"
                  >
                    No transactions match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-white/40 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06] group-hover:text-white/60 transition-colors">
                        {tx.ref}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0">
                          {tx.userName.charAt(0)}
                        </div>
                        <span className="text-sm text-white/70 whitespace-nowrap">
                          {tx.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          tx.type === "deposit"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-rose-400 bg-rose-500/10"
                        }`}
                      >
                        {tx.type === "deposit" ? (
                          <ArrowDownLeft size={11} />
                        ) : (
                          <ArrowUpRight size={11} />
                        )}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          tx.type === "deposit"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {tx.type === "withdrawal" ? "−" : "+"}
                        {fmt(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          METHOD_COLORS[tx.method] ?? "text-white/40"
                        }`}
                      >
                        {tx.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-white/30 whitespace-nowrap">
                      {tx.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-white/25">
            Showing{" "}
            <span className="text-white/50">{filtered.length}</span> of{" "}
            <span className="text-white/50">{transactions.length}</span>{" "}
            transactions
          </p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all">
              <ChevronLeft size={13} />
            </button>
            <button className="w-7 h-7 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all">
              1
            </button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
