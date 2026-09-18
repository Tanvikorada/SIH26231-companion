"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function LogsPage() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/tests?limit=50")
      .then(res => res.json())
      .then(d => setTests(d.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B192C] text-white font-mono flex flex-col">
      <div className="p-4 bg-[#1E3E62]/50 border-b border-[#1E3E62] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <Link href="/" className="text-[#8b9bb4] hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm">HOME</span>
        </Link>
        <span className="text-xs font-bold text-[#FF6500] tracking-widest flex items-center gap-2">
          <Database size={14} /> FORENSIC LOGS
        </span>
      </div>

      <div className="p-4">
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9bb4]" />
          <input 
            type="text" 
            placeholder="Search records by OP-ID or hash..." 
            className="w-full bg-[#1E3E62]/30 border border-[#1E3E62] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FF6500] transition-colors"
          />
        </div>

        <div className="space-y-3">
          {tests.map((test, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={test.id}
            >
              <Link href={`/result/${test.id}`} className="block">
                <div className="bg-[#1E3E62]/20 border border-[#1E3E62] rounded-xl p-4 hover:bg-[#1E3E62]/40 transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#8b9bb4] mb-1">{new Date(test.captured_at).toLocaleString()}</div>
                    <div className="text-sm font-bold truncate max-w-[200px]">{test.notes || "No Notes"}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{test.image_hash.substring(0, 16)}...</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    test.result === "positive" ? "bg-red-900/30 text-red-500 border border-red-500/30" : 
                    test.result === "negative" ? "bg-emerald-900/30 text-emerald-500 border border-emerald-500/30" : 
                    "bg-gray-800 text-gray-400 border border-gray-600"
                  }`}>
                    {test.result.toUpperCase()}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {tests.length === 0 && (
            <div className="text-center text-[#8b9bb4] py-10 text-sm">NO RECORDS FOUND</div>
          )}
        </div>
      </div>
    </div>
  );
}
