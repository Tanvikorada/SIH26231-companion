"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const STAGES = [
  "ISOLATING CALIBRATION PATCHES...",
  "EXTRACTING AMBIENT LIGHT PROFILE...",
  "APPLYING CIEDE2000 COLOR CORRECTION MATRIX...",
  "ISOLATING CHEMICAL REACTION SIGNATURE...",
  "QUERYING GLOBAL SPOT TEST DATABASE (2,836 RECORDS)...",
  "CALCULATING DELTA-E DISTANCES...",
  "GENERATING SHA-256 CRYPTOGRAPHIC HASH...",
  "SECURING CHAIN OF CUSTODY..."
];

export default function ProcessingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    let delay = 0;
    const timeouts: NodeJS.Timeout[] = [];
    
    STAGES.forEach((stage, index) => {
      delay += Math.random() * 500 + 300; // Between 300ms and 800ms per stage
      const timeout = setTimeout(() => {
        setStageIndex(index);
      }, delay);
      timeouts.push(timeout);
    });

    // Final redirect
    const finalTimeout = setTimeout(() => {
      router.push(`/result/${id}`);
    }, delay + 800);
    timeouts.push(finalTimeout);

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF9D] font-mono flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Matrix Rain / Hex Code background effect */}
      <div className="absolute inset-0 opacity-10 flex flex-wrap overflow-hidden text-[8px] leading-none break-all pointer-events-none">
        {Array.from({ length: 1000 }).map((_, i) => (
          <span key={i} className="m-0.5">{Math.random().toString(16).substring(2, 6).toUpperCase()}</span>
        ))}
      </div>

      <div className="z-10 w-full max-w-sm px-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-t-2 border-r-2 border-[#00FF9D] rounded-full mx-auto mb-12"
        />

        <div className="h-40 flex flex-col justify-end overflow-hidden border-l-2 border-[#00FF9D]/30 pl-4">
          <div className="flex flex-col gap-2">
            {STAGES.slice(0, stageIndex + 1).map((stage, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: i === stageIndex ? 1 : 0.4, x: 0 }}
                className={`text-[10px] tracking-widest ${i === stageIndex ? 'text-white drop-shadow-[0_0_5px_#00FF9D]' : 'text-[#00FF9D]'}`}
              >
                {'>'} {stage}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 h-1 w-full bg-[#00FF9D]/10 rounded overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
            className="h-full bg-[#00FF9D] shadow-[0_0_10px_#00FF9D]"
          />
        </div>
        <div className="mt-2 text-right text-[10px] tracking-widest text-[#00FF9D]/50">
          {Math.round(((stageIndex + 1) / STAGES.length) * 100)}%
        </div>

      </div>
    </div>
  );
}
