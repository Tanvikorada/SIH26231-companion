"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, ShieldCheck, Activity, MapPin, Database, ChevronRight, Fingerprint, Lock, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, inconclusive: 0 });

  useEffect(() => {
    fetch("/api/v1/dashboard/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const container: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-1.5 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-blue to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight leading-tight">NCB O.A.S.</h1>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Optical Analysis System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Sys_Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          
          {/* Welcome Banner */}
          <motion.div variants={item} className="bg-gov-blue rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-gov-blue/20">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Fingerprint className="w-48 h-48" />
            </div>
            <div className="relative z-10 max-w-lg">
              <div className="flex items-center gap-2 text-blue-200 mb-2">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wider uppercase">Zero-Trust Secured</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Operator Dashboard</h2>
              <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed">
                Local CIEDE2000 math engine loaded. Cryptographic ledgers synced. Ready for field deployment.
              </p>
            </div>
          </motion.div>

          {/* Quick Action Bento */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/capture" className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white overflow-hidden shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              <Camera className="w-8 h-8 mb-4 text-white/90" />
              <h3 className="text-xl font-bold mb-1">New Scan</h3>
              <p className="text-indigo-100 text-sm opacity-90">Run optical color-calibration on physical evidence.</p>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </Link>

            <Link href="/ledger" className="group relative bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
              <div className="absolute -right-4 -bottom-4 bg-slate-100 w-32 h-32 rounded-full blur-2xl group-hover:bg-slate-200 transition-all"></div>
              <Database className="w-8 h-8 mb-4 text-gov-blue" />
              <h3 className="text-xl font-bold mb-1">Cryptographic Ledger</h3>
              <p className="text-slate-500 text-sm">View immutable blockchain-style history of all field tests.</p>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-5 h-5 text-gov-blue" />
              </div>
            </Link>
          </motion.div>

          {/* Stats Bento */}
          <motion.div variants={item}>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gov-blue" /> Live Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Total Tests</div>
                <div className="text-3xl font-black text-slate-900">{stats.total}</div>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 shadow-sm">
                <div className="text-rose-600 text-xs font-semibold mb-1 uppercase tracking-wide flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Positive
                </div>
                <div className="text-3xl font-black text-rose-700">{stats.positive}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <div className="text-emerald-600 text-xs font-semibold mb-1 uppercase tracking-wide">Negative</div>
                <div className="text-3xl font-black text-emerald-700">{stats.negative}</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Inconclusive</div>
                <div className="text-3xl font-black text-slate-700">{stats.inconclusive}</div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
