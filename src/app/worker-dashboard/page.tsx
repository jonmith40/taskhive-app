"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { collection, query, where, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Briefcase, Search, Clock, MapPin, LayoutDashboard, User as UserIcon, Settings, CheckCircle2, Wallet, X, ArrowDownToLine, CheckSquare, Send, ExternalLink, ChevronDown, ChevronUp, Mail, Phone, User, CreditCard, Shield, Bell, Globe, AlertCircle, Lock, Video, ThumbsUp, Camera, Music, UserPlus, Smartphone, ArrowRight, Activity, TrendingUp, TrendingDown } from "lucide-react";
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
export default function WorkerDashboard() {
  const { user, userData } = useAuth();
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Data States
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Expanded Job State
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Wallet State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [optimisticBalance, setOptimisticBalance] = useState<number>(0);
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Proof Input State mapping submissionId -> string
  const [proofInputs, setProofInputs] = useState<Record<string, string>>({});

  // Rating State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingTargetId, setRatingTargetId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingText, setRatingText] = useState("");

  // Appeal State
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [appealTargetId, setAppealTargetId] = useState<string | null>(null);
  const [appealText, setAppealText] = useState("");

  // --- SETTINGS STATE ---
  const [activeSettingsTab, setActiveSettingsTab] = useState("account");
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Account
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidStatus, setNidStatus] = useState("Unverified");

  // Employer Profile Modal State
  const [isEmployerModalOpen, setIsEmployerModalOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);

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

  useEffect(() => {
    if (userData?.balance !== undefined) {
      setOptimisticBalance(userData.balance);
    }
  }, [userData?.balance]);

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || "");
      setProfileImage(userData.avatarUrl || null);
      setPhoneNumber(userData.phoneNumber || "");
      setNidNumber(userData.nidNumber || "");
      setNidStatus(userData.nidStatus || "Unverified");
      setBkashNumber(userData.bkashNumber || "");
      setNagadNumber(userData.nagadNumber || "");
      setEmailNotif(userData.emailNotifications !== false);
      setPushNotif(userData.pushNotifications !== false);
      setLanguage(userData.language || "English");
      setTimezone(userData.timezone || "UTC+6 (Dhaka)");
    }
  }, [userData]);

  useEffect(() => {
    // Listen to Available Jobs
    const qJobs = query(collection(db, "jobs"), where("status", "==", "open"));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      let jobsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      jobsData = jobsData.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setAvailableJobs(jobsData);
      setLoadingJobs(false);
    });

    return () => unsubJobs();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Listen to Worker Submissions
    const qSubs = query(collection(db, "submissions"), where("workerId", "==", user.uid));
    const unsubSubs = onSnapshot(qSubs, (snapshot) => {
      let subsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      subsData = subsData.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setMySubmissions(subsData);
    });
    return () => unsubSubs();
  }, [user]);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    setWithdrawError("");

    if (!withdrawMethod) {
      setWithdrawError("Please select a withdrawal method (bKash or Nagad).");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    if (amount < 100) {
      setWithdrawError("Minimum withdrawal limit is ৳100.");
      return;
    }

    if (amount > optimisticBalance) {
      setWithdrawError("Insufficient funds! You cannot withdraw more than your available balance.");
      return;
    }
    
    // Optimistic Update
    setOptimisticBalance(prev => prev - amount);
    setWithdrawSuccess(true);
    
    setTimeout(() => {
      setIsWithdrawModalOpen(false);
      setWithdrawSuccess(false);
      setWithdrawAmount("");
      setWithdrawMethod(null);
    }, 2500);
    
    const userRef = doc(db, "users", user.uid);
    updateDoc(userRef, {
      balance: increment(-amount)
    }).catch((error: unknown) => {
      console.error("Error withdrawing funds:", error);
      setWithdrawError(error instanceof Error ? error.message : "An error occurred");
      if (userData?.balance !== undefined) {
        setOptimisticBalance(userData.balance);
      }
    });
  };

  const handleApply = async (e: React.MouseEvent, job: any) => {
    e.stopPropagation(); // Prevent expanding the card when clicking apply
    if (!user) return;
    // Prevent double applying
    if (mySubmissions.find(s => s.jobId === job.id)) return;
    
    try {
      const parsedReward = job.parsedReward || parseFloat((job.reward || "0").replace(/[^0-9.]/g, '')) || 0;
      await addDoc(collection(db, "submissions"), {
        workerId: user.uid,
        jobId: job.id,
        employerId: job.employerId,
        jobTitle: job.title,
        jobCategory: job.category,
        rewardString: `৳${parsedReward.toFixed(2)}`,
        parsedReward: parsedReward,
        requiredProof: job.requiredProof || "Provide proof of work",
        status: 'pending_proof',
        createdAt: serverTimestamp(),
      });
      setActiveTab("submissions");
    } catch (error) {
      console.error("Error applying to job:", error);
    }
  };

  const handleSubmitProof = (subId: string) => {
    const proofText = proofInputs[subId];
    if (!proofText || proofText.trim() === "") return;

    // Optimistic Update locally
    setMySubmissions(prev => prev.map(sub => 
      sub.id === subId ? { ...sub, status: 'in_review', proofText } : sub
    ));
    setProofInputs(prev => ({ ...prev, [subId]: "" }));

    const subRef = doc(db, "submissions", subId);
    updateDoc(subRef, {
      status: 'in_review',
      proofText: proofText
    }).catch(console.error);
  };

  const handleSubmitRating = () => {
    if (!ratingTargetId || ratingValue === 0) return;
    
    // Optimistic Update
    setMySubmissions(prev => prev.map(sub => 
      sub.id === ratingTargetId ? { ...sub, employerRated: true, ratingValue } : sub
    ));
    
    const subRef = doc(db, "submissions", ratingTargetId);
    updateDoc(subRef, { employerRated: true, ratingValue, ratingText }).catch(console.error);
    
    setIsRatingModalOpen(false);
    setRatingValue(0);
    setRatingText("");
    setRatingTargetId(null);
  };

  const handleSubmitAppeal = () => {
    if (!appealTargetId || !appealText.trim()) return;

    // Optimistic Update
    setMySubmissions(prev => prev.map(sub => 
      sub.id === appealTargetId ? { ...sub, status: 'in_dispute', appealText } : sub
    ));
    
    const subRef = doc(db, "submissions", appealTargetId);
    updateDoc(subRef, { status: 'in_dispute', appealText }).catch(console.error);
    
    setIsAppealModalOpen(false);
    setAppealText("");
    setAppealTargetId(null);
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
        avatarUrl: profileImage,
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

  const handleOpenEmployerProfile = (id: string, name: string) => {
    setSelectedEmployer({ id, name, avatarUrl: null }); // AvatarUrl mock for now
    setIsEmployerModalOpen(true);
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

  const filteredJobs = availableJobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      job.title.toLowerCase().includes(searchLower) || 
      job.category.toLowerCase().includes(searchLower) ||
      (job.description && job.description.toLowerCase().includes(searchLower));
    const matchesCategory = activeCategory === "All" || job.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const activeSubCount = mySubmissions.filter(s => s.status !== 'approved').length;
  const completedJobs = mySubmissions.filter(s => s.status === 'approved').length;
  const totalEarned = mySubmissions.filter(s => s.status === 'approved').reduce((acc, curr) => acc + (curr.parsedReward || 0), 0);
  const pendingReview = mySubmissions.filter(s => s.status === 'in_review').length;
  const successRate = mySubmissions.length > 0 ? ((completedJobs / mySubmissions.filter(s => s.status === 'approved' || s.status === 'rejected').length) * 100 || 100).toFixed(1) : "0.0";

  const navItems = [
    { id: "overview", name: "sidebar.overview", icon: LayoutDashboard },
    { id: "jobs", name: "sidebar.browse_jobs", icon: Search },
    { id: "submissions", name: "sidebar.my_submissions", icon: CheckSquare },
    { id: "wallet", name: "sidebar.earnings_hub", icon: Wallet },
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-light text-white font-['Syne'] tracking-tight mb-2 flex items-center flex-wrap gap-4">
            {t("dashboard.welcome")} <span className="font-bold text-[#7DF9AA]">{userData?.fullName?.split(' ')[0] || "Worker"}</span>
          </h1>
          <p className="text-white/50 font-light text-lg">
            {t("dashboard.today_activity")}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:scale-105 transition-transform cursor-default">
          <span className="text-xl">🔥</span>
          <span className="text-orange-400 font-bold tracking-wide">{t("dashboard.streak_days")}</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 sm:p-8 rounded-[2rem] border border-[#7DF9AA]/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:border-[#7DF9AA]/40 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7DF9AA]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#7DF9AA]/10 transition-colors" />
          <p className="text-sm text-white/50 mb-2 font-medium tracking-wide uppercase">{t("dashboard.total_earned")}</p>
          <h3 className="text-4xl font-semibold text-white font-['Syne'] mb-2 tracking-tight">
            <span className="text-[#7DF9AA]">৳</span><CountUpNumber value={mySubmissions.filter(s => s.status === 'approved').reduce((acc, curr) => acc + (curr.parsedReward || 0), 0)} decimals={2} />
          </h3>
          <p className="text-sm text-[#7DF9AA] flex items-center gap-1"><TrendingUp size={14} /> {t("dashboard.lifetime_earnings")}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-3xl border border-white/10 hover:border-[#7DF9AA]/30 transition-all group shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <p className="text-sm text-white/50 mb-2 font-medium tracking-wide uppercase">{t("dashboard.pending_review")}</p>
          <h3 className="text-4xl font-semibold text-white font-['Syne'] mb-2 tracking-tight">
            <CountUpNumber value={pendingReview} />
          </h3>
          <p className="text-sm text-white/40 flex items-center gap-1">{t("dashboard.awaiting_employer")}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-3xl border border-white/10 hover:border-[#7DF9AA]/30 transition-all group shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <p className="text-sm text-white/50 mb-2 font-medium tracking-wide uppercase">{t("dashboard.success_rate")}</p>
          <h3 className="text-4xl font-semibold text-white font-['Syne'] mb-2 tracking-tight">
            <CountUpNumber value={parseFloat(successRate)} suffix="%" decimals={1} />
          </h3>
          <p className="text-sm text-[#7DF9AA] flex items-center gap-1"><CheckCircle2 size={14} /> {t("dashboard.excellent_standing")}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-medium text-white font-['Syne']">{t("dashboard.available_jobs")}</h2>
            <button onClick={() => setActiveTab("jobs")} className="text-sm text-[#7DF9AA] hover:text-[#7DF9AA]/80 transition-colors font-medium">
              {t("common.view_all")}
            </button>
          </div>

          {loadingJobs ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#7DF9AA]" /></div>
          ) : availableJobs.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl border border-white/10"><p className="text-white/50">{t("dashboard.no_jobs_available")}</p></div>
          ) : (
            <div className="space-y-4">
              {availableJobs.slice(0, 4).map((job, i) => {
                const slotsLeft = (job.totalWorkers || 1) - (job.completedWorkers || 0);
                return (
                  <div key={job.id} onClick={() => setActiveTab("jobs")} className="glass p-5 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-[#7DF9AA] transition-colors">
                        {getCategoryIcon(job.category)}
                      </div>
                      <div>
                        <h4 className="text-white font-medium group-hover:text-[#7DF9AA] transition-colors">{job.title}</h4>
                        <p className="text-white/40 text-xs mt-1">{job.category}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[#7DF9AA] font-medium font-['Syne']">৳{job.parsedReward}</p>
                      {slotsLeft <= 10 ? (
                        <span className="text-orange-400 bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded animate-pulse mt-1 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                          Only {slotsLeft} left!
                        </span>
                      ) : (
                        <p className="text-white/30 text-xs mt-1">{slotsLeft} slots</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-6 rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-fit"
        >
          <h2 className="text-xl font-medium text-white font-['Syne'] mb-6">{t("dashboard.recent_submissions")}</h2>
          
          {mySubmissions.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">{t("dashboard.no_recent_activity")}</p>
          ) : (
            <div className="space-y-5">
              {mySubmissions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-start gap-4">
                  <div className="mt-1">
                    {sub.status === 'approved' && <CheckCircle2 size={16} className="text-[#7DF9AA]" />}
                    {sub.status === 'in_review' && <Clock size={16} className="text-blue-400" />}
                    {sub.status === 'pending_proof' && <AlertCircle size={16} className="text-orange-400" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white line-clamp-1">{sub.jobTitle}</h4>
                    <p className="text-xs text-white/50 mt-1 capitalize">{sub.status.replace('_', ' ')} &middot; {sub.rewardString}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-light text-white font-['Syne'] tracking-tight mb-2">{t("browse_jobs.title")}</h1>
            <p className="text-white/50">{t("browse_jobs.subtitle")}</p>
          </div>
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t("browse_jobs.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light text-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            />
          </div>
        </div>

        {/* Category Filter System */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide w-full border-b border-white/5">
          {["All", "YouTube", "Facebook", "TikTok", "Instagram", "App Install", "Website Sign Up", "Other"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative ${
                activeCategory === cat 
                  ? "text-black bg-[#7DF9AA] shadow-[0_0_20px_rgba(125,249,170,0.3)]"
                  : "text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loadingJobs ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-[#7DF9AA] animate-spin mb-4" />
          <p className="text-white/40 mt-4">{t("browse_jobs.no_match")}</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border border-dashed border-white/10">
          <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-lg">No jobs match your search.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job, i) => {
              const hasApplied = mySubmissions.some(s => s.jobId === job.id);
              const slotsLeft = (job.totalWorkers || 1) - (job.completedWorkers || 0);
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={job.id} 
                  className="flex flex-col p-6 rounded-3xl glass border border-white/10 hover:border-[#7DF9AA]/30 hover:bg-white/[0.03] transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative"
                >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:text-[#7DF9AA] transition-colors">
                      {getCategoryIcon(job.category)}
                    </div>
                    <div>
                      <span className="text-white/50 text-xs uppercase tracking-wider font-medium block">{job.category}</span>
                      <div 
                        onClick={(e) => { e.stopPropagation(); handleOpenEmployerProfile(job.employerId, "Verified Employer"); }}
                        className="flex items-center gap-1 text-[10px] mt-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        <UserIcon size={10} /> Employer <span className="text-yellow-400">⭐ 4.8</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#7DF9AA]/10 text-[#7DF9AA] text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[#7DF9AA]/20">NEW</span>
                </div>
                
                {/* Body */}
                <div className="flex-1">
                  <h4 className="text-white font-medium text-lg leading-tight mb-3 group-hover:text-[#7DF9AA] transition-colors line-clamp-2">{job.title}</h4>
                  
                  <div className="mb-4">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1 font-medium">Action:</p>
                    <p className="text-white/70 text-sm font-light leading-relaxed line-clamp-2">{job.description}</p>
                  </div>

                  <div className="mb-2">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1 font-medium">Reward:</p>
                    <p className="text-[#7DF9AA] font-bold font-['Syne'] text-2xl">৳{(job.parsedReward || 0).toFixed(2)}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-5 mt-4 border-t border-white/10">
                  <div className="flex flex-col gap-1 text-sm font-medium">
                    {slotsLeft <= 10 ? (
                      <span className="text-orange-400 bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded animate-pulse mt-1 shadow-[0_0_10px_rgba(249,115,22,0.2)] w-fit inline-flex">
                        Only {slotsLeft} left!
                      </span>
                    ) : (
                      <span className="text-white/50 flex items-center gap-2"><UserIcon size={16} />{slotsLeft} {t("browse_jobs.slots_left")}</span>
                    )}
                  </div>
                  {hasApplied ? (
                    <span className="px-5 py-2.5 rounded-full bg-white/5 text-white/40 text-sm font-medium border border-white/10 flex items-center gap-2">
                      <CheckCircle2 size={16} /> {t("browse_jobs.btn_applied")}
                    </span>
                  ) : (nidStatus === 'Unverified' || nidStatus === 'Pending' || nidStatus === 'Under Review') ? (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      className="px-5 py-2.5 rounded-full bg-white/5 text-white/40 text-sm font-medium border border-white/10 flex items-center gap-2 cursor-not-allowed transition-all"
                    >
                      <Lock size={16} /> {t("browse_jobs.btn_verify_to_apply")}
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleApply(e, job)}
                      className="px-5 py-2.5 rounded-full bg-[#7DF9AA] text-black text-sm font-bold shadow-[0_0_20px_rgba(125,249,170,0.3)] hover:bg-[#7DF9AA]/90 transition-all flex items-center gap-2"
                    >
                      {t("browse_jobs.btn_apply_now")} <ArrowRight size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-white font-['Syne'] tracking-tight mb-2">{t("submissions.title")}</h1>
        <p className="text-white/50">{t("submissions.subtitle")}</p>
      </div>

      {mySubmissions.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border border-dashed border-white/10">
          <CheckSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-lg mb-4">{t("submissions.no_submissions")}</p>
          <button onClick={() => setActiveTab("jobs")} className="text-[#7DF9AA] hover:text-white transition-colors">
            {t("submissions.start_browsing")} &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {mySubmissions.map((sub, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={sub.id} 
              className="glass rounded-3xl border border-white/10 p-6 sm:p-8 hover:border-[#7DF9AA]/30 transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-medium text-white group-hover:text-[#7DF9AA] transition-colors">{sub.jobTitle}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest border ${
                      sub.status === 'pending_proof' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      sub.status === 'in_review' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      sub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      sub.status === 'in_dispute' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-[#7DF9AA]/10 text-[#7DF9AA] border-[#7DF9AA]/20'
                    }`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div 
                      onClick={() => handleOpenEmployerProfile(sub.employerId, "Verified Employer")}
                      className="flex items-center gap-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      <UserIcon size={14} /> <span className="underline decoration-white/20 underline-offset-2">Employer Profile</span>
                    </div>
                    <span className="text-white/40">{sub.jobCategory}</span>
                    <span className="text-[#7DF9AA] font-medium font-['Syne'] bg-[#7DF9AA]/10 px-3 py-1 rounded-lg border border-[#7DF9AA]/20">৳{(sub.parsedReward || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {sub.status === 'pending_proof' && (
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mt-4">
                  <p className="text-white/80 font-medium mb-2 text-sm">{t("submissions.required_proof")}</p>
                  <p className="text-[#7DF9AA]/80 text-sm mb-4 p-3 bg-black/20 rounded-lg border border-[#7DF9AA]/10">{sub.requiredProof}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder={t("submissions.proof_placeholder")}
                      value={proofInputs[sub.id] || ""}
                      onChange={(e) => setProofInputs({ ...proofInputs, [sub.id]: e.target.value })}
                      className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all text-sm"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmitProof(sub.id)}
                      className="px-6 py-3 rounded-xl bg-[#7DF9AA] text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(125,249,170,0.3)] whitespace-nowrap"
                    >
                      <Send size={16} />
                      {t("submissions.btn_submit_proof")}
                    </motion.button>
                  </div>
                </div>
              )}

              {sub.status === 'in_review' && (
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mt-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm mb-1">{t("Your proof is under review.")}</p>
                    <p className="text-white/40 text-xs break-all">Submitted: "{sub.proofText}"</p>
                  </div>
                </div>
              )}

              {sub.status === 'approved' && (
                <div className="bg-[#7DF9AA]/5 rounded-2xl p-5 border border-[#7DF9AA]/10 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#7DF9AA]/20 flex items-center justify-center flex-shrink-0 text-[#7DF9AA]">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-[#7DF9AA] font-medium text-sm mb-1">{t("submissions.job_completed_paid")}</p>
                      <p className="text-white/40 text-xs">{t("submissions.payment_released_desc")}</p>
                    </div>
                  </div>
                  {!sub.employerRated && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setRatingTargetId(sub.id); setIsRatingModalOpen(true); }}
                      className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#7DF9AA]/10 text-[#7DF9AA] border border-[#7DF9AA]/30 hover:bg-[#7DF9AA]/20 text-xs font-semibold flex items-center gap-2"
                    >
                      ⭐ {t("submissions.rate_employer")}
                    </motion.button>
                  )}
                  {sub.employerRated && (
                    <span className="text-yellow-400 text-xs font-medium bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20 flex items-center gap-1">
                      Rated {sub.ratingValue} ⭐
                    </span>
                  )}
                </div>
              )}

              {sub.status === 'rejected' && (
                <div className="bg-red-500/5 rounded-2xl p-5 border border-red-500/10 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 text-red-400">
                      <X size={20} />
                    </div>
                    <div>
                      <p className="text-red-400 font-medium text-sm mb-1">{t("submissions.rejection_title")}</p>
                      <p className="text-white/40 text-xs">{t("submissions.rejection_desc")}</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setAppealTargetId(sub.id); setIsAppealModalOpen(true); }}
                    className="whitespace-nowrap px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    <AlertCircle size={14} />
                    {t("submissions.btn_appeal")}
                  </motion.button>
                </div>
              )}

              {sub.status === 'in_dispute' && (
                <div className="bg-amber-500/5 rounded-2xl p-5 border border-amber-500/10 mt-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-amber-400 font-medium text-sm mb-1">{t("submissions.in_dispute")}</p>
                    <p className="text-white/40 text-xs">{t("submissions.dispute_desc")}</p>
                  </div>
                </div>
              )}
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
          {t("earnings.title")}
        </h1>
        <p className="text-white/50 font-light text-lg">
          {t("earnings.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 glass p-10 rounded-[2rem] border border-[#7DF9AA]/20 shadow-[0_0_40px_rgba(125,249,170,0.1)] relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7DF9AA]/10 rounded-full blur-[80px] pointer-events-none" />
          <p className="text-white/50 font-medium tracking-widest uppercase text-sm mb-2">{t("earnings.available_balance")}</p>
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
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#7DF9AA] text-black font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(125,249,170,0.3)]"
            >
              <ArrowDownToLine size={20} />
              {t("earnings.btn_withdraw")}
            </motion.button>
            <button onClick={() => setActiveTab("settings")} className="text-white/50 hover:text-white transition-colors text-sm font-medium border-b border-transparent hover:border-white pb-1">
              {t("earnings.btn_configure_payout")}
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
            <p className="text-white/50 font-medium tracking-wide uppercase text-xs mb-2">{t("earnings.lifetime_earnings")}</p>
            <h3 className="text-3xl font-semibold text-white font-['Syne']">
              ৳{mySubmissions.filter(s => s.status === 'approved').reduce((acc, curr) => acc + (curr.parsedReward || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden"
          >
            <p className="text-white/50 font-medium tracking-wide uppercase text-xs mb-2">{t("earnings.funds_in_review")}</p>
            <h3 className="text-3xl font-semibold text-white font-['Syne']">
              ৳{mySubmissions.filter(s => s.status !== 'approved').reduce((acc, curr) => acc + (curr.parsedReward || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[#7DF9AA]/60 text-xs mt-2">{t("earnings.locked_in_jobs")}</p>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-[2rem] border border-white/10 p-8 sm:p-10"
      >
        <h3 className="text-xl font-['Syne'] text-white mb-6">{t("earnings.recent_activity")}</h3>
        <div className="space-y-4">
          {mySubmissions.filter(s => s.status === 'approved').length === 0 ? (
             <p className="text-white/40 text-sm">{t("employer_wallet.no_spending")}</p>
          ) : (
            mySubmissions.filter(s => s.status === 'approved').slice(0, 5).map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#7DF9AA]/10 flex items-center justify-center text-[#7DF9AA]">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Earning: {sub.jobTitle}</p>
                    <p className="text-white/40 text-xs mt-1">{sub.createdAt ? new Date(sub.createdAt.toMillis()).toLocaleDateString() : 'Recent'}</p>
                  </div>
                </div>
                <span className="text-[#7DF9AA] font-semibold font-['Syne']">+৳{(sub.parsedReward || 0).toFixed(2)}</span>
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center text-white text-4xl font-['Syne'] font-bold shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            {getInitials()}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-semibold text-white font-['Syne'] tracking-tight">
                {userData?.fullName || t("common.anonymous_worker")}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20 uppercase tracking-widest">
                  {userData?.role || "worker"}
                </span>
                <span className="text-white/40 text-sm flex items-center gap-1">
                  <MapPin size={14} /> {t("common.network_contributor")}
                </span>
                {nidStatus === 'Verified' && (
                  <span className="px-3 py-1 rounded-full bg-[#7DF9AA]/10 text-[#7DF9AA] text-xs font-medium border border-[#7DF9AA]/20 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={12} /> {t("common.id_verified")}
                  </span>
                )}
              </div>
            </div>

            <p className="text-white/60 font-light leading-relaxed max-w-xl">
              {userData?.bio || t("common.no_biography_worker")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-white/70">
                <Mail size={16} className="text-white/40" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Phone size={16} className="text-white/40" />
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
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium"
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
                  ? 'bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
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
                  
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full border-2 border-white/20 overflow-hidden bg-white/5 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        {profileImage ? (
                          <Image src={profileImage} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-3xl font-bold text-white/20">{getInitials()}</div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera className="text-white w-6 h-6" />
                      </div>
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <p className="text-white/40 text-[10px] mt-3 uppercase tracking-widest font-bold">{t("settings.profile_picture") || "Profile Picture"}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.full_name")}</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t("settings.full_name_placeholder")}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all font-light text-base shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.email_address")}</label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 cursor-not-allowed font-light text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.phone_number")}</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+880 1..."
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all font-light text-base shadow-inner"
                    />
                  </div>

                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xs text-white/50 uppercase tracking-widest font-medium">{t("settings.nid_verification")}</label>
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
                        className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-all font-medium tracking-widest shadow-inner"
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
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSavingSettings} className="px-8 py-3.5 rounded-xl bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center gap-2">
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
                          className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-all font-light shadow-inner"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.new_password")}</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-all font-light shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.confirm_password")}</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-all font-light shadow-inner"
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
                        className={`w-12 h-6 rounded-full transition-colors relative ${emailNotif ? 'bg-white/80' : 'bg-white/10'}`}
                      >
                        <motion.div animate={{ x: emailNotif ? 24 : 2 }} className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm ${emailNotif ? 'bg-black' : 'bg-white'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <h4 className="text-white font-medium mb-1">{t("settings.push_notifications")}</h4>
                        <p className="text-white/40 text-sm">{t("settings.push_notif_desc")}</p>
                      </div>
                      <button 
                        onClick={() => { setPushNotif(!pushNotif); handleSaveSettings(); }}
                        className={`w-12 h-6 rounded-full transition-colors relative ${pushNotif ? 'bg-white/80' : 'bg-white/10'}`}
                      >
                        <motion.div animate={{ x: pushNotif ? 24 : 2 }} className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm ${pushNotif ? 'bg-black' : 'bg-white'}`} />
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
                      <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.language")}</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/50 transition-all font-medium appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2em' }}
                      >
                        <option value="English" className="bg-[#050508]">English (US)</option>
                        <option value="Bengali" className="bg-[#050508]">Bengali (বাংলা)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">{t("settings.timezone")}</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/50 transition-all font-medium appearance-none"
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
      role="worker" 
      navItems={navItems} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === "overview" && renderOverview()}
      {activeTab === "jobs" && renderJobs()}
      {activeTab === "submissions" && renderSubmissions()}
      {activeTab === "wallet" && renderWallet()}
      {activeTab === "profile" && renderProfile()}
      {activeTab === "settings" && renderSettings()}

      {/* Withdraw Modal */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsWithdrawModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass border border-white/20 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] bg-black/50 text-center"
            >
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center mb-6">
                <ArrowDownToLine className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-['Syne'] text-white mb-2 tracking-tight">Withdraw Funds</h2>
              <p className="text-white/50 text-sm mb-6">Transfer available balance to your connected bank account.</p>
              
              {withdrawSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#7DF9AA]/10 border border-[#7DF9AA]/30 rounded-2xl p-6 py-8 my-6 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(125,249,170,0.15)]"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#7DF9AA] mb-4" />
                  <p className="text-[#7DF9AA] font-bold text-lg mb-1">Withdrawal Requested!</p>
                  <p className="text-white/60 text-sm">Your funds will be processed shortly.</p>
                </motion.div>
              ) : (
                <>
                  <div className="bg-white/5 rounded-xl py-3 px-4 mb-6 border border-white/5 text-left flex justify-between items-center">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Available</p>
                      <p className="text-[#7DF9AA] font-medium font-['Syne'] text-lg">৳{optimisticBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <form onSubmit={handleWithdraw} className="space-y-6">
                    <div className="text-left">
                      <label className="block text-xs text-white/50 uppercase tracking-widest mb-3 font-medium">Select Payout Method</label>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <button 
                          type="button"
                          onClick={() => setWithdrawMethod('bkash')}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                            withdrawMethod === 'bkash' ? 'bg-[#E2136E]/10 border-[#E2136E]/50 shadow-[0_0_15px_rgba(226,19,110,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white`}>
                            <Image src="/bkash-logo.jpg" alt="bKash" width={48} height={48} className="object-contain w-full h-full" />
                          </div>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setWithdrawMethod('nagad')}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                            withdrawMethod === 'nagad' ? 'bg-[#F7931E]/10 border-[#F7931E]/50 shadow-[0_0_15px_rgba(247,147,30,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white`}>
                            <Image src="/nagad-logo.jpg" alt="Nagad" width={48} height={48} className="object-contain w-full h-full p-1" />
                          </div>
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {withdrawMethod === 'bkash' && !userData?.bkashNumber && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-orange-400 text-xs mt-2">
                            ⚠️ You haven't set a bKash number. Please configure it in settings.
                          </motion.p>
                        )}
                        {withdrawMethod === 'nagad' && !userData?.nagadNumber && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-orange-400 text-xs mt-2">
                            ⚠️ You haven't set a Nagad number. Please configure it in settings.
                          </motion.p>
                        )}
                        {withdrawMethod === 'bkash' && userData?.bkashNumber && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-white/50 text-xs mt-2">
                            Sending to: <span className="text-white font-medium">{userData.bkashNumber}</span>
                          </motion.p>
                        )}
                        {withdrawMethod === 'nagad' && userData?.nagadNumber && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-white/50 text-xs mt-2">
                            Sending to: <span className="text-white font-medium">{userData.nagadNumber}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <span className="text-white/70 text-xl font-medium">৳</span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          required
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Withdrawal Amount (৳)"
                          className={`w-full pl-10 pr-5 py-4 bg-white/5 border ${
                            parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) < 100 ? 'border-red-500/50 focus:border-red-500/80' : 'border-white/10 focus:border-[#7DF9AA]/50'
                          } rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:bg-white/10 transition-all font-medium text-xl shadow-inner`}
                        />
                      </div>
                      <p className="text-white/40 text-xs mt-2 pl-2">Minimum withdrawal limit is ৳100.</p>
                    </div>

                    <AnimatePresence>
                      {withdrawError && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-left">
                          <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                          <p className="text-red-400 text-xs font-medium">{withdrawError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={
                        (withdrawMethod === 'bkash' && !userData?.bkashNumber) || 
                        (withdrawMethod === 'nagad' && !userData?.nagadNumber) ||
                        (parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) < 100) ||
                        (parseFloat(withdrawAmount) > optimisticBalance)
                      }
                      className="w-full py-4 rounded-2xl bg-[#7DF9AA] text-black hover:bg-[#7DF9AA]/90 transition-colors font-bold flex items-center justify-center h-14 text-lg shadow-[0_0_20px_rgba(125,249,170,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Withdrawal Request
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsRatingModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass border border-[#7DF9AA]/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(125,249,170,0.1)] bg-black/50 text-center"
            >
              <button 
                onClick={() => setIsRatingModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/30 mx-auto flex items-center justify-center mb-6">
                <span className="text-2xl">⭐</span>
              </div>

              <h2 className="text-2xl font-['Syne'] text-white mb-2 tracking-tight">Rate Employer</h2>
              <p className="text-white/50 text-sm mb-6">How was your experience working with this employer?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    style={{ color: ratingValue >= star ? '#FBBF24' : '#4B5563', filter: ratingValue >= star ? 'drop-shadow(0 0 10px rgba(251,191,36,0.5))' : 'none' }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={ratingText}
                onChange={(e) => setRatingText(e.target.value)}
                placeholder="Leave a short review (optional)..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 transition-all text-sm min-h-[100px] resize-none mb-6 shadow-inner"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitRating}
                disabled={ratingValue === 0}
                className="w-full py-4 rounded-2xl bg-[#7DF9AA] text-black hover:bg-[#7DF9AA]/90 transition-colors font-semibold flex items-center justify-center h-14 text-lg shadow-[0_0_20px_rgba(125,249,170,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appeal Modal */}
      <AnimatePresence>
        {isAppealModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsAppealModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass border border-red-500/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)] bg-black/50 text-center"
            >
              <button 
                onClick={() => setIsAppealModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center mb-6">
                <AlertCircle className="text-red-400 w-8 h-8" />
              </div>

              <h2 className="text-2xl font-['Syne'] text-white mb-2 tracking-tight">Dispute Resolution</h2>
              <p className="text-white/50 text-sm mb-6">If you believe your submission was unfairly rejected, our admins can investigate.</p>
              
              <div className="text-left mb-6">
                <label className="block text-xs text-white/50 uppercase tracking-widest mb-2 font-medium">Please explain why this rejection is unfair (Provide proof details):</label>
                <textarea
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  placeholder="I followed all instructions and provided the correct screenshot..."
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-all text-sm min-h-[120px] resize-none shadow-inner"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitAppeal}
                disabled={!appealText.trim()}
                className="w-full py-4 rounded-2xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30 font-semibold flex items-center justify-center h-14 text-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Appeal
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Employer Public Profile Modal */}
      <AnimatePresence>
        {isEmployerModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
              onClick={() => setIsEmployerModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass border border-white/20 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(125,249,170,0.1)] overflow-hidden bg-[#050508]/60"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#7DF9AA]/5 rounded-full blur-[60px] pointer-events-none" />
              
              <button 
                onClick={() => setIsEmployerModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl overflow-hidden">
                  {selectedEmployer?.avatarUrl ? (
                    <Image src={selectedEmployer.avatarUrl} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#7DF9AA]/10 flex items-center justify-center text-[#7DF9AA]">
                      {selectedEmployer?.name?.substring(0, 2).toUpperCase() || "EP"}
                    </div>
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-white font-['Syne'] mb-1">{selectedEmployer?.name || "Premium Employer"}</h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-[#7DF9AA] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#7DF9AA]/10 border border-[#7DF9AA]/20">Verified</span>
                  <div className="flex items-center text-yellow-400 text-xs gap-1">
                    <span className="font-bold">4.9</span>
                    <span>★★★★★</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#7DF9AA]/30 transition-colors">
                    <p className="text-white/40 text-[9px] uppercase tracking-tighter mb-1 font-bold">Jobs Posted</p>
                    <p className="text-white font-bold text-xl">142</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#7DF9AA]/30 transition-colors">
                    <p className="text-white/40 text-[9px] uppercase tracking-tighter mb-1 font-bold">Success Rate</p>
                    <p className="text-[#7DF9AA] font-bold text-xl">99%</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#7DF9AA]/30 transition-colors">
                    <p className="text-white/40 text-[9px] uppercase tracking-tighter mb-1 font-bold">Avg. Pay</p>
                    <p className="text-white font-bold text-xl">৳12.5</p>
                  </div>
                </div>

                <div className="space-y-3 text-left bg-white/5 rounded-2xl p-5 border border-white/10 mb-8">
                  <div className="flex items-center gap-3 text-white/60 text-sm">
                    <div className="w-8 h-8 rounded-full bg-[#7DF9AA]/10 flex items-center justify-center flex-shrink-0 text-[#7DF9AA]">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="font-light">Instant payment after approval</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                      <Briefcase size={14} />
                    </div>
                    <span className="font-light">Member since January 2024</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60 text-sm">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-400">
                      <TrendingUp size={14} />
                    </div>
                    <span className="font-light">High activity & low dispute rate</span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEmployerModalOpen(false)}
                  className="w-full py-4 rounded-2xl bg-[#7DF9AA] text-black font-bold text-lg shadow-[0_0_20px_rgba(125,249,170,0.3)] hover:bg-[#7DF9AA]/90 transition-all"
                >
                  View Open Jobs
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
