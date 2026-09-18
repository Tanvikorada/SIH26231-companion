"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ShieldCheck, Terminal, Cpu } from "lucide-react";

const BOOT_LOGS = [
  "INITIALIZING KERNEL...",
  "MOUNTING ENCRYPTED VOLUMES...",
  "ESTABLISHING SECURE CONNECTION TO NCB MAINNET...",
  "VERIFYING CRYPTOGRAPHIC KEYS...",
  "LOADING CIEDE2000 SPECTRAL ENGINE...",
  "CONNECTING TO GLOBAL SPOT TEST DATABASE...",
  "SYSTEM ONLINE. WAITING FOR OPERATOR AUTHENTICATION."
];

export default function BootScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [authStatus, setAuthStatus] = useState<"waiting" | "scanning" | "granted">("waiting");

  useEffect(() => {
    let delay = 0;
    BOOT_LOGS.forEach((log, index) => {
      delay += Math.random() * 300 + 200;
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
      }, delay);
    });
  }, []);

  const handleAuth = () => {
    if (authStatus !== "waiting") return;
    setAuthStatus("scanning");
    
    setTimeout(() => {
      setAuthStatus("granted");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF9D] font-mono flex flex-col items-center justify-center relative overflow-hidden selection:bg-[#00FF9D] selection:text-black">
      
      {/* Matrix / Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,157,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FF9D] rounded-full blur-[150px] opacity-10 pointer-events-none" />

      <div className="z-10 flex flex-col items-center w-full max-w-md p-6">
        
        {/* Terminal Boot Sequence */}
        <div className="w-full h-48 bg-black/50 border border-[#00FF9D]/20 rounded-lg p-4 mb-12 flex flex-col justify-end overflow-hidden backdrop-blur-sm shadow-[0_0_30px_-5px_rgba(0,255,157,0.1)]">
          <div className="flex items-center gap-2 mb-2 text-[#00FF9D]/50 border-b border-[#00FF9D]/20 pb-2">
            <Terminal size={14} />
            <span className="text-[10px] tracking-widest">SYSTEM BOOT LOG</span>
          </div>
          <div className="flex flex-col gap-1">
            {logs.map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="text-xs text-[#00FF9D]/80"
              >
                <span className="text-[#00FF9D]/40 mr-2">{'>'}</span>{log}
              </motion.div>
            ))}
            {logs.length < BOOT_LOGS.length && (
              <div className="w-2 h-3 bg-[#00FF9D] animate-pulse mt-1" />
            )}
          </div>
        </div>

        {/* Biometric Scanner */}
        <AnimatePresence mode="wait">
          {logs.length === BOOT_LOGS.length && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <button 
                onClick={handleAuth}
                className="relative group cursor-pointer"
              >
                <div className={`w-32 h-32 rounded-full border border-[#00FF9D]/30 flex items-center justify-center bg-[#00FF9D]/5 backdrop-blur-md transition-all duration-500 ${
                  authStatus === "scanning" ? "shadow-[0_0_50px_rgba(0,255,157,0.4)] border-[#00FF9D]" : 
                  authStatus === "granted" ? "bg-[#00FF9D]/20 shadow-[0_0_100px_rgba(0,255,157,0.6)] border-[#00FF9D]" :
                  "hover:bg-[#00FF9D]/10 hover:border-[#00FF9D]/60 hover:shadow-[0_0_30px_rgba(0,255,157,0.2)]"
                }`}>
                  {authStatus === "granted" ? (
                    <ShieldCheck size={48} className="text-[#00FF9D]" />
                  ) : (
                    <Fingerprint size={48} className={`text-[#00FF9D] transition-all duration-300 ${authStatus === "scanning" ? "animate-pulse" : "group-hover:scale-110"}`} />
                  )}
                </div>
                
                {authStatus === "scanning" && (
                  <motion.div 
                    animate={{ y: [0, 128, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-1 bg-[#00FF9D] shadow-[0_0_15px_#00FF9D] rounded-full"
                  />
                )}
              </button>

              <div className="mt-8 text-center h-8">
                {authStatus === "waiting" && <p className="text-sm tracking-widest animate-pulse">PRESS TO AUTHENTICATE</p>}
                {authStatus === "scanning" && <p className="text-sm tracking-widest text-[#00FF9D]">SCANNING BIOMETRICS...</p>}
                {authStatus === "granted" && <p className="text-sm tracking-widest text-white font-bold bg-[#00FF9D] text-black px-4 py-1 rounded">ACCESS GRANTED</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1 opacity-50">
        <div className="flex items-center gap-2">
          <Cpu size={14} />
          <span className="text-[10px] tracking-[0.3em] font-bold">MINISTRY OF HOME AFFAIRS</span>
        </div>
        <span className="text-[8px] tracking-widest">NARCOTICS CONTROL BUREAU FORENSIC DIVISION</span>
      </div>
    </div>
  );
}
