"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertTriangle, ShieldAlert, ArrowLeft, MapPin, Clock, Hash } from "lucide-react";
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
    <div className="min-h-screen bg-[#0B192C] flex items-center justify-center text-[#FF6500] font-mono tracking-widest animate-pulse">
      DECRYPTING RECORD...
    </div>
  );

  const isPositive = data.result === "positive";

  return (
    <div className="min-h-screen bg-[#0B192C] text-white font-mono flex flex-col">
      <div className="p-4 bg-[#1E3E62]/50 border-b border-[#1E3E62] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <button onClick={() => router.push("/")} className="text-[#8b9bb4] hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm">BACK</span>
        </button>
        <span className="text-xs font-bold text-[#FF6500] tracking-widest">OFFICIAL RECORD</span>
      </div>

      <div className="flex-1 p-6 flex flex-col max-w-md mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col items-center justify-center p-8 rounded-3xl mb-6 ${
            isPositive ? 'bg-red-900/20 border border-red-500/50 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]' : 
            'bg-emerald-900/20 border border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]'
          }`}
        >
          {isPositive ? (
            <AlertTriangle size={64} className="text-red-500 mb-4" />
          ) : (
            <CheckCircle size={64} className="text-emerald-500 mb-4" />
          )}
          <h1 className={`text-4xl font-black uppercase tracking-tight mb-2 ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
            {data.result}
          </h1>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full text-xs font-bold">
            <ShieldAlert size={14} className={isPositive ? 'text-red-500' : 'text-emerald-500'} />
            <span className="text-gray-300">CONFIDENCE: <span className={isPositive ? 'text-red-400' : 'text-emerald-400'}>{data.confidence}</span></span>
          </div>
        </motion.div>

        {data.notes && (
          <div className="bg-[#1E3E62]/20 border border-[#1E3E62] rounded-xl p-4 mb-6">
            <h3 className="text-xs text-[#8b9bb4] font-bold tracking-wider mb-2">ENGINE ANALYSIS</h3>
            <p className="text-sm font-sans">{data.notes}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <h3 className="text-xs text-[#8b9bb4] font-bold tracking-wider border-b border-[#1E3E62] pb-2">METADATA</h3>
          
          <div className="flex items-start gap-4">
            <Clock size={16} className="text-[#FF6500] mt-0.5" />
            <div>
              <div className="text-xs text-[#8b9bb4]">CAPTURED AT</div>
              <div className="text-sm">{new Date(data.captured_at).toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <MapPin size={16} className="text-[#FF6500] mt-0.5" />
            <div>
              <div className="text-xs text-[#8b9bb4]">LOCATION</div>
              {data.gps_lat ? (
                <a href={`https://www.google.com/maps?q=${data.gps_lat},${data.gps_lng}`} target="_blank" className="text-sm text-blue-400 hover:underline">
                  {data.gps_lat.toFixed(6)}, {data.gps_lng.toFixed(6)}
                </a>
              ) : (
                <div className="text-sm text-gray-500">Not recorded</div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Hash size={16} className="text-[#FF6500] mt-0.5" />
            <div className="overflow-hidden w-full">
              <div className="text-xs text-[#8b9bb4]">SHA-256 SIGNATURE</div>
              <div className="text-[10px] break-all text-gray-400 bg-black/50 p-2 rounded mt-1 border border-[#1E3E62]">
                {data.image_hash}
              </div>
            </div>
          </div>
        </div>

        <Link href="/capture" className="mt-auto block">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#1E3E62]/40 border border-[#1E3E62] text-white py-4 rounded-xl font-bold text-center tracking-wide hover:bg-[#1E3E62]/60 transition-colors"
          >
            SCAN ANOTHER SAMPLE
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
