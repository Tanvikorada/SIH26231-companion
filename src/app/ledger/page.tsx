"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Hash, Shield } from "lucide-react";

export default function LedgerPage() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/tests?limit=100")
      .then(res => res.json())
      .then(d => setTests(d.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF9D] font-mono pb-12">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#00FF9D]/30 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-[10px] tracking-widest font-bold">COMMAND</span>
          </Link>
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-[#00FF9D]" />
            <span className="text-[10px] tracking-[0.2em] font-bold">IMMUTABLE EVIDENCE LEDGER</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-4">
        <div className="bg-[#00FF9D]/5 border border-[#00FF9D]/20 p-4 mb-8 flex items-start gap-4">
          <Shield size={24} className="text-[#00FF9D] shrink-0 mt-1" />
          <p className="text-[10px] text-[#00FF9D]/70 leading-relaxed uppercase tracking-wider">
            This ledger contains cryptographically signed records of all field spot tests. 
            Every image captured by operators is hashed locally using SHA-256 before transmission. 
            These records are immutable and serve as documentary evidence for the Ministry of Home Affairs.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#00FF9D]/30 text-[#00FF9D]/50">
                <th className="py-3 px-2 font-bold tracking-widest">TIMESTAMP</th>
                <th className="py-3 px-2 font-bold tracking-widest">OP-ID</th>
                <th className="py-3 px-2 font-bold tracking-widest">RESULT</th>
                <th className="py-3 px-2 font-bold tracking-widest">GPS LOCATION</th>
                <th className="py-3 px-2 font-bold tracking-widest">SHA-256 EVIDENCE HASH</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-b border-[#00FF9D]/10 hover:bg-[#00FF9D]/5 transition-colors">
                  <td className="py-4 px-2 text-white whitespace-nowrap">{new Date(test.captured_at).toLocaleString()}</td>
                  <td className="py-4 px-2 text-[#00FF9D]/70 whitespace-nowrap">{test.operator_id}</td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-1 font-bold ${
                      test.result === 'positive' ? 'text-red-500 bg-red-500/10' :
                      test.result === 'negative' ? 'text-emerald-500 bg-emerald-500/10' :
                      'text-yellow-500 bg-yellow-500/10'
                    }`}>
                      {test.result.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-[#00FF9D]/50 whitespace-nowrap">
                    {test.gps_lat ? `${test.gps_lat.toFixed(4)}, ${test.gps_lng.toFixed(4)}` : "---"}
                  </td>
                  <td className="py-4 px-2 text-[8px] text-[#00FF9D]/40 font-mono tracking-wider max-w-[200px] truncate">
                    <Hash size={10} className="inline mr-1" />
                    {test.image_hash}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <Link href={`/result/${test.id}`} className="text-[#00FF9D] border border-[#00FF9D]/30 px-3 py-1 hover:bg-[#00FF9D] hover:text-black transition-colors font-bold tracking-widest">
                      VIEW
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {tests.length === 0 && (
            <div className="text-center py-12 text-[#00FF9D]/30 text-xs tracking-widest">
              NO RECORDS FOUND IN LEDGER
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
