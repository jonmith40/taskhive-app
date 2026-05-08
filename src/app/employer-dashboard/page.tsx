"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import JobWizardModal from "@/components/JobWizardModal";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, increment, writeBatch } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { X, Loader2, Briefcase, Plus, LayoutDashboard, User as UserIcon, Settings, Wallet, ClipboardCheck, CheckCircle2, ExternalLink, Mail, Phone, MapPin, User, CreditCard, Shield, Bell, Globe, AlertCircle, Lock, TrendingUp, ArrowDownToLine, ArrowRight, ArrowLeft, Video, ThumbsUp, Camera, Music, UserPlus, Smartphone, Pause, Copy, Trash2, Rocket, FileText, Link, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CountUpNumber = ({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) => {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    let startTime: number;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = value * easeOut;
      setDisplay(current.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, decimals]);
  return <>{prefix}{display}{suffix}</>;
};

import { useApp } from "@/lib/app-context";
export default function EmployerDashboard() {
  const { user, userData } = useAuth();
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  // Multi-Step Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isPosting, setIsPosting] = useState(false);

  // Advanced Job Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("YouTube");
  const [targetUrl, setTargetUrl] = useState("");
  const [reward, setReward] = useState("5");
  const [totalWorkers, setTotalWorkers] = useState("10");
  const [description, setDescription] = useState("");
  const [requiredProof, setRequiredProof] = useState("");

  // Wallet State
  const [depositAmount, setDepositAmount] = useState("");
  const [optimisticBalance, setOptimisticBalance] = useState<number>(0);
  const [depositMethod, setDepositMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [trxId, setTrxId] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositError, setDepositError] = useState("");

  // --- SETTINGS STATE ---
  const [activeSettingsTab, setActiveSettingsTab] = useState("account");
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Account
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidStatus, setNidStatus] = useState("Unverified");

  // Payment Methods
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  // Localization
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("UTC+6 (Dhaka)");
  // -----------------------

  // Jobs & Review State
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [reviewSubmissions, setReviewSubmissions] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (userData?.balance !== undefined) {
      setOptimisticBalance(userData.balance);
    }
  }, [userData?.balance]);

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || "");
      setPhoneNumber(userData.phoneNumber || "");
      setNidNumber(userData.nidNumber || "");
      setNidStatus(userData.nidStatus || "Unverified");
      setBkashNumber(userData.bkashNumber || "");
      setNagadNumber(userData.nagadNumber || "");
      setEmailNotif(userData.emailNotifications !== false); // Default true
      setPushNotif(userData.pushNotifications !== false); // Default true
      setLanguage(userData.language || "English");
      setTimezone(userData.timezone || "UTC+6 (Dhaka)");
    }
  }, [userData]);

  useEffect(() => {
    if (!user) return;
    
    // Listen to Jobs
    const qJobs = query(collection(db, "jobs"), where("employerId", "==", user.uid));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      let jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      jobsData = jobsData.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setActiveJobs(jobsData);
      setLoadingJobs(false);
    });

    // Listen to Submissions for Review
    const qSubs = query(collection(db, "submissions"), where("employerId", "==", user.uid));
    const unsubSubs = onSnapshot(qSubs, (snapshot) => {
      let subsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      subsData = subsData.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setReviewSubmissions(subsData);
    });

    return () => {
      unsubJobs();
      unsubSubs();
    };
  }, [user]);

  // Auto-save draft simulation
  useEffect(() => {
    if (!isModalOpen || wizardStep === 4) return;
    const hasContent = title || targetUrl || description || requiredProof;
    if (!hasContent) return;
    
    setDraftStatus('saving');
    const timer = setTimeout(() => {
      setDraftStatus('saved');
      const fadeTimer = setTimeout(() => setDraftStatus('idle'), 2500);
      return () => clearTimeout(fadeTimer);
    }, 1200);
    return () => clearTimeout(timer);
  }, [title, targetUrl, description, requiredProof, category, reward, totalWorkers, isModalOpen, wizardStep]);

  const resetWizard = () => {
    setWizardStep(1);
    setTitle("");
    setCategory("YouTube");
    setTargetUrl("");
    setReward("5");
    setTotalWorkers("10");
    setDescription("");
    setRequiredProof("");
    setDraftStatus('idle');
    setIsPosting(false);
  };

  const handlePostJob = async () => {
    if (!user) return;
    setIsPosting(true);
    
    try {
      const parsedReward = parseFloat(reward);
      const parsedWorkers = parseInt(totalWorkers);
      
      const totalCost = parsedReward * parsedWorkers;
      if (optimisticBalance < totalCost) {
        alert("Insufficient funds! Please deposit more funds into your wallet to post this job.");
        setIsPosting(false);
        return;
      }
      
      // We do NOT deduct the total cost immediately in this simplified escrow. 
      // We deduct when employer approves the worker. This ensures employer is only charged for approved work.
      // However, a true escrow would deduct immediately. Let's stick to the current logic to avoid breaking Firebase rules.
      
      await addDoc(collection(db, "jobs"), {
        employerId: user.uid,
        title,
        category,
        targetUrl,
        reward: `৳${parsedReward.toFixed(2)}`,
        parsedReward,
        totalWorkers: parsedWorkers,
        completedWorkers: 0,
        description,
        requiredProof,
        status: "open",
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      resetWizard();
      setActiveTab("jobs");
    } catch (error) {
      console.error("Error posting job:", error);
      setIsPosting(false);
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setDepositError("");

    if (!depositMethod) {
      setDepositError("Please select a deposit method (bKash or Nagad).");
      return;
    }
    if (!trxId.trim()) {
      setDepositError("Please enter the Transaction ID (TrxID).");
      return;
    }
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    // Optimistic UI Update
    setOptimisticBalance(prev => prev + amount);
    setDepositSuccess(true);

    setTimeout(() => {
      setIsDepositModalOpen(false);
      setDepositSuccess(false);
      setDepositAmount("");
      setDepositMethod(null);
      setTrxId("");
    }, 2500);
    
    // Fire and forget Firestore update
    const userRef = doc(db, "users", user.uid);
    updateDoc(userRef, {
      balance: increment(amount)
    }).catch(error => {
      console.error("Error depositing funds:", error);
      // Revert on error
      if (userData?.balance !== undefined) {
        setOptimisticBalance(userData.balance);
      }
    });
  };

  const handleApproveAndPay = async (sub: any) => {
    if (!user) return;
    const amountToPay = sub.parsedReward || 0;

    if (optimisticBalance < amountToPay) {
      alert("Insufficient funds! Please deposit more funds into your wallet to approve this job.");
      return;
    }

    // Optimistic UI updates
    setOptimisticBalance(prev => prev - amountToPay);
    setReviewSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'approved' } : s));

    // Firestore Batch Write
    try {
      const batch = writeBatch(db);
      
      batch.update(doc(db, "users", user.uid), { balance: increment(-amountToPay) });
      batch.update(doc(db, "users", sub.workerId), { balance: increment(amountToPay) });
      batch.update(doc(db, "submissions", sub.id), { status: 'approved' });
      
      const parentJob = activeJobs.find(j => j.id === sub.jobId);
      if (parentJob) {
        const newCompleted = (parentJob.completedWorkers || 0) + 1;
        const isFull = newCompleted >= (parentJob.totalWorkers || 1);
        batch.update(doc(db, "jobs", sub.jobId), { 
          completedWorkers: increment(1),
          status: isFull ? 'completed' : 'open'
        });
        
        setActiveJobs(prev => prev.map(j => {
          if (j.id === sub.jobId) {
            return { ...j, completedWorkers: newCompleted, status: isFull ? 'completed' : j.status };
          }
          return j;
        }));
      }
      
      await batch.commit();
    } catch (error) {
      console.error("Error approving and paying:", error);
      if (userData?.balance !== undefined) setOptimisticBalance(userData.balance);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { 
        fullName, 
        phoneNumber, 
        nidNumber,
        bkashNumber,
        nagadNumber,
        emailNotifications: emailNotif,
        pushNotifications: pushNotif,
        language,
        timezone,
        // Optional: transition nidStatus to Under Review if new NID provided
        ...(nidNumber && nidNumber !== userData?.nidNumber && { nidStatus: 'Under Review' })
      });
      if (nidNumber && nidNumber !== userData?.nidNumber) {
        setNidStatus('Under Review');
      }
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings", error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !auth.currentUser.email) return;
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password should be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      setPasswordError(error instanceof Error ? error.message : "Failed to update password. Please check your current password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const pendingReviewCount = reviewSubmissions.filter(s => s.status === 'in_review').length;
  const activeCount = activeJobs.filter(j => j.status === 'open').length;
  const totalSpent = reviewSubmissions.filter(s => s.status === 'approved').reduce((acc, curr) => acc + (curr.parsedReward || 0), 0);
  const totalCompleted = reviewSubmissions.filter(s => s.status === 'approved').length;
  const costPerCompletion = totalCompleted > 0 ? (totalSpent / totalCompleted) : 0;
  const totalEngagement = reviewSubmissions.length;

  const getInitials = () => {
    if (userData?.fullName) return userData.fullName.substring(0, 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return "US";
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "YouTube": return <Video size={16} />;
      case "Facebook": return <ThumbsUp size={16} />;
      case "Instagram": return <Camera size={16} />;
      case "TikTok": return <Music size={16} />;
      case "Website Sign Up": return <UserPlus size={16} />;
      case "App Install": return <Smartphone size={16} />;
      default: return <Briefcase size={16} />;
    }
  };

  const navItems = [
    { id: "overview", name: "sidebar.overview", icon: LayoutDashboard },
    { id: "jobs", name: "sidebar.manage_jobs", icon: Briefcase },
    { id: "review", name: "sidebar.review_submissions", icon: ClipboardCheck },
    { id: "wallet", name: "sidebar.wallet", icon: Wallet },
    { id: "profile", name: "sidebar.profile", icon: UserIcon },
    { id: "settings", name: "sidebar.settings", icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {(nidStatus === 'Unverified' || nidStatus === 'Pending' || nidStatus === 'Under Review') && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(249,115,22,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-400">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-orange-400 font-medium text-sm">{t("common.identity_verification_required")}</h4>
              <p className="text-white/60 text-xs mt-0.5">{t("common.identity_verification_desc")}</p>
            </div>
          </div>
          <button onClick={() => setActiveTab("settings")} className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:text-orange-300 font-medium text-sm transition-all border border-orange-500/30 relative z-10 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            {t("common.go_to_settings")}
          </button>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-light text-white font-['Syne'] tracking-tight mb-2">
            {t("employer_dashboard.employer_portal")}
          </h1>
          <p className="text-white/50 font-light text-lg">
            {t("employer_dashboard.subtitle")}
          </p>
        </div>
        {(nidStatus === 'Unverified' || nidStatus === 'Pending' || nidStatus === 'Under Review') ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            className="px-6 py-3.5 rounded-full bg-white/5 text-white/40 border border-white/10 transition-all font-medium text-sm flex items-center gap-2 cursor-not-allowed"
          >
            <Lock size={16} />
            {t("common.verification_required")}
          </motion.button>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-full bg-[#7DF9AA]/10 text-[#7DF9AA] border border-[#7DF9AA]/30 hover:bg-[#7DF9AA]/20 transition-all font-medium text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(125,249,170,0.15)] hover:shadow-[0_0_30px_rgba(125,249,170,0.3)]"
          >
            <Plus size={18} />
            {t("employer_dashboard.post_new_job")}
          </motion.button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {[
          { label: t("employer_dashboard.stat_total_spent"), value: totalSpent, prefix: "৳", decimals: 2, change: t("employer_dashboard.stat_lifetime") },
          { label: t("employer_dashboard.stat_active_campaigns"), value: activeCount, prefix: "", decimals: 0, change: t("employer_dashboard.stat_currently_open") },
          { label: t("employer_dashboard.stat_pending_approvals"), value: pendingReviewCount, prefix: "", decimals: 0, change: t("employer_dashboard.stat_action_required"), highlight: true },
          { label: t("employer_dashboard.stat_engagement"), value: totalEngagement, prefix: "", decimals: 0, change: t("employer_dashboard.stat_total_submissions") },
          { label: t("employer_dashboard.stat_cost_per_completion"), value: costPerCompletion, prefix: "৳", decimals: 2, change: t("employer_dashboard.stat_avg_efficiency") },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            onClick={() => { if (stat.highlight && (stat.value as number) > 0) setActiveTab('review'); }}
            className={`glass p-6 rounded-3xl border border-white/10 hover:border-[#7DF9AA]/30 hover:bg-white/[0.03] transition-all group shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden flex flex-col justify-between ${stat.highlight && (stat.value as number) > 0 ? 'cursor-pointer' : ''}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors pointer-events-none ${stat.highlight && (stat.value as number) > 0 ? 'bg-orange-500/10 group-hover:bg-orange-500/20' : 'bg-[#7DF9AA]/5 group-hover:bg-[#7DF9AA]/10'}`} />
            <p className="text-[11px] text-white/50 mb-2 font-medium tracking-widest uppercase">{stat.label}</p>
            <h3 className={`text-3xl font-semibold font-['Syne'] mb-2 tracking-tight ${stat.highlight && (stat.value as number) > 0 ? 'text-orange-400' : 'text-white'}`}>
              <CountUpNumber value={stat.value as number} prefix={stat.prefix} decimals={stat.decimals} />
            </h3>
            <p className="text-xs text-white/40">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-3xl border border-white/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-medium text-white font-['Syne']">{t("employer_dashboard.recent_postings")}</h2>
          <button onClick={() => setActiveTab("jobs")} className="text-sm text-[#7DF9AA] hover:text-[#7DF9AA]/80 transition-colors font-medium">
            {t("common.view_all")}
          </button>
        </div>
        
        {loadingJobs ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#7DF9AA] animate-spin mb-4" />
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-4 font-light text-lg">{t("common.no_posts_yet")}</p>
            <button onClick={() => setIsModalOpen(true)} className="text-[#7DF9AA] hover:text-white transition-colors font-medium">
              {t("common.create_first_post")} &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.slice(0,3).map((job, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                key={job.id} 
                onClick={() => setActiveTab("jobs")}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group gap-4"
              >
                <div className="flex gap-5 items-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:scale-110 transition-transform duration-300 group-hover:border-[#7DF9AA]/30 group-hover:text-[#7DF9AA]">
                    {getCategoryIcon(job.category)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-base mb-1 group-hover:text-[#7DF9AA] transition-colors">{job.title}</h4>
                    <p className="text-white/40 text-sm">{job.category} &middot; {job.reward} {t("common.per_worker")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:block w-32 mr-2">
                     <div className="flex justify-between text-[10px] mb-1">
                       <span className="text-white/40">{t("common.progress")}</span>
                       <span className="text-[#7DF9AA]">{Math.round(((job.completedWorkers || 0) / (job.totalWorkers || 1)) * 100)}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(100, ((job.completedWorkers || 0) / (job.totalWorkers || 1)) * 100)}%` }}
                         transition={{ duration: 1 }}
                         className="h-full bg-[#7DF9AA] shadow-[0_0_8px_rgba(125,249,170,0.4)]"
                       />
                     </div>
                  </div>

                  <div className="opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1.5">
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Pause" onClick={(e) => { e.stopPropagation(); alert('Pause feature coming soon!'); }}>
                      <Pause size={14} />
                    </button>
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Duplicate" onClick={(e) => { e.stopPropagation(); alert('Duplicate feature coming soon!'); }}>
                      <Copy size={14} />
                    </button>
                    <button className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-colors" title="Delete" onClick={(e) => { e.stopPropagation(); alert('Delete feature coming soon!'); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-widest transition-transform duration-300 ${
                    job.status === 'completed' ? 'bg-[#7DF9AA]/10 text-[#7DF9AA] border-[#7DF9AA]/20' : 'bg-[#7DF9AA]/20 text-[#7DF9AA] border-[#7DF9AA]/30 shadow-[0_0_10px_rgba(125,249,170,0.2)]'
                  }`}>
                    {job.status === 'open' ? t("common.badge_live") : job.status === 'completed' ? t("common.badge_completed") : job.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-white font-['Syne'] tracking-tight">{t("manage_jobs.title")}</h1>
        {(nidStatus === 'Unverified' || nidStatus === 'Pending' || nidStatus === 'Under Review') ? (
          <button 
            className="px-5 py-2.5 rounded-full bg-white/10 text-white/40 cursor-not-allowed transition-all font-medium text-sm flex items-center gap-2"
          >
            <Lock size={16} />
            {t("common.verification_required")}
          </button>
        ) : (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 transition-all font-medium text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            {t("employer_dashboard.post_new")}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loadingJobs ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#7DF9AA] animate-spin mb-4" />
          </div>
        ) : activeJobs.map((job, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={job.id} 
            className="glass rounded-2xl border border-white/10 p-6 hover:border-[#7DF9AA]/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:text-[#7DF9AA] transition-colors">
                  {getCategoryIcon(job.category)}
                </div>
                <h3 className="text-xl font-medium text-white group-hover:text-[#7DF9AA] transition-colors">{job.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-2">
                  <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Pause" onClick={() => alert('Pause feature coming soon!')}>
                    <Pause size={14} />
                  </button>
                  <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Duplicate" onClick={() => alert('Duplicate feature coming soon!')}>
                    <Copy size={14} />
                  </button>
                  <button className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-colors" title="Delete" onClick={() => alert('Delete feature coming soon!')}>
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs border uppercase tracking-widest font-medium ${
                  job.status === 'completed' ? 'bg-[#7DF9AA]/10 text-[#7DF9AA] border-[#7DF9AA]/20' : 'bg-[#7DF9AA]/20 text-[#7DF9AA] border-[#7DF9AA]/30 shadow-[0_0_10px_rgba(125,249,170,0.2)]'
                }`}>
                  {job.status === 'open' ? t("common.badge_live") : job.status === 'completed' ? t("common.badge_completed") : job.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{t("manage_jobs.target_url")}</p>
                <a href={job.targetUrl} target="_blank" rel="noopener noreferrer" className="text-[#7DF9AA] hover:underline text-sm break-all">
                  {job.targetUrl}
                </a>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-white/40 text-xs uppercase tracking-wider font-medium">{t("manage_jobs.campaign_progress")}</p>
                  <p className="text-[#7DF9AA] text-xs font-bold">{job.completedWorkers || 0} / {job.totalWorkers || 1}</p>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((job.completedWorkers || 0) / (job.totalWorkers || 1)) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#7DF9AA]/80 to-[#7DF9AA] shadow-[0_0_10px_rgba(125,249,170,0.5)]"
                  />
                </div>
              </div>
            </div>

            <p className="text-white/60 font-light mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">{job.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10 text-sm">
              <span className="bg-white/5 px-3 py-1.5 rounded-lg text-white/70">{job.category}</span>
              <span className="bg-[#7DF9AA]/10 px-3 py-1.5 rounded-lg text-[#7DF9AA] font-medium border border-[#7DF9AA]/20">{job.reward} {t("common.per_worker")}</span>
              <span className="text-white/40 ml-auto">
                {job.createdAt ? new Date(job.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderProofText = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-[#7DF9AA] hover:text-[#7DF9AA]/80 underline decoration-[#7DF9AA]/40 underline-offset-4 transition-colors font-semibold"
          >
            {part} <ExternalLink size={14} className="ml-1" />
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderReview = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-white font-['Syne'] tracking-tight mb-2">{t("review_submissions.title")}</h1>
        <p className="text-white/50 font-light">{t("review_submissions.subtitle")}</p>
      </div>

      {reviewSubmissions.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border border-dashed border-white/10">
          <ClipboardCheck className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-lg">{t("review_submissions.no_submissions")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviewSubmissions.map((sub, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={sub.id} 
              className="glass rounded-3xl border border-white/10 p-6 sm:p-8 hover:border-[#7DF9AA]/30 transition-all group"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-medium text-white">{sub.jobTitle}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest border ${
                      sub.status === 'in_review' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      sub.status === 'pending_proof' ? 'bg-white/5 text-white/50 border-white/10' :
                      'bg-[#7DF9AA]/10 text-[#7DF9AA] border-[#7DF9AA]/20'
                    }`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-4">{t("review_submissions.job_category")}: <span className="text-white/70">{sub.jobCategory}</span></p>

                  {sub.status === 'in_review' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 shadow-inner">
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">{t("review_submissions.worker_proof")}</p>
                      <p className="text-white font-medium break-all whitespace-pre-wrap leading-relaxed">
                        {renderProofText(sub.proofText)}
                      </p>
                    </div>
                  )}

                  {sub.status === 'approved' && (
                    <div className="bg-[#7DF9AA]/5 border border-[#7DF9AA]/10 rounded-2xl p-4 mb-4 flex items-center gap-3">
                      <CheckCircle2 className="text-[#7DF9AA]" size={20} />
                      <p className="text-[#7DF9AA] text-sm font-medium">{t("review_submissions.payment_released")}</p>
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-auto bg-black/20 p-6 rounded-2xl border border-white/5 min-w-[240px] flex flex-col justify-between">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{t("review_submissions.escrow_amount")}</p>
                    <p className="text-3xl text-white font-semibold font-['Syne'] mb-6">
                      ৳{(sub.parsedReward || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  {sub.status === 'in_review' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApproveAndPay(sub)}
                      className="w-full py-3 rounded-xl bg-[#7DF9AA] text-black hover:bg-[#7DF9AA]/90 transition-colors font-semibold shadow-[0_0_20px_rgba(125,249,170,0.3)] flex items-center justify-center gap-2"
                    >
                      {t("review_submissions.btn_approve")}
                    </motion.button>
                  )}
                  {sub.status === 'pending_proof' && (
                    <p className="text-white/40 text-sm text-center">{t("review_submissions.waiting_proof")}</p>
                  )}
                  {sub.status === 'approved' && (
                    <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/30 font-medium cursor-not-allowed">
                      {t("review_submissions.btn_approved")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWallet = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-light text-white font-['Syne'] tracking-tight mb-2">
          {t("employer_wallet.title")}
        </h1>
        <p className="text-white/50 font-light text-lg">
          {t("employer_wallet.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 glass p-10 rounded-[2rem] border border-[#7DF9AA]/20 shadow-[0_0_40px_rgba(125,249,170,0.1)] relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7DF9AA]/10 rounded-full blur-[80px] pointer-events-none" />
          <p className="text-white/50 font-medium tracking-widest uppercase text-sm mb-2">{t("employer_wallet.current_balance")}</p>
          <h2 className="text-6xl sm:text-7xl font-bold text-white font-['Syne'] tracking-tighter mb-2">
            <span className="text-[#7DF9AA]">৳</span> {optimisticBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-white/40 text-sm mb-10 font-medium tracking-wide">
            ~ ${(optimisticBalance / 120).toFixed(2)} USD auto-converted
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#7DF9AA] text-black font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(125,249,170,0.4)]"
            >
              <ArrowDownToLine size={20} className="rotate-180" />
              {t("employer_wallet.btn_deposit")}
            </motion.button>
            <button onClick={() => setActiveTab("settings")} className="text-[#7DF9AA] hover:text-[#7DF9AA]/80 transition-colors text-sm font-medium border-b border-transparent hover:border-[#7DF9AA] pb-1">
              {t("employer_wallet.btn_configure_payment")}
            </button>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden"
          >
            <p className="text-white/50 font-medium tracking-wide uppercase text-xs mb-2">{t("employer_wallet.total_spent")}</p>
            <h3 className="text-3xl font-semibold text-white font-['Syne']">
              ৳{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden"
          >
            <p className="text-white/50 font-medium tracking-wide uppercase text-xs mb-2">{t("employer_wallet.active_escrow")}</p>
            <h3 className="text-3xl font-semibold text-white font-['Syne']">
              ৳{reviewSubmissions.filter(s => s.status !== 'approved').reduce((acc, curr) => acc + (curr.parsedReward || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[#7DF9AA]/60 text-xs mt-2">{t("employer_wallet.locked_in_jobs")}</p>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-[2rem] border border-white/10 p-8 sm:p-10"
      >
        <h3 className="text-xl font-['Syne'] text-white mb-6">{t("employer_wallet.recent_activity")}</h3>
        <div className="space-y-4">
          {reviewSubmissions.filter(s => s.status === 'approved').length === 0 ? (
             <p className="text-white/40 text-sm">{t("employer_wallet.no_spending")}</p>
          ) : (
            reviewSubmissions.filter(s => s.status === 'approved').slice(0, 5).map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Payment: {sub.jobTitle}</p>
                    <p className="text-white/40 text-xs mt-1">{sub.createdAt ? new Date(sub.createdAt.toMillis()).toLocaleDateString() : 'Recent'}</p>
                  </div>
                </div>
                <span className="text-red-400 font-semibold font-['Syne']">-৳{(sub.parsedReward || 0).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-light text-white font-['Syne'] tracking-tight mb-2">
          {t("profile.title")}
        </h1>
        <p className="text-white/50 font-light text-lg">
          {t("profile.subtitle")}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2rem] border border-white/10 p-10 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)] max-w-3xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7DF9AA]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7DF9AA]/20 to-transparent border border-[#7DF9AA]/30 flex items-center justify-center text-[#7DF9AA] text-4xl font-['Syne'] font-bold shadow-[0_0_30px_rgba(125,249,170,0.15)]">
            {getInitials()}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-semibold text-white font-['Syne'] tracking-tight">
                {userData?.fullName || t("common.anonymous_employer")}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 rounded-full bg-[#7DF9AA]/10 text-[#7DF9AA] text-xs font-medium border border-[#7DF9AA]/20 uppercase tracking-widest">
                  {userData?.role || "employer"}
                </span>
                <span className="text-white/40 text-sm flex items-center gap-1">
                  <MapPin size={14} /> {t("common.network_partner")}
                </span>
                {nidStatus === 'Verified' && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={12} /> {t("common.id_verified")}
                  </span>
                )}
              </div>
            </div>

            <p className="text-white/60 font-light leading-relaxed max-w-xl">
              {userData?.bio || "No biography provided. Update your settings to add a bio and tell workers more about the type of jobs you post."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-white/70">
                <Mail size={16} className="text-[#7DF9AA]" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Phone size={16} className="text-[#7DF9AA]" />
                <span className="text-sm">{userData?.phoneNumber || t("common.not_provided")}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const settingsTabs = [
    { id: "account", label: t("settings.tab_account"), icon: User },
    { id: "payment", label: t("settings.tab_payment"), icon: CreditCard },
    { id: "security", label: t("settings.tab_security"), icon: Shield },
    { id: "notifications", label: t("settings.tab_notifications"), icon: Bell },
    { id: "localization", label: t("settings.tab_localization"), icon: Globe },
  ];

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-light text-white font-['Syne'] tracking-tight mb-2">
            {t("settings.title")}
          </h1>
          <p className="text-white/50 font-light text-lg">
            {t("settings.subtitle")}
          </p>
        </div>
        
        <AnimatePresence>
          {settingsSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#7DF9AA]/10 border border-[#7DF9AA]/30 text-[#7DF9AA] text-sm font-medium"
            >
              <CheckCircle2 size={16} /> {t("common.saved_successfully")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Vertical Tab Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium text-sm border ${
                activeSettingsTab === tab.id
                  ? 'bg-[#7DF9AA]/10 text-[#7DF9AA] border-[#7DF9AA]/30 shadow-[0_0_20px_rgba(125,249,170,0.1)]'
                  : 'bg-white/5 text-white/50 border-transparent hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSettingsTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="glass rounded-[2rem] border border-white/10 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
            >
              {activeSettingsTab === "account" && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <h3 className="text-xl font-['Syne'] text-white mb-6 border-b border-white/10 pb-4">{t("settings.section_account")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium">{t("settings.full_name")}</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t("settings.full_name_placeholder")}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light text-base shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium">{t("settings.email_address")}</label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 cursor-not-allowed font-light text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium">{t("settings.phone_number")}</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+880 1..."
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light text-base shadow-inner"
                    />
                  </div>

                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xs text-[#7DF9AA] uppercase tracking-widest font-medium">{t("settings.nid_verification")}</label>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-widest ${
                        nidStatus === 'Verified' ? 'bg-[#7DF9AA]/10 text-[#7DF9AA] border-[#7DF9AA]/30 shadow-[0_0_15px_rgba(125,249,170,0.2)]' :
                        (nidStatus === 'Pending' || nidStatus === 'Under Review') ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]' :
                        'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      }`}>
                        {nidStatus}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={nidNumber}
                        onChange={(e) => setNidNumber(e.target.value)}
                        placeholder={t("settings.nid_placeholder")}
                        className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 transition-all font-medium tracking-widest shadow-inner"
                      />
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.upload_nid_front")}</label>
                          <div className="border border-dashed border-white/20 hover:border-[#7DF9AA]/50 bg-black/20 hover:bg-white/[0.02] transition-all rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer group h-32 relative">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#7DF9AA]/10 transition-all">
                              <Camera className="w-5 h-5 text-white/40 group-hover:text-[#7DF9AA] transition-colors" />
                            </div>
                            <p className="text-white/60 text-xs font-medium group-hover:text-white transition-colors">{t("settings.click_or_drop")}</p>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.upload_nid_back")}</label>
                          <div className="border border-dashed border-white/20 hover:border-[#7DF9AA]/50 bg-black/20 hover:bg-white/[0.02] transition-all rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer group h-32 relative">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#7DF9AA]/10 transition-all">
                              <CreditCard className="w-5 h-5 text-white/40 group-hover:text-[#7DF9AA] transition-colors" />
                            </div>
                            <p className="text-white/60 text-xs font-medium group-hover:text-white transition-colors">{t("settings.click_or_drop")}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/30 text-xs">{t("settings.image_requirements")}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSavingSettings} className="px-8 py-3.5 rounded-xl bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center gap-2">
                      {isSavingSettings ? <Loader2 size={18} className="animate-spin" /> : t("settings.btn_save_account")}
                    </motion.button>
                  </div>
                </form>
              )}

              {activeSettingsTab === "payment" && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <h3 className="text-xl font-['Syne'] text-white mb-6 border-b border-white/10 pb-4">{t("settings.payment_gateways")}</h3>
                  
                  <div className="space-y-5">
                    <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-colors group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                          <CreditCard size={14} className="text-pink-400" />
                        </div>
                        <label className="block text-sm text-pink-400 font-medium">{t("settings.bkash_label")}</label>
                      </div>
                      <input
                        type="text"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        placeholder="e.g. 01700000000"
                        className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-all shadow-inner font-medium tracking-wider"
                      />
                    </div>

                    <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <CreditCard size={14} className="text-orange-400" />
                        </div>
                        <label className="block text-sm text-orange-400 font-medium">{t("settings.nagad_label")}</label>
                      </div>
                      <input
                        type="text"
                        value={nagadNumber}
                        onChange={(e) => setNagadNumber(e.target.value)}
                        placeholder="e.g. 01800000000"
                        className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all shadow-inner font-medium tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSavingSettings} className="px-8 py-3.5 rounded-xl bg-[#7DF9AA] text-black font-semibold shadow-[0_0_20px_rgba(125,249,170,0.3)] disabled:opacity-50 flex items-center gap-2">
                      {isSavingSettings ? <Loader2 size={18} className="animate-spin" /> : t("settings.btn_save_methods")}
                    </motion.button>
                  </div>
                </form>
              )}

              {activeSettingsTab === "security" && (
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <h3 className="text-xl font-['Syne'] text-white mb-6 border-b border-white/10 pb-4">{t("settings.security_title")}</h3>
                  
                  {passwordError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                      <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-red-400 text-sm">{passwordError}</p>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="p-4 rounded-xl bg-[#7DF9AA]/10 border border-[#7DF9AA]/20 flex items-start gap-3">
                      <CheckCircle2 className="text-[#7DF9AA] flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-[#7DF9AA] text-sm">{passwordSuccess}</p>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.current_password")}</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 transition-all font-light shadow-inner"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium">{t("settings.new_password")}</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 transition-all font-light shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium">{t("settings.confirm_password")}</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 transition-all font-light shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isUpdatingPassword} className="px-8 py-3.5 rounded-xl bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center gap-2">
                      {isUpdatingPassword ? <Loader2 size={18} className="animate-spin" /> : t("settings.btn_update_password")}
                    </motion.button>
                  </div>
                </form>
              )}

              {activeSettingsTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-['Syne'] text-white mb-6 border-b border-white/10 pb-4">{t("settings.notifications_title")}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <h4 className="text-white font-medium mb-1">{t("settings.email_notifications")}</h4>
                        <p className="text-white/40 text-sm">{t("settings.email_notif_desc")}</p>
                      </div>
                      <button 
                        onClick={() => { setEmailNotif(!emailNotif); handleSaveSettings(); }}
                        className={`w-12 h-6 rounded-full transition-colors relative ${emailNotif ? 'bg-[#7DF9AA]' : 'bg-white/10'}`}
                      >
                        <motion.div animate={{ x: emailNotif ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <h4 className="text-white font-medium mb-1">{t("settings.push_notifications")}</h4>
                        <p className="text-white/40 text-sm">{t("settings.push_notif_desc")}</p>
                      </div>
                      <button 
                        onClick={() => { setPushNotif(!pushNotif); handleSaveSettings(); }}
                        className={`w-12 h-6 rounded-full transition-colors relative ${pushNotif ? 'bg-[#7DF9AA]' : 'bg-white/10'}`}
                      >
                        <motion.div animate={{ x: pushNotif ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === "localization" && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <h3 className="text-xl font-['Syne'] text-white mb-6 border-b border-white/10 pb-4">{t("settings.localization_title")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium">{t("settings.language")}</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#7DF9AA]/50 transition-all font-medium appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2em' }}
                      >
                        <option value="English" className="bg-[#050508]">English (US)</option>
                        <option value="Bengali" className="bg-[#050508]">Bengali (বাংলা)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium">{t("settings.timezone")}</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#7DF9AA]/50 transition-all font-medium appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2em' }}
                      >
                        <option value="UTC+6 (Dhaka)" className="bg-[#050508]">UTC+06:00 (Dhaka)</option>
                        <option value="UTC (London)" className="bg-[#050508]">UTC+00:00 (London)</option>
                        <option value="UTC-5 (New York)" className="bg-[#050508]">UTC-05:00 (New York)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSavingSettings} className="px-8 py-3.5 rounded-xl bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center gap-2">
                      {isSavingSettings ? <Loader2 size={18} className="animate-spin" /> : t("settings.btn_save_preferences")}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      role="employer" 
      navItems={navItems} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === "overview" && renderOverview()}
      {activeTab === "jobs" && renderJobs()}
      {activeTab === "review" && renderReview()}
      {activeTab === "wallet" && renderWallet()}
      {activeTab === "profile" && renderProfile()}
      {activeTab === "settings" && renderSettings()}

      {/* Multi-Step Job Wizard Modal */}
      <AnimatePresence>
        <JobWizardModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); }}
          onSubmit={async (data) => {
            setTitle(data.title);
            setCategory(data.category);
            setTargetUrl(data.targetUrl);
            setReward(data.reward);
            setTotalWorkers(data.totalWorkers);
            setDescription(data.description);
            setRequiredProof(data.requiredProof);
            // Use inline submit logic
            if (!user) return;
            const parsedReward = parseFloat(data.reward);
            const parsedWorkers = parseInt(data.totalWorkers);
            const totalCostCalc = parsedReward * parsedWorkers;
            if (optimisticBalance < totalCostCalc) {
              alert("Insufficient funds! Please deposit more funds into your wallet to post this job.");
              throw new Error("Insufficient funds");
            }
            await addDoc(collection(db, "jobs"), {
              employerId: user.uid,
              title: data.title,
              category: data.category,
              targetUrl: data.targetUrl,
              reward: `৳${parsedReward.toFixed(2)}`,
              parsedReward,
              totalWorkers: parsedWorkers,
              completedWorkers: 0,
              description: data.description,
              requiredProof: data.requiredProof,
              status: "open",
              createdAt: serverTimestamp()
            });
            setIsModalOpen(false);
            setActiveTab("jobs");
          }}
          balance={optimisticBalance}
        />
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsDepositModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass border border-[#7DF9AA]/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(125,249,170,0.1)] bg-black/50 text-center"
            >
              <button 
                onClick={() => setIsDepositModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-[#7DF9AA]/10 border border-[#7DF9AA]/30 mx-auto flex items-center justify-center mb-6">
                <Wallet className="w-8 h-8 text-[#7DF9AA]" />
              </div>

              <h2 className="text-2xl font-['Syne'] text-white mb-2 tracking-tight">{t("deposit.title")}</h2>
              <p className="text-white/50 text-sm mb-8">{t("deposit.subtitle")}</p>
              
              {depositSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#7DF9AA]/10 border border-[#7DF9AA]/30 rounded-2xl p-6 py-8 my-6 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(125,249,170,0.15)]"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#7DF9AA] mb-4" />
                  <p className="text-[#7DF9AA] font-bold text-lg mb-1">{t("deposit.verified")}</p>
                  <p className="text-white/60 text-sm">{t("deposit.funds_added")}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleDeposit} className="space-y-6">
                  <div className="text-left">
                    <label className="block text-xs text-white/50 uppercase tracking-widest mb-3 font-medium">{t("deposit.select_method")}</label>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <button 
                        type="button"
                        onClick={() => setDepositMethod('bkash')}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                          depositMethod === 'bkash' ? 'bg-[#E2136E]/10 border-[#E2136E]/50 shadow-[0_0_15px_rgba(226,19,110,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white`}>
                          <Image src="/bkash-logo.jpg" alt="bKash" width={48} height={48} className="object-contain w-full h-full" />
                        </div>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDepositMethod('nagad')}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                          depositMethod === 'nagad' ? 'bg-[#F7931E]/10 border-[#F7931E]/50 shadow-[0_0_15px_rgba(247,147,30,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white`}>
                          <Image src="/nagad-logo.jpg" alt="Nagad" width={48} height={48} className="object-contain w-full h-full p-1" />
                        </div>
                      </button>
                    </div>

                    <AnimatePresence>
                      {depositMethod && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4 text-center">
                            <p className="text-white/60 text-xs mb-1">{t("deposit.send_money_instruction")}</p>
                            <p className="text-xl font-medium tracking-widest text-[#7DF9AA] font-['Syne']">01636618185</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="text-[#7DF9AA] text-xl font-medium">৳</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Deposit Amount (৳)"
                        className="w-full pl-10 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-medium text-xl shadow-inner"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        placeholder="Transaction ID (TrxID)"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-medium text-base shadow-inner"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {depositError && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-left">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-xs font-medium">{depositError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-[#7DF9AA] text-black hover:bg-[#7DF9AA]/90 transition-colors font-semibold flex items-center justify-center h-14 text-lg shadow-[0_0_20px_rgba(125,249,170,0.4)]"
                  >
                    {t("deposit.btn_confirm")}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
