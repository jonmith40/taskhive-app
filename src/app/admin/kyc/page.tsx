"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Eye,
  Check,
  X,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import GlassCard from "@/components/admin/GlassCard";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { useKYCQueue } from "@/lib/hooks/useAdminData";

// ── Types ─────────────────────────────────────────────────────────────────────
type KYCStatus = "pending" | "approved" | "rejected";

interface KYCRecord {
  id:          string;
  userId:      string;
  name:        string;
  email:       string;
  country:     string;
  submittedAt: string;
  nidFrontUrl: string;
  nidBackUrl:  string;
  selfieUrl:   string;
  status:      KYCStatus;
}

function KYCModal({
  record,
  onClose,
  onApprove,
  onReject,
}: {
  record: KYCRecord;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden z-10 animate-fade-in"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(10,16,32,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-bold text-white">{record.name}</h3>
            <p className="text-xs text-white/35 mt-0.5">
              {record.email} · {record.country} · Submitted {record.submittedAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">
              NID — Front
            </p>
            <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
              <img
                src={record.nidFrontUrl}
                alt="NID Front"
                className="w-full object-cover min-h-[120px] bg-white/5"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">
              NID — Back
            </p>
            <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
              <img
                src={record.nidBackUrl}
                alt="NID Back"
                className="w-full object-cover min-h-[120px] bg-white/5"
              />
            </div>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">
              Selfie with ID
            </p>
            <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] w-36 mx-auto">
              <img
                src={record.selfieUrl}
                alt="Selfie"
                className="w-full object-cover min-h-[120px] bg-white/5"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <StatusBadge status={record.status} />
            <span className="text-xs text-white/25">Current status</span>
          </div>
          {record.status === "pending" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { onReject(record.id); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-sm font-semibold transition-all"
              >
                <X size={14} /> Reject
              </button>
              <button
                onClick={() => { onApprove(record.id); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-sm font-semibold transition-all"
              >
                <Check size={14} /> Approve
              </button>
            </div>
          )}
          {record.status !== "pending" && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-white/50 hover:text-white text-sm font-medium transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KYCPage() {
  const { records, approveKYC, rejectKYC, loading } = useKYCQueue();
  const [selectedRecord, setSelected]   = useState<KYCRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | KYCStatus>("pending");
  const [search, setSearch]             = useState("");

  const filtered = records.filter((r) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.country.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all:      records.length,
    pending:  records.filter((r) => r.status === "pending").length,
    approved: records.filter((r) => r.status === "approved").length,
    rejected: records.filter((r) => r.status === "rejected").length,
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="KYC Verification Queue"
        subtitle={`${counts.pending} submissions awaiting review`}
        icon={<ShieldCheck size={20} />}
        actions={
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/90 text-xs font-medium transition-all">
            <Download size={13} /> Export
          </button>
        }
      />

      <GlassCard className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/[0.05]">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
            />
            <input
              type="text"
              placeholder="Search name, email or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterStatus === s
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {s}
                <span className="ml-1.5 opacity-60">
                  ({counts[s]})
                </span>
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60 text-xs transition-all">
            <Filter size={12} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["User", "Country", "Submitted", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-sm text-white/20"
                  >
                    No records match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-white/70 flex-shrink-0">
                          {record.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/80">
                            {record.name}
                          </p>
                          <p className="text-xs text-white/30">{record.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50">
                      {record.country}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/30 whitespace-nowrap">
                      {record.submittedAt}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(record as KYCRecord)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-medium transition-all"
                        >
                          <Eye size={12} /> View ID
                        </button>
                        {record.status === "pending" && (
                          <>
                            <button
                              onClick={() => approveKYC(record.id, record.userId)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium transition-all"
                              title="Approve"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => rejectKYC(record.id, record.userId)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-all"
                              title="Reject"
                            >
                              <X size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-xs text-white/25">
            Showing <span className="text-white/50">{filtered.length}</span> of{" "}
            <span className="text-white/50">{records.length}</span> records
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

      {selectedRecord && (
        <KYCModal
          record={selectedRecord}
          onClose={() => setSelected(null)}
          onApprove={(id) => approveKYC(id, selectedRecord.userId)}
          onReject={(id) => rejectKYC(id, selectedRecord.userId)}
        />
      )}
    </div>
  );
}
