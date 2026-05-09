"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UTILITY
// ─────────────────────────────────────────────────────────────────────────────

function tsToString(ts: unknown): string {
  if (!ts) return "—";
  if (ts instanceof Timestamp) return ts.toDate().toLocaleString();
  if (ts instanceof Date) return ts.toLocaleString();
  return String(ts);
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers:         number;
  activeJobs:         number;
  pendingWithdrawals: number;
  totalRevenue:       number;
}

export interface KYCRecord {
  id:          string;
  userId:      string;
  name:        string;
  email:       string;
  country:     string;
  submittedAt: string;
  nidFrontUrl: string;
  nidBackUrl:  string;
  selfieUrl:   string;
  status:      "pending" | "approved" | "rejected";
}

export interface JobRecord {
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
  status:        "pending" | "live" | "rejected";
  flags:         string[];
}

export interface TxRecord {
  id:        string;
  userId:    string;
  userName:  string;
  type:      "deposit" | "withdrawal";
  amount:    number;
  method:    string;
  status:    "completed" | "pending" | "rejected";
  ref:       string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const ref = doc(db, "adminMeta", "stats");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setStats(snap.data() as DashboardStats);
        } else {
          setStats({
            totalUsers:         0,
            activeJobs:         0,
            pendingWithdrawals: 0,
            totalRevenue:       0,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("[useDashboardStats]", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { stats, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — KYC QUEUE
// ─────────────────────────────────────────────────────────────────────────────

export function useKYCQueue(filterStatus?: KYCRecord["status"]) {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const constraints: any[] = [orderBy("submittedAt", "desc")];
    if (filterStatus) {
      constraints.unshift(where("status", "==", filterStatus));
    }

    const q = query(collection(db, "kyc"), ...constraints);

    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
        const data: KYCRecord[] = snap.docs.map((d) => {
          const r = d.data();
          return {
            id:          d.id,
            userId:      r.userId      ?? "",
            name:        r.name        ?? "Unknown",
            email:       r.email       ?? "",
            country:     r.country     ?? "",
            submittedAt: tsToString(r.submittedAt),
            nidFrontUrl: r.nidFrontUrl ?? "",
            nidBackUrl:  r.nidBackUrl  ?? "",
            selfieUrl:   r.selfieUrl   ?? "",
            status:      r.status      ?? "pending",
          };
        });
        setRecords(data);
        setLoading(false);
      },
      (err) => {
        console.error("[useKYCQueue]", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [filterStatus]);

  const approveKYC = useCallback(
    async (kycId: string, userId: string) => {
      try {
        await updateDoc(doc(db, "kyc", kycId), {
          status:     "approved",
          reviewedAt: serverTimestamp(),
          rejectReason: null,
        });
        await updateDoc(doc(db, "users", userId), {
          kycStatus:   "approved",
          kycReviewedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("[approveKYC]", err);
        throw err;
      }
    },
    []
  );

  const rejectKYC = useCallback(
    async (kycId: string, userId: string, reason = "Does not meet requirements") => {
      try {
        await updateDoc(doc(db, "kyc", kycId), {
          status:       "rejected",
          reviewedAt:   serverTimestamp(),
          rejectReason: reason,
        });
        await updateDoc(doc(db, "users", userId), {
          kycStatus:    "rejected",
          kycReviewedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("[rejectKYC]", err);
        throw err;
      }
    },
    []
  );

  return { records, loading, error, approveKYC, rejectKYC };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — JOB APPROVALS
// ─────────────────────────────────────────────────────────────────────────────

export function useJobApprovals(filterStatus?: JobRecord["status"]) {
  const [jobs, setJobs]       = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const constraints: any[] = [orderBy("createdAt", "desc")];
    if (filterStatus) {
      constraints.unshift(where("status", "==", filterStatus));
    }

    const q = query(collection(db, "campaigns"), ...constraints);

    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
        const data: JobRecord[] = snap.docs.map((d) => {
          const r = d.data();
          return {
            id:            d.id,
            title:         r.title         ?? "Untitled",
            poster:        r.posterName    ?? "Unknown",
            posterEmail:   r.posterEmail   ?? "",
            category:      r.category      ?? "General",
            budget:        r.totalBudget   ?? 0,
            workersNeeded: r.workersNeeded ?? 0,
            perWorker:     r.ratePerWorker ?? 0,
            description:   r.description   ?? "",
            postedAt:      tsToString(r.createdAt),
            status:        r.status        ?? "pending",
            flags:         Array.isArray(r.flags) ? r.flags : [],
          };
        });
        setJobs(data);
        setLoading(false);
      },
      (err) => {
        console.error("[useJobApprovals]", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [filterStatus]);

  const approveJob = useCallback(async (jobId: string) => {
    try {
      await updateDoc(doc(db, "campaigns", jobId), {
        status:     "live",
        approvedAt: serverTimestamp(),
        rejectedAt: null,
        rejectReason: null,
      });
    } catch (err) {
      console.error("[approveJob]", err);
      throw err;
    }
  }, []);

  const rejectJob = useCallback(
    async (jobId: string, reason = "Policy violation") => {
      try {
        await updateDoc(doc(db, "campaigns", jobId), {
          status:       "rejected",
          rejectedAt:   serverTimestamp(),
          approvedAt:   null,
          rejectReason: reason,
        });
      } catch (err) {
        console.error("[rejectJob]", err);
        throw err;
      }
    },
    []
  );

  return { jobs, loading, error, approveJob, rejectJob };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useTransactions(
  filterType?:   TxRecord["type"],
  filterStatus?: TxRecord["status"]
) {
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    const constraints: any[] = [orderBy("createdAt", "desc")];
    if (filterType)   constraints.unshift(where("type",   "==", filterType));
    if (filterStatus) constraints.unshift(where("status", "==", filterStatus));

    const q = query(collection(db, "transactions"), ...constraints);

    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
        const data: TxRecord[] = snap.docs.map((d) => {
          const r = d.data();
          return {
            id:        d.id,
            userId:    r.userId      ?? "",
            userName:  r.userName    ?? "Unknown",
            type:      r.type        ?? "deposit",
            amount:    r.amount      ?? 0,
            method:    r.method      ?? "Unknown",
            status:    r.status      ?? "pending",
            ref:       r.referenceId ?? d.id.slice(0, 8).toUpperCase(),
            createdAt: tsToString(r.createdAt),
          };
        });
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.error("[useTransactions]", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [filterType, filterStatus]);

  const totals = {
    depositTotal: transactions
      .filter((t) => t.type === "deposit" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0),

    withdrawalTotal: transactions
      .filter((t) => t.type === "withdrawal" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0),

    pendingTotal: transactions
      .filter((t) => t.status === "pending")
      .reduce((s, t) => s + t.amount, 0),

    pendingCount: transactions.filter((t) => t.status === "pending").length,
  };

  return { transactions, loading, error, totals };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — RECENT ACTIVITY
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivityItem {
  id:        string;
  type:      string;
  user:      string;
  action:    string;
  status:    "pending" | "approved" | "rejected" | "live" | "completed";
  createdAt: string;
}

export function useActivityFeed(limitCount = 10) {
  const [items, setItems]     = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "activityFeed"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
        const data: ActivityItem[] = snap.docs.slice(0, limitCount).map((d) => {
          const r = d.data();
          return {
            id:        d.id,
            type:      r.type      ?? "system",
            user:      r.user      ?? "System",
            action:    r.action    ?? "",
            status:    r.status    ?? "pending",
            createdAt: tsToString(r.createdAt),
          };
        });
        setItems(data);
        setLoading(false);
      },
      (err) => {
        console.error("[useActivityFeed]", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [limitCount]);

  return { items, loading, error };
}
