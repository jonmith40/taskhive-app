type StatusType =
  | "pending"
  | "approved"
  | "rejected"
  | "live"
  | "completed"
  | "deposit"
  | "withdrawal";

const statusConfig: Record<
  StatusType,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  approved: { label: "Approved", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  rejected: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  live: { label: "Live", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  completed: { label: "Completed", bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-400" },
  deposit: { label: "Deposit", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  withdrawal: { label: "Withdrawal", bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-400" },
};

export default function StatusBadge({ status }: { status: StatusType }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
