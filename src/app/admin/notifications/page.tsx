"use client";

import { useState } from "react";
import { Bell, Send, Users, AlertCircle, History, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import GlassCard from "@/components/admin/GlassCard";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [type, setType] = useState("info");
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate API call for Firebase Cloud Messaging / Email trigger
    setTimeout(() => {
      setIsSending(false);
      setTitle("");
      setMessage("");
      alert("Broadcast sent successfully to " + audience + " users!");
    }, 1500);
  };

  return (
    <div>
      <PageHeader
        title="Notification Center"
        subtitle="Broadcast announcements, alerts, and push notifications"
        icon={<Bell size={20} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Send Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard accentColor="blue" className="p-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
              <Send size={16} className="text-blue-400" /> New Broadcast
            </h2>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.07] text-white/80 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                >
                  <option value="all" className="bg-[#0f172a]">All Users</option>
                  <option value="workers" className="bg-[#0f172a]">Workers Only</option>
                  <option value="employers" className="bg-[#0f172a]">Employers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Notification Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setType("info")} className={`py-2 text-xs font-medium rounded-lg border transition-all ${type === "info" ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-white/[0.02] border-white/[0.05] text-white/40 hover:bg-white/[0.05]"}`}>Info</button>
                  <button type="button" onClick={() => setType("warning")} className={`py-2 text-xs font-medium rounded-lg border transition-all ${type === "warning" ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : "bg-white/[0.02] border-white/[0.05] text-white/40 hover:bg-white/[0.05]"}`}>Alert</button>
                  <button type="button" onClick={() => setType("success")} className={`py-2 text-xs font-medium rounded-lg border transition-all ${type === "success" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/[0.02] border-white/[0.05] text-white/40 hover:bg-white/[0.05]"}`}>Success</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., System Maintenance Update"
                  className="w-full bg-white/[0.03] border border-white/[0.07] text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Message Body
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your announcement here..."
                  className="w-full bg-white/[0.03] border border-white/[0.07] text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 transition-colors text-sm resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full mt-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex justify-center items-center gap-2 disabled:opacity-50 text-sm"
              >
                {isSending ? "Broadcasting..." : "Send Broadcast"}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 h-full">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
              <History size={16} className="text-white/50" /> Broadcast History
            </h2>
            
            <div className="space-y-3">
              {/* Mock History Item 1 */}
              <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Bell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">Platform Fee Reduced to 8%</h4>
                    <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">2 days ago</span>
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2 mb-2">
                    Great news! We have officially reduced the platform commission fee for all future campaigns. Enjoy higher earnings.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> Sent
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/30">
                      <Users size={10} /> Target: All Users
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock History Item 2 */}
              <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <AlertCircle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">Scheduled Maintenance Alert</h4>
                    <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">5 days ago</span>
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2 mb-2">
                    The platform will undergo scheduled server maintenance this Saturday at 2 AM GMT. Downtime is expected to be 30 minutes.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> Sent
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/30">
                      <Users size={10} /> Target: All Users
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
