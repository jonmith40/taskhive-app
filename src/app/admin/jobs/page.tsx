"use client";

import { useState } from "react";
import {
  Briefcase,
  Check,
  X,
  ExternalLink,
  DollarSign,
  Users,
  Clock,
  Tag,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import GlassCard from "@/components/admin/GlassCard";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { useJobApprovals } from "@/lib/hooks/useAdminData";

// ── Types ─────────────────────────────────────────────────────────────────────
type JobStatus = "pending" | "live" | "rejected";

interface Job {
  id:            string;
  title:         string;
  poster:        string;
  posterEmail:   string;
  category:      string;
  budget:        number;
  workersNeeded: number;
  perWorker:     number;
  description:   string;
  postedAt:      string;
  status:        JobStatus;
  flags:         string[];
}

const CATEGORY_STYLES: Record<string, string> = {
  Reviews:       "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Social Media":"text-pink-400 bg-pink-500/10 border-pink-500/20",
  "Data Entry":  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Signups:       "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Video:         "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "App Install": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function JobCard({
  job,
  onApprove,
  onReject,
}: {
  job: Job;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const catStyle =
    CATEGORY_STYLES[job.category] ?? "text-white/50 bg-white/5 border-white/10";

  const accentMap: Record<JobStatus, "emerald" | "blue" | undefined> = {
    live:     "emerald",
    pending:  "blue",
    rejected: undefined,
  };

  return (
    <GlassCard hover accentColor={accentMap[job.status]} className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white/90 leading-snug">
              {job.title}
            </h3>
            {job.flags?.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold"
              >
                <AlertTriangle size={9} />
                {f}
              </span>
            ))}
          </div>
          <p className="text-xs text-white/35">
            {job.poster}{" "}
            <span className="text-white/20">·</span>{" "}
            {job.posterEmail}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${catStyle}`}
        >
          <Tag size={10} />
          {job.category}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
          <DollarSign size={11} className="text-emerald-400/70" />
          <span className="text-emerald-400/80 font-semibold">
            ${job.budget}
          </span>{" "}
          total
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
          <Users size={11} />
          {job.workersNeeded} workers
          <span className="text-white/60 font-medium">
            · ${job.perWorker}/each
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-white/30 ml-auto">
          <Clock size={11} />
          {job.postedAt}
        </span>
      </div>

      <div className="mb-4">
        <p
          className={`text-xs text-white/40 leading-relaxed ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {job.description}
        </p>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="inline-flex items-center gap-1 text-[10px] text-blue-400/60 hover:text-blue-400 mt-1.5 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={10} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={10} /> Read more
            </>
          )}
        </button>
      </div>

      {job.status === "pending" && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05]">
          <button
            onClick={() => onApprove(job.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all"
          >
            <Check size={13} /> Make Live
          </button>
          <button
            onClick={() => onReject(job.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-semibold transition-all"
          >
            <X size={13} /> Reject
          </button>
          <a
            href="#"
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/30 hover:text-white/70 text-xs transition-all"
          >
            <ExternalLink size={12} /> Preview
          </a>
        </div>
      )}

      {job.status === "live" && (
        <div className="pt-3 border-t border-white/[0.05]">
          <span className="text-xs text-emerald-400/60 flex items-center gap-1.5">
            <Check size={12} /> Approved and live on platform
          </span>
        </div>
      )}

      {job.status === "rejected" && (
        <div className="pt-3 border-t border-white/[0.05]">
          <span className="text-xs text-red-400/60 flex items-center gap-1.5">
            <X size={12} /> Rejected — not published
          </span>
        </div>
      )}
    </GlassCard>
  );
}

export default function JobApprovalsPage() {
  const { jobs, approveJob, rejectJob, loading } = useJobApprovals();
  const [filterStatus, setFilterStatus] = useState<"all" | JobStatus>("pending");
  const [search, setSearch]             = useState("");

  const filtered = jobs.filter((j) => {
    const matchStatus = filterStatus === "all" || j.status === filterStatus;
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.poster.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all:      jobs.length,
    pending:  jobs.filter((j) => j.status === "pending").length,
    live:     jobs.filter((j) => j.status === "live").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Job Approval System"
        subtitle={`${counts.pending} campaigns awaiting review`}
        icon={<Briefcase size={20} />}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="px-4 py-2 rounded-xl border text-xs font-semibold text-amber-400 bg-amber-500/10 border-amber-500/20">
          Pending: <span className="font-bold">{counts.pending}</span>
        </div>
        <div className="px-4 py-2 rounded-xl border text-xs font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
          Live: <span className="font-bold">{counts.live}</span>
        </div>
        <div className="px-4 py-2 rounded-xl border text-xs font-semibold text-red-400 bg-red-500/10 border-red-500/20">
          Rejected: <span className="font-bold">{counts.rejected}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
          />
          <input
            type="text"
            placeholder="Search title, poster or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          {(["all", "pending", "live", "rejected"] as const).map((s) => (
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
              <span className="ml-1.5 opacity-60">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-16 text-center">
          <p className="text-sm text-white/20">No campaigns match your filters</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job as Job}
              onApprove={approveJob}
              onReject={rejectJob}
            />
          ))}
        </div>
      )}
    </div>
  );
}
