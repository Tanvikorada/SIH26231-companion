"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crosshair, Cpu, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CapturePage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reagent, setReagent] = useState("Auto-Detect (Lateral Flow)");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("operator_id", "NCB-OP-109");
    formData.append("captured_at", new Date().toISOString());
    formData.append("reagent", reagent);
    
    // Instead of waiting, we redirect immediately to the fake processing screen, passing the data via localStorage or something?
    // Wait, let's actually do the API call here, get the ID, but fake a delay on the processing screen.
    // For now, let's show the scanning animation here, then route to /processing/[id]
    
    try {
      const res = await fetch("/api/v1/tests", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        // Send to processing sequence
        router.push(`/processing/${data.id}`);
      } else {
        alert("Scan Failed: " + data.error);
        setIsUploading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting forensic engine.");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-[#00FF9D] font-mono overflow-hidden relative selection:bg-[#00FF9D] selection:text-black">
      
      {/* Top Nav */}
      <div className="absolute top-0 w-full p-6 z-20 flex justify-between items-start pointer-events-none">
        <Link href="/dashboard" className="pointer-events-auto p-2 bg-black/50 border border-[#00FF9D]/30 rounded-full backdrop-blur-sm hover:bg-[#00FF9D]/20 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col items-end text-[10px] tracking-widest gap-1">
          <span className="bg-[#00FF9D] text-black px-2 py-0.5 font-bold">OPTICAL SENSOR ACTIVE</span>
          <span>LAT: 13.03155, LNG: 80.18182</span>
        </div>
      </div>

      <div className="flex-grow relative flex items-center justify-center">
        {/* Viewfinder UI */}
        {!previewUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 z-10 pointer-events-none">
            <div className="w-full max-w-sm aspect-[3/4] relative">
              {/* Border Beam Effect manually created with CSS/Framer */}
              <div className="absolute inset-0 border border-[#00FF9D]/20 rounded-3xl" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-[-2px] rounded-3xl border-2 border-transparent pointer-events-none [mask-image:linear-gradient(transparent,transparent),linear-gradient(black,black)] [mask-clip:padding-box,border-box] [mask-composite:intersect]"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, #00FF9D 50%, transparent 100%) border-box",
                }}
              />

              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#00FF9D] rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF9D] rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00FF9D] rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#00FF9D] rounded-br-3xl" />
              
              {/* Target Zones */}
              <div className="absolute top-1/2 left-[20%] -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="w-16 h-24 border border-dashed border-[#00FF9D]/50 flex items-center justify-center bg-[#00FF9D]/5" />
                <span className="text-[8px] tracking-[0.2em]">CALIBRATION CARD</span>
              </div>

              <div className="absolute top-1/2 right-[20%] -translate-y-1/2 translate-x-1/2 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border border-dashed border-[#00FF9D]/50 flex items-center justify-center bg-[#00FF9D]/5">
                  <Crosshair size={24} className="text-[#00FF9D]/30" />
                </div>
                <span className="text-[8px] tracking-[0.2em]">SAMPLE DROP</span>
              </div>

              {/* Center Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#00FF9D]/50" />
                <div className="absolute left-1/2 top-0 w-[1px] h-full bg-[#00FF9D]/50" />
              </div>
            </div>
          </div>
        ) : (
          <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover filter brightness-75 contrast-125" />
        )}

        {/* Action Button */}
        {!previewUrl && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-24 h-24 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md cursor-pointer border border-[#00FF9D]/30 hover:border-[#00FF9D] hover:bg-[#00FF9D]/10 transition-all"
            >
              <div className="absolute inset-2 rounded-full border border-dashed border-[#00FF9D]/50 group-hover:rotate-180 transition-transform duration-1000" />
              <Cpu size={32} className="text-[#00FF9D]" />
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleCapture} 
              className="hidden" 
            />
          </div>
        )}

        {/* Uploading Laser Animation */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm pointer-events-none"
            >
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-[#00FF9D] shadow-[0_0_20px_#00FF9D]"
              />
              
              {/* Glitch text overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold tracking-[0.5em] text-sm animate-pulse">
                UPLOADING TO MAINFRAME...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel (Reagent Selector) */}
      <AnimatePresence>
        {previewUrl && !isUploading && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="absolute bottom-0 w-full bg-black/90 backdrop-blur-xl border-t border-[#00FF9D]/30 p-6 z-30"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-bold tracking-[0.3em]">SELECT TARGET REAGENT</h2>
              <button onClick={() => setPreviewUrl(null)} className="text-[10px] tracking-widest bg-red-900/40 text-red-500 px-3 py-1 border border-red-500/50 rounded hover:bg-red-500 hover:text-black transition-colors">
                ABORT
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <select 
                value={reagent}
                onChange={(e) => setReagent(e.target.value)}
                className="w-full p-4 bg-[#00FF9D]/5 border border-[#00FF9D]/30 rounded text-[#00FF9D] text-sm tracking-wider appearance-none focus:outline-none focus:border-[#00FF9D] focus:shadow-[0_0_20px_rgba(0,255,157,0.2)]"
              >
                <option value="Auto-Detect (Lateral Flow)">[ AUTO-DETECT (LATERAL FLOW) ]</option>
                <option value="Marquis">Marquis Reagent</option>
                <option value="Ferric Sulfate">Ferric Sulfate</option>
                <option value="Nitric Acid">Nitric Acid</option>
                <option value="Wagner">Wagner Test</option>
                <option value="Cobalt Thiocyanate">Cobalt Thiocyanate (Cocaine)</option>
                <option value="Simon Test">Simon Test</option>
                <option value="Liebermann">Liebermann</option>
              </select>

              <button 
                type="submit" 
                className="w-full bg-[#00FF9D] text-black py-4 font-bold text-lg tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,157,0.4)] hover:shadow-[0_0_40px_rgba(0,255,157,0.6)] transition-all hover:scale-[1.02]"
              >
                EXECUTE FORENSIC SCAN
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
