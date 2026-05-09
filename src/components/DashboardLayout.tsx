"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, Mail, Lock, User as UserIcon, Globe, Bell, CheckCircle2, AlertCircle, Wallet, Check } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/app-context";
import TaskHiveLogo from "./TaskHiveLogo";
import DynamicBackground from "./DynamicBackground";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "worker" | "employer";
  navItems: { id: string; name: string; icon: React.ElementType }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardLayout({ children, role, navItems, activeTab, setActiveTab }: DashboardLayoutProps) {
  const { user, userData, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { language, toggleLanguage, t } = useApp();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"worker" | "employer">("worker");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your submission for 'YouTube Subscribe' was approved!", time: "2m ago", read: false, type: 'success' },
    { id: 2, text: "৳5.00 has been added to your wallet", time: "1h ago", read: false, type: 'wallet' },
    { id: 3, text: "New high-paying job available in YouTube category", time: "3h ago", read: true, type: 'info' },
    { id: 4, text: "Your NID verification is under review", time: "5h ago", read: true, type: 'alert' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Protect incorrect dashboard access
  useEffect(() => {
    if (user && userData) {
      if (userData.role !== role) {
        router.push(`/${userData.role}-dashboard`);
      }
    }
  }, [user, userData, role, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    
    try {
      let finalRole: "worker" | "employer";
      if (isSignUp) {
        finalRole = await signUpWithEmail(email, password, selectedRole);
      } else {
        finalRole = await signInWithEmail(email, password);
      }
      if (finalRole !== role) {
        router.push(`/${finalRole}-dashboard`);
      }
    } catch (error: unknown) {
      let message = "An error occurred. Please try again.";
      if (error instanceof Error && 'code' in error) {
        const authError = error as { code: string };
        if (authError.code === 'auth/email-already-in-use') message = "This email is already in use.";
        else if (authError.code === 'auth/invalid-credential') message = "Invalid email or password.";
        else if (authError.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
      }
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      const finalRole = await signInWithGoogle(isSignUp ? selectedRole : "worker");
      if (finalRole !== role) {
        router.push(`/${finalRole}-dashboard`);
      }
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) {
        const authError = error as { code: string };
        if (authError.code !== 'auth/popup-closed-by-user') {
          setAuthError("Google sign-in failed. Please try again.");
        }
      } else {
        setAuthError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7DF9AA] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ====================================================================
  // AUTH WALL — 100% HARDCODED ENGLISH, ZERO t() CALLS
  // ====================================================================
  if (!user || (user && !userData)) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center relative overflow-hidden px-4 font-['DM_Sans']">
        <DynamicBackground />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 w-full max-w-md p-8 glass rounded-3xl border border-white/10 shadow-2xl relative backdrop-blur-xl bg-white/[0.02]"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-white font-['Syne'] tracking-tight mb-2">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-white/50 text-sm font-light">
              {isSignUp ? "Join the Micro-Job Network today." : "Sign in to access your dashboard."}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-4 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedRole("worker")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedRole === "worker"
                        ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    I am a Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("employer")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedRole === "employer"
                        ? "bg-[#7DF9AA] text-black shadow-[0_0_15px_rgba(125,249,170,0.3)]"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    I am an Employer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[#7DF9AA] transition-colors">
                  <Mail size={18} />
                </div>
                <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#7DF9AA]/50 focus:ring-1 focus:ring-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[#7DF9AA] transition-colors">
                  <Lock size={18} />
                </div>
                <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#7DF9AA]/50 focus:ring-1 focus:ring-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light"
                />
              </div>
            </div>

            {authError && (
              <div className="text-red-400 text-xs font-medium px-3 py-2 bg-red-400/10 border border-red-400/20 rounded-md">
                {authError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-medium disabled:opacity-50 flex items-center justify-center h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-white/30 text-xs uppercase tracking-wider font-['Syne']">Or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button type="button" onClick={handleGoogleAuth} disabled={isSubmitting}
            className="mt-4 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#7DF9AA]/30 transition-all font-medium flex items-center justify-center gap-3 disabled:opacity-50 text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-8 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); setEmail(""); setPassword(""); }}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
          
          <button onClick={() => router.push("/")}
            className="text-white/30 hover:text-[#7DF9AA] text-xs transition-colors block mx-auto mt-6 uppercase tracking-wider font-medium"
          >
            &larr; Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  // ====================================================================
  // AUTHENTICATED DASHBOARD — Language toggle only, no theme toggle
  // ====================================================================
  return (
    <div className="min-h-screen bg-[#050508] flex overflow-hidden font-['DM_Sans'] text-white relative">
      <DynamicBackground />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen ? 0 : (typeof window !== "undefined" && window.innerWidth >= 1024 ? 0 : "-100%") }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`fixed lg:static top-0 left-0 h-full w-64 glass border-r border-white/10 z-50 flex flex-col bg-black/40 backdrop-blur-2xl`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <Link href="/" className="flex items-center">
            <TaskHiveLogo height={32} />
          </Link>
          <button className="lg:hidden text-white/50 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-[#7DF9AA]/10 text-[#7DF9AA] border border-[#7DF9AA]/20 shadow-[inset_0_0_20px_rgba(125,249,170,0.05)]"
                    : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon size={18} className={`transition-colors ${isActive ? "text-[#7DF9AA]" : "text-white/40 group-hover:text-white"}`} />
                <span className="font-medium text-sm tracking-wide">{t(item.name)}</span>
                {isActive && (
                  <motion.div layoutId="activeTabIndicator" className="absolute left-0 w-1 h-8 bg-[#7DF9AA] rounded-r-full shadow-[0_0_10px_#7DF9AA]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 mb-3">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} alt="Avatar" className="w-9 h-9 rounded-full border border-white/20" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.displayName || "User"}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm tracking-wide">{t("common.logout")}</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10 relative">
        {/* Header */}
        <header className="h-[72px] flex items-center justify-between px-6 lg:px-10 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-white/70 hover:text-white p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-medium font-['Syne'] hidden sm:block text-white/90">
              {t(navItems.find(i => i.id === activeTab)?.name || "")}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium text-xs"
            >
              <Globe size={14} />
              {language === "en" ? "EN" : "বাং"}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                  isNotifOpen ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <Bell size={20} className={isNotifOpen ? "fill-white/10" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center border border-[#050508]">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    {/* Backdrop for closing */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 glass border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-2xl bg-[#050508]/80"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h3 className="font-['Syne'] font-bold text-sm tracking-wide text-white">Notifications</h3>
                        <button 
                          onClick={markAllAsRead}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#7DF9AA] hover:text-white transition-colors"
                        >
                          Mark all as read
                        </button>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <Bell className="mx-auto text-white/10 mb-2" size={32} />
                            <p className="text-white/30 text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 flex gap-4 group ${!notif.read ? "bg-white/[0.03]" : ""}`}
                            >
                              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border ${
                                notif.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                notif.type === 'wallet' ? "bg-[#7DF9AA]/10 border-[#7DF9AA]/20 text-[#7DF9AA]" :
                                notif.type === 'alert' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                                "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              }`}>
                                {notif.type === 'success' && <CheckCircle2 size={16} />}
                                {notif.type === 'wallet' && <Wallet size={16} />}
                                {notif.type === 'alert' && <AlertCircle size={16} />}
                                {notif.type === 'info' && <Bell size={16} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-relaxed transition-colors ${!notif.read ? "text-white font-medium" : "text-white/50"}`}>
                                  {notif.text}
                                </p>
                                <p className="text-[10px] text-white/30 mt-1 font-medium">{notif.time}</p>
                              </div>
                              {!notif.read && (
                                <div className="mt-1 flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-[#7DF9AA] shadow-[0_0_8px_#7DF9AA]"></div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-3 bg-white/5 border-t border-white/10 text-center">
                        <button className="text-[11px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
