import Link from "next/link";
import { Camera, ClipboardList, ShieldAlert } from "lucide-react";
import * as motion from "framer-motion/client";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B192C] p-6 text-white text-center selection:bg-[#FF6500] selection:text-white relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#1E3E62] rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#FF6500] rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 max-w-md w-full flex flex-col items-center"
      >
        <div className="mb-6 bg-[#1E3E62]/30 p-4 rounded-full border border-[#1E3E62]">
          <ShieldAlert size={48} className="text-[#FF6500]" />
        </div>
        
        <div className="space-y-2 mb-10">
          <p className="text-[#FF6500] text-xs font-bold tracking-[0.2em] uppercase">Ministry of Home Affairs</p>
          <h1 className="text-4xl font-extrabold tracking-tight">NCB Field Scanner</h1>
          <p className="text-[#8b9bb4] text-sm max-w-xs mx-auto pt-2">
            Secure, mathematically calibrated chemical spot test analysis.
          </p>
        </div>

        <div className="w-full space-y-4">
          <Link href="/capture" className="block w-full">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden flex items-center justify-center gap-3 w-full bg-[#FF6500] text-white px-6 py-4 rounded-xl font-bold shadow-[0_0_40px_-10px_#FF6500] hover:shadow-[0_0_60px_-15px_#FF6500] transition-all"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Camera size={22} className="relative z-10" />
              <span className="relative z-10 text-lg tracking-wide">Initiate Scan</span>
            </motion.div>
          </Link>
          
          <Link href="/logs" className="block w-full">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 w-full bg-[#1E3E62]/40 backdrop-blur-md border border-[#1E3E62] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#1E3E62]/60 transition-all"
            >
              <ClipboardList size={20} className="text-[#8b9bb4]" />
              <span className="tracking-wide">View Forensic Logs</span>
            </motion.div>
          </Link>
        </div>

        <div className="mt-12 text-xs text-[#8b9bb4]/60 font-mono flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM ONLINE • ENCRYPTED
        </div>
      </motion.div>
    </div>
  );
}
