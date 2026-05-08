"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Rocket, FileText, Link, Eye, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const YoutubeIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TiktokIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const GlobeIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const MobileDownloadIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <path d="M12 13V7" />
    <path d="m9 10 3 3 3-3" />
    <path d="M12 17h.01" />
  </svg>
);

const CustomBriefcaseIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const PLATFORMS = [
  { id: "YouTube", icon: YoutubeIcon, color: "#FF0000", desc: "Subscribers, views, likes" },
  { id: "Facebook", icon: FacebookIcon, color: "#1877F2", desc: "Likes, shares, follows" },
  { id: "Instagram", icon: InstagramIcon, color: "#E4405F", desc: "Follows, likes, reels" },
  { id: "TikTok", icon: TiktokIcon, color: "#00f2ea", desc: "Follows, likes, views" },
  { id: "Website Sign Up", icon: GlobeIcon, color: "#7DF9AA", desc: "Registrations & signups" },
  { id: "App Install", icon: MobileDownloadIcon, color: "#A78BFA", desc: "Downloads & installs" },
  { id: "Other", icon: CustomBriefcaseIcon, color: "#F59E0B", desc: "Custom micro-tasks" },
];

const STEP_LABELS = ["Platform", "Details", "Budget", "Launch"];

interface JobWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    category: string;
    targetUrl: string;
    reward: string;
    totalWorkers: string;
    description: string;
    requiredProof: string;
  }) => Promise<void>;
  balance: number;
}

export default function JobWizardModal({ isOpen, onClose, onSubmit, balance }: JobWizardModalProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("YouTube");
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [description, setDescription] = useState("");
  const [requiredProof, setRequiredProof] = useState("");
  const [reward, setReward] = useState(5);
  const [workers, setWorkers] = useState(10);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isPosting, setIsPosting] = useState(false);
  const [direction, setDirection] = useState(1);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1); setCategory("YouTube"); setTitle(""); setTargetUrl("");
      setDescription(""); setRequiredProof(""); setReward(5); setWorkers(10);
      setDraftStatus("idle"); setIsPosting(false); setDirection(1);
    }
  }, [isOpen]);

  // Auto-save draft simulation
  useEffect(() => {
    if (!isOpen || step === 4) return;
    const hasContent = title || targetUrl || description || requiredProof;
    if (!hasContent) return;
    setDraftStatus("saving");
    const t1 = setTimeout(() => {
      setDraftStatus("saved");
      const t2 = setTimeout(() => setDraftStatus("idle"), 2500);
      return () => clearTimeout(t2);
    }, 1200);
    return () => clearTimeout(t1);
  }, [title, targetUrl, description, requiredProof, category, reward, workers, isOpen, step]);

  const subtotal = reward * workers;
  const fee = subtotal * 0.1;
  const totalCost = subtotal + fee;

  const canNext = () => {
    if (step === 1) return !!category;
    if (step === 2) return title.trim().length > 0 && targetUrl.trim().length > 0 && description.trim().length > 0 && requiredProof.trim().length > 0;
    if (step === 3) return reward >= 1 && workers >= 1;
    return true;
  };

  const goNext = () => { if (canNext() && step < 4) { setDirection(1); setStep(s => s + 1); } };
  const goBack = () => { if (step > 1) { setDirection(-1); setStep(s => s - 1); } };

  const handleLaunch = async () => {
    setIsPosting(true);
    try {
      await onSubmit({ title, category, targetUrl, reward: reward.toString(), totalWorkers: workers.toString(), description, requiredProof });
    } catch {
      setIsPosting(false);
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl glass border border-white/10 rounded-[2rem] shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden bg-black/60 max-h-[92vh] flex flex-col"
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors">
          <X size={16} />
        </button>

        {/* Header + Progress */}
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-['Syne'] text-white mb-1 tracking-tight">Create Campaign</h2>
          <p className="text-white/40 text-sm mb-6">Step {step} of 4 — {STEP_LABELS[step - 1]}</p>
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                  <motion.div
                    animate={{ width: step > i ? "100%" : step === i + 1 ? "50%" : "0%" }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-[#7DF9AA] shadow-[0_0_8px_rgba(125,249,170,0.5)]"
                  />
                </div>
                <span className={`text-[10px] tracking-widest uppercase font-medium ${step > i ? "text-[#7DF9AA]" : step === i + 1 ? "text-white/70" : "text-white/25"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-4">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <p className="text-white/50 text-sm mb-6">Choose the platform for your campaign</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    const sel = category === p.id;
                    return (
                      <motion.button
                        key={p.id} type="button"
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setCategory(p.id)}
                        className={`relative p-5 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${sel ? "border-[#7DF9AA]/50 bg-[#7DF9AA]/10 shadow-[0_0_25px_rgba(125,249,170,0.15)]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"}`}
                      >
                        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none transition-opacity ${sel ? "opacity-30" : "opacity-0 group-hover:opacity-10"}`} style={{ backgroundColor: p.color }} />
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-colors" style={{ borderColor: sel ? p.color + "60" : "rgba(255,255,255,0.1)", backgroundColor: sel ? p.color + "20" : "rgba(255,255,255,0.03)" }}>
                          <Icon className="w-8 h-8 transition-colors" style={{ color: sel ? p.color : "rgba(255,255,255,0.5)" }} />
                        </div>
                        <p className={`font-medium text-sm mb-0.5 ${sel ? "text-white" : "text-white/70"}`}>{p.id}</p>
                        <p className="text-[11px] text-white/35">{p.desc}</p>
                        {sel && <motion.div layoutId="platformCheck" className="absolute top-3 right-3"><CheckCircle2 size={16} className="text-[#7DF9AA]" /></motion.div>}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium"><FileText size={14} />Campaign Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Subscribe to my Channel" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium"><Link size={14} />Target URL</label>
                  <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://..." className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium"><Eye size={14} />Detailed Instructions</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={"1. Go to the URL\n2. Click Subscribe\n3. Watch for 1 minute..."} rows={4} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light resize-none" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-[#7DF9AA] uppercase tracking-widest mb-2 font-medium"><CheckCircle2 size={14} />Required Proof</label>
                  <textarea value={requiredProof} onChange={(e) => setRequiredProof(e.target.value)} placeholder="e.g. Provide the username you used to subscribe." rows={2} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#7DF9AA]/50 focus:bg-white/10 transition-all font-light resize-none" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Sliders */}
                  <div className="flex-1 space-y-8">
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <label className="text-xs text-[#7DF9AA] uppercase tracking-widest font-medium">Reward Per Worker</label>
                        <span className="text-2xl font-['Syne'] font-bold text-white">৳{reward}</span>
                      </div>
                      <input type="range" min={1} max={500} step={1} value={reward} onChange={(e) => setReward(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#7DF9AA]"
                        style={{ background: `linear-gradient(to right, #7DF9AA ${((reward - 1) / 499) * 100}%, rgba(255,255,255,0.1) ${((reward - 1) / 499) * 100}%)` }}
                      />
                      <div className="flex justify-between text-[10px] text-white/30 mt-1"><span>৳1</span><span>৳500</span></div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <label className="text-xs text-[#7DF9AA] uppercase tracking-widest font-medium">Number of Workers</label>
                        <span className="text-2xl font-['Syne'] font-bold text-white">{workers}</span>
                      </div>
                      <input type="range" min={1} max={500} step={1} value={workers} onChange={(e) => setWorkers(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#7DF9AA]"
                        style={{ background: `linear-gradient(to right, #7DF9AA ${((workers - 1) / 499) * 100}%, rgba(255,255,255,0.1) ${((workers - 1) / 499) * 100}%)` }}
                      />
                      <div className="flex justify-between text-[10px] text-white/30 mt-1"><span>1</span><span>500</span></div>
                    </div>
                  </div>
                  {/* Summary Panel */}
                  <div className="lg:w-72 glass rounded-2xl border border-white/10 p-6 space-y-4 lg:sticky lg:top-0 self-start">
                    <h4 className="text-xs text-white/50 uppercase tracking-widest font-medium mb-2">Campaign Summary</h4>
                    <div className="flex justify-between text-sm"><span className="text-white/50">Subtotal</span><span className="text-white font-medium">৳{subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/50">Platform Fee (10%)</span><span className="text-white/70">৳{fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                    <div className="border-t border-white/10 pt-3 flex justify-between text-base">
                      <span className="text-white/70 font-medium">Total Cost</span>
                      <span className="text-[#7DF9AA] font-bold font-['Syne'] text-xl">৳{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {totalCost > balance && <p className="text-red-400 text-xs mt-2">⚠ Exceeds your balance of ৳{balance.toFixed(2)}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <p className="text-white/50 text-sm mb-6">Review your campaign before launching</p>
                <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
                  {[
                    { label: "Platform", val: category },
                    { label: "Title", val: title },
                    { label: "Target URL", val: targetUrl },
                    { label: "Instructions", val: description },
                    { label: "Required Proof", val: requiredProof },
                    { label: "Reward / Worker", val: `৳${reward}` },
                    { label: "Workers", val: workers.toString() },
                  ].map((r) => (
                    <div key={r.label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                      <span className="text-[11px] text-white/40 uppercase tracking-widest font-medium sm:w-36 shrink-0">{r.label}</span>
                      <span className="text-white text-sm font-light break-all whitespace-pre-wrap">{r.val}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-white/50 text-sm">Total Estimated Cost</span>
                    <span className="text-[#7DF9AA] font-bold font-['Syne'] text-2xl">৳{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer: Nav + Draft */}
        <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between gap-4">
          {/* Draft Status */}
          <div className="text-xs text-white/30 flex items-center gap-2 min-w-0">
            <AnimatePresence mode="wait">
              {draftStatus === "saving" && (
                <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7DF9AA] animate-pulse" /> Auto-saving draft...
                </motion.span>
              )}
              {draftStatus === "saved" && (
                <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-[#7DF9AA]/60">
                  <CheckCircle2 size={12} /> Draft saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={goBack} type="button"
                className="px-5 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors font-medium text-sm flex items-center gap-2 border border-white/10">
                <ArrowLeft size={16} /> Back
              </motion.button>
            )}
            {step < 4 ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={goNext} type="button" disabled={!canNext()}
                className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${canNext() ? "bg-[#7DF9AA] text-black shadow-[0_0_20px_rgba(125,249,170,0.3)] hover:shadow-[0_0_30px_rgba(125,249,170,0.5)]" : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"}`}>
                Next <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLaunch} type="button" disabled={isPosting}
                className="px-8 py-3 rounded-xl bg-[#7DF9AA] text-black font-bold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(125,249,170,0.4)] hover:shadow-[0_0_40px_rgba(125,249,170,0.6)] transition-all disabled:opacity-50">
                {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                {isPosting ? "Launching..." : "Launch Campaign"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
