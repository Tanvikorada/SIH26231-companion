"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CapturePage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [reagent, setReagent] = useState("Auto-Detect (Lateral Flow)");
  const [time, setTime] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    const timer = setInterval(() => {
      setTime(new Date().toISOString().replace("T", " ").split(".")[0] + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    
    if (location) {
      formData.append("gps_lat", location.lat.toString());
      formData.append("gps_lng", location.lng.toString());
    }

    try {
      const res = await fetch("/api/v1/tests", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/result/${data.id}`);
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
    <div className="flex flex-col min-h-screen bg-black text-white font-mono">
      {/* Top Telemetry Bar */}
      <div className="absolute top-0 w-full p-4 z-20 flex justify-between items-start text-xs text-green-400 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity size={12} className="animate-pulse text-red-500" />
            <span>LIVE UPLINK</span>
          </div>
          <div>OP-ID: NCB-OP-109</div>
          <div>{time}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "ACQUIRING GPS..."}
          </div>
          <div>SAT: 12 LOCKED</div>
        </div>
      </div>

      <div className="flex-grow relative flex items-center justify-center overflow-hidden">
        {/* Camera Viewfinder Overlay */}
        {!previewUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10 pointer-events-none">
            <div className="w-full max-w-sm aspect-[3/4] border-2 border-white/20 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FF6500]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FF6500]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FF6500]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FF6500]" />
              
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-20 h-32 border-2 border-dashed border-gray-400/50 rounded flex items-center justify-center">
                <span className="text-gray-400/50 text-[10px] text-center px-2">COLOR<br/>CARD</span>
              </div>
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-16 h-16 rounded-full border-2 border-dashed border-[#FF6500]/50 flex items-center justify-center">
                <span className="text-[#FF6500]/50 text-[10px] text-center px-2">LIQUID<br/>DROP</span>
              </div>

              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
              <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/10" />
            </div>
          </div>
        ) : (
          <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain" />
        )}

        {/* Input */}
        {!previewUrl && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center bg-black/20 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer"
            >
              <Camera size={32} />
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

        {/* Scanning Animation */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 bg-[#0B192C]/80 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <motion.div 
                animate={{ y: [-100, 100, -100] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-full max-w-sm h-1 bg-[#FF6500] shadow-[0_0_20px_#FF6500]"
              />
              <p className="mt-8 text-[#FF6500] tracking-[0.3em] text-sm animate-pulse">ANALYZING SPECTRAL DATA...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel */}
      <AnimatePresence>
        {previewUrl && !isUploading && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="absolute bottom-0 w-full bg-[#0B192C] rounded-t-3xl p-6 z-20 border-t border-[#1E3E62] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight">Configure Scan</h2>
              <button onClick={() => setPreviewUrl(null)} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs text-[#8b9bb4] font-bold uppercase tracking-wider mb-2 block">Select Reagent Used</label>
                <div className="relative">
                  <select 
                    value={reagent}
                    onChange={(e) => setReagent(e.target.value)}
                    className="w-full p-4 bg-[#1E3E62]/30 border border-[#1E3E62] rounded-xl text-white appearance-none focus:outline-none focus:border-[#FF6500]"
                  >
                    
                    <option value="Auto-Detect (Lateral Flow)">Auto-Detect (Lateral Flow Cassette)</option>
                    <option value="Marquis">Marquis Reagent</option>
                    <option value="Ferric Sulfate">Ferric Sulfate</option>
                    <option value="Nitric Acid">Nitric Acid</option>
                    <option value="Wagner">Wagner Test</option>
                    <option value="Cobalt Thiocyanate">Cobalt Thiocyanate (Cocaine)</option>
                    <option value="Simon Test">Simon Test</option>
                    <option value="Liebermann">Liebermann</option>
                  </select>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className="w-full bg-[#FF6500] text-white py-4 rounded-xl font-bold text-lg tracking-wide shadow-[0_0_20px_-5px_#FF6500]"
              >
                PROCESS EVIDENCE
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
