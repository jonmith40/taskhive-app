"use client";

import { useState } from "react";
import { Settings, DollarSign, Shield, Save, Percent, Wallet, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import GlassCard from "@/components/admin/GlassCard";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Mock Settings State
  const [platformFee, setPlatformFee] = useState("10");
  const [minWithdrawal, setMinWithdrawal] = useState("5");
  const [withdrawalFee, setWithdrawalFee] = useState("2");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveJobs, setAutoApproveJobs] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate Firestore Update
    setTimeout(() => {
      setIsSaving(false);
      alert("Platform settings successfully updated!");
    }, 1000);
  };

  return (
    <div>
      <PageHeader
        title="Platform Settings"
        subtitle="Configure platform fees, limits, and system toggles"
        icon={<Settings size={20} />}
        actions={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-sm font-medium transition-all"
          >
            <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Commission & Fees Settings */}
        <GlassCard accentColor="emerald" className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.05]">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Financial & Fees</h2>
              <p className="text-xs text-white/40">Manage commissions and withdrawals</p>
            </div>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Platform Commission Fee</label>
              <div className="relative">
                <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.07] text-white rounded-lg pl-9 pr-4 py-2 focus:border-emerald-500/50 outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-white/30 mt-1">Percentage deducted from employers per job post.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Minimum Withdrawal Amount</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="number"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.07] text-white rounded-lg pl-9 pr-4 py-2 focus:border-emerald-500/50 outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-white/30 mt-1">Minimum balance a worker needs to request a payout.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Withdrawal Processing Fee</label>
              <div className="relative">
                <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="number"
                  value={withdrawalFee}
                  onChange={(e) => setWithdrawalFee(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.07] text-white rounded-lg pl-9 pr-4 py-2 focus:border-emerald-500/50 outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-white/30 mt-1">Fee applied to workers upon payout request.</p>
            </div>
          </form>
        </GlassCard>

        {/* System & Security Toggles */}
        <GlassCard accentColor="violet" className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.05]">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">System Controls</h2>
              <p className="text-xs text-white/40">Platform automation and security</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Auto Approve Jobs Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <h4 className="text-sm font-semibold text-white">Auto-Approve Jobs</h4>
                <p className="text-[10px] text-white/40 mt-1 max-w-[200px]">If enabled, new campaigns bypass admin review and go live instantly.</p>
              </div>
              <button 
                onClick={() => setAutoApproveJobs(!autoApproveJobs)}
                className={`relative w-12 h-6 rounded-full transition-colors ${autoApproveJobs ? 'bg-violet-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoApproveJobs ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <div>
                <h4 className="text-sm font-semibold text-red-400 flex items-center gap-1.5"><AlertTriangle size={14}/> Maintenance Mode</h4>
                <p className="text-[10px] text-red-400/60 mt-1 max-w-[200px]">Locks out all users (except admins) from the platform. Use with caution.</p>
              </div>
              <button 
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${maintenanceMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
