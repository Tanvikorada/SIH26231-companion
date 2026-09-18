"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, ScanLine, Database, MapPin, Search } from "lucide-react";

export default function DashboardPage() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/tests?limit=5")
      .then(res => res.json())
      .then(d => setTests(d.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF9D] font-mono pb-24">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-[#00FF9D]/20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-[#00FF9D]" />
          <span className="font-bold tracking-[0.2em] text-sm">NCB COMMAND</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse" />
          <span>OP-109</span>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        
        {/* Bento: Live Map / Radar (Fake visual for hackathon effect) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-48 bg-black border border-[#00FF9D]/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,255,157,0.1)] flex items-center justify-center"
        >
          {/* Radar Sweep */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.1)_0%,transparent_70%)]" />
          <div className="absolute w-[200%] h-[200%] border-t border-[#00FF9D]/40 rounded-full animate-[spin_4s_linear_infinite]" style={{ transformOrigin: "center" }} />
          
          <MapPin size={24} className="text-[#00FF9D] absolute" />
          <div className="absolute top-3 left-3 text-[10px] bg-black/50 px-2 py-1 rounded border border-[#00FF9D]/20 backdrop-blur-sm">
            GPS: ACTIVE TRACKING
          </div>
        </motion.div>

        {/* Bento Grid: Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#00FF9D]/5 border border-[#00FF9D]/20 rounded-2xl p-4 flex flex-col justify-between h-32"
          >
            <Activity size={18} className="text-[#00FF9D]/70" />
            <div>
              <div className="text-3xl font-bold text-white">47</div>
              <div className="text-[10px] tracking-widest text-[#00FF9D]/60 mt-1">SCANS TODAY</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-red-900/10 border border-red-500/30 rounded-2xl p-4 flex flex-col justify-between h-32"
          >
            <ShieldAlert size={18} className="text-red-500/70" />
            <div>
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-[10px] tracking-widest text-red-400/60 mt-1">POSITIVES DETECTED</div>
            </div>
          </motion.div>
        </div>

        {/* Recent Scans List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xs font-bold tracking-widest">RECENT LOGS</h3>
            <Link href="/ledger" className="text-[10px] text-[#00FF9D]/60 hover:text-[#00FF9D]">VIEW ALL {'>'}</Link>
          </div>
          
          <div className="space-y-3">
            {tests.map((test, i) => (
              <div key={test.id} className="bg-black border border-[#00FF9D]/20 rounded-xl p-3 flex justify-between items-center hover:border-[#00FF9D]/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white truncate">{test.notes || "Auto-Detect Scan"}</div>
                  <div className="text-[10px] text-[#00FF9D]/50 mt-1">{new Date(test.captured_at).toLocaleTimeString()}</div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold ml-2 ${
                  test.result === 'positive' ? 'bg-red-900/40 text-red-500 border border-red-500/30' :
                  test.result === 'negative' ? 'bg-emerald-900/40 text-emerald-500 border border-emerald-500/30' :
                  'bg-gray-900/40 text-gray-400 border border-gray-600/30'
                }`}>
                  {test.result.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Floating Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-64 h-16 bg-[#00FF9D]/10 backdrop-blur-xl border border-[#00FF9D]/30 rounded-full flex items-center justify-around px-2 shadow-[0_0_30px_rgba(0,255,157,0.15)] z-50">
        <Link href="/dashboard" className="p-3 text-[#00FF9D]">
          <Database size={24} />
        </Link>
        <Link href="/capture" className="p-4 bg-[#00FF9D] text-black rounded-full -translate-y-4 shadow-[0_0_20px_#00FF9D] hover:scale-110 transition-transform">
          <ScanLine size={28} />
        </Link>
        <Link href="/ledger" className="p-3 text-[#00FF9D]/50 hover:text-[#00FF9D] transition-colors">
          <Search size={24} />
        </Link>
      </div>

    </div>
  );
}
