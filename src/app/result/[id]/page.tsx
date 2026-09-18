"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, FileWarning, Fingerprint, Activity, Check, Share2, Printer } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/v1/tests/${id}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, [id]);

  if (!data) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00FF9D] font-mono tracking-widest text-[10px]">
      DECRYPTING RECORD...
    </div>
  );

  const isPositive = data.result === "positive";
  const isNegative = data.result === "negative";

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF9D] font-mono pb-20">
      
      {/* Dossier Header */}
      <div className="border-b-2 border-dashed border-[#00FF9D]/30 p-4 pt-8 bg-[#00FF9D]/5">
        <div className="max-w-md mx-auto flex justify-between items-start">
          <div>
            <div className="text-[10px] tracking-[0.3em] font-bold">MINISTRY OF HOME AFFAIRS</div>
            <div className="text-[8px] tracking-widest text-white/70">NARCOTICS CONTROL BUREAU</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-white">FORENSIC DOSSIER</div>
            <div className="text-[10px] text-[#00FF9D]/50 mt-1">RECORD ID: {data.id.substring(0, 8).toUpperCase()}</div>
          </div>
          <Fingerprint size={48} className="text-[#00FF9D]/20" />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-4">
        
        {/* Main Verdict */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border p-6 relative overflow-hidden ${
            isPositive ? 'border-red-500/50 bg-red-900/10' : 
            isNegative ? 'border-emerald-500/50 bg-emerald-900/10' : 
            'border-yellow-500/50 bg-yellow-900/10'
          }`}
        >
          {/* Watermark */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black opacity-5 -rotate-12 ${
            isPositive ? 'text-red-500' : isNegative ? 'text-emerald-500' : 'text-yellow-500'
          }`}>
            {data.result.toUpperCase()}
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {isPositive ? <ShieldAlert size={48} className="text-red-500 mb-2" /> :
             isNegative ? <ShieldCheck size={48} className="text-emerald-500 mb-2" /> :
             <FileWarning size={48} className="text-yellow-500 mb-2" />}
            
            <div className="text-[10px] tracking-[0.3em] mb-1">SPECTRAL ANALYSIS VERDICT</div>
            <h1 className={`text-4xl font-black uppercase tracking-widest ${
              isPositive ? 'text-red-500' : isNegative ? 'text-emerald-500' : 'text-yellow-500'
            }`}>
              {data.result}
            </h1>
            
            <div className="mt-4 bg-black/50 px-4 py-2 text-[10px] border border-white/10 w-full text-center">
              CONFIDENCE RATING: <span className="text-white font-bold">{data.confidence.toUpperCase()}</span>
            </div>
          </div>
        </motion.div>

        {/* Engine Output */}
        <div className="border border-[#00FF9D]/20 bg-[#00FF9D]/5 p-4">
          <div className="flex items-center gap-2 text-[10px] tracking-widest mb-3 text-white border-b border-[#00FF9D]/20 pb-2">
            <Activity size={14} className="text-[#00FF9D]" /> ENGINE DIAGNOSTICS
          </div>
          <p className="text-xs text-[#00FF9D]/80 leading-relaxed uppercase">
            {data.notes || "No additional engine diagnostics provided."}
          </p>
          <div className="mt-3 text-[8px] text-[#00FF9D]/40">CALIBRATION: {data.calibration_status.toUpperCase()}</div>
        </div>

        {/* Chain of Custody */}
        <div className="border border-[#00FF9D]/20 bg-[#00FF9D]/5 p-4">
          <div className="flex items-center gap-2 text-[10px] tracking-widest mb-3 text-white border-b border-[#00FF9D]/20 pb-2">
            <Check size={14} className="text-[#00FF9D]" /> CHAIN OF CUSTODY (IMMUTABLE)
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-[8px] tracking-widest text-[#00FF9D]/50 mb-0.5">TIMESTAMP (UTC)</div>
              <div className="text-xs text-white">{new Date(data.captured_at).toISOString()}</div>
            </div>
            
            <div>
              <div className="text-[8px] tracking-widest text-[#00FF9D]/50 mb-0.5">GPS COORDINATES</div>
              <div className="text-xs text-white">
                {data.gps_lat ? `${data.gps_lat.toFixed(6)}, ${data.gps_lng.toFixed(6)}` : "UNAVAILABLE"}
              </div>
            </div>

            <div>
              <div className="text-[8px] tracking-widest text-[#00FF9D]/50 mb-0.5">OPERATOR ID</div>
              <div className="text-xs text-white">{data.operator_id}</div>
            </div>

            <div>
              <div className="text-[8px] tracking-widest text-[#00FF9D]/50 mb-0.5">SHA-256 CRYPTOGRAPHIC EVIDENCE HASH</div>
              <div className="text-[8px] text-[#00FF9D] bg-black p-2 border border-[#00FF9D]/20 break-all font-bold">
                {data.image_hash}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 w-full bg-black/90 backdrop-blur-md border-t border-[#00FF9D]/20 p-4 flex gap-4 justify-center z-50">
        <Link href="/dashboard" className="flex-1 border border-[#00FF9D]/50 text-[#00FF9D] py-3 text-[10px] font-bold tracking-widest text-center hover:bg-[#00FF9D]/10">
          DASHBOARD
        </Link>
        <Link href="/capture" className="flex-1 bg-[#00FF9D] text-black py-3 text-[10px] font-bold tracking-widest text-center shadow-[0_0_15px_rgba(0,255,157,0.4)]">
          NEW SCAN
        </Link>
      </div>

    </div>
  );
}
