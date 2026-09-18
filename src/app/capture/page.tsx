"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, MapPin, Loader2, CheckCircle2, Scan, FileCode2, Crosshair, Cpu, Camera } from "lucide-react";
import { classifySpotTest, calibrateColor, generateSHA256 } from "@/lib/engine";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CapturePage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<"IDLE" | "EXTRACTING" | "MATH" | "HASHING" | "SYNCING" | "SUCCESS">("IDLE");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [reagent, setReagent] = useState("Auto-Detect (Lateral Flow)");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchGPS = () => {
    toast.promise(
      new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); resolve(pos); },
            reject,
            { enableHighAccuracy: true }
          );
        } else { reject(new Error("Not supported")); }
      }),
      { loading: "Acquiring Military-Grade GPS...", success: "GPS Lock Acquired", error: "Failed to acquire GPS" }
    );
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.success("Image secured in local RAM");
    }
  };

  const extractColor = (ctx: CanvasRenderingContext2D, x: number, y: number): number[] => {
    const imageData = ctx.getImageData(x - 5, y - 5, 10, 10);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    const count = data.length / 4;
    for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; }
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !previewUrl) return toast.error("Evidence photograph required.");

    try {
      setProcessingState("EXTRACTING"); await sleep(500);
      const img = new Image(); img.src = previewUrl; await new Promise((resolve) => (img.onload = resolve));
      const canvas = canvasRef.current; if (!canvas) throw new Error("Canvas missing");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true }); if (!ctx) throw new Error("Canvas context missing");
      ctx.drawImage(img, 0, 0);

      const rawWhite = extractColor(ctx, Math.floor(img.width * 0.20), Math.floor(img.height * 0.50));
      const rawSpot = extractColor(ctx, Math.floor(img.width * 0.65), Math.floor(img.height * 0.50));

      setProcessingState("MATH"); await sleep(700);
      const finalColor = calibrateColor(rawSpot, rawWhite);
      const classification = classifySpotTest(finalColor, reagent);

      setProcessingState("HASHING"); await sleep(600);
      const arrayBuffer = await imageFile.arrayBuffer();
      const image_hash = await generateSHA256(arrayBuffer);
      const base64Image = canvas.toDataURL("image/jpeg", 0.5);

      setProcessingState("SYNCING");
      const res = await fetch("/api/v1/tests/sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator_id: "NCB-OP-109", reagent, notes,
          gps_lat: location?.lat || null, gps_lng: location?.lng || null,
          captured_at: new Date().toISOString(), image_hash, base64Image,
          result: classification.result, confidence: "high"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProcessingState("SUCCESS"); toast.success("Analysis Complete");
        await sleep(400); router.push(`/result/${data.id}`);
      } else throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || "Local processing error.");
      setProcessingState("IDLE");
    }
  };

  const buttonContent = {
    "IDLE": { icon: <Cpu size={18} />, text: "INITIALIZE EDGE ENGINE" },
    "EXTRACTING": { icon: <Crosshair size={18} className="animate-spin" />, text: "EXTRACTING PIXELS..." },
    "MATH": { icon: <Loader2 size={18} className="animate-spin" />, text: "RUNNING CIEDE2000 MATH..." },
    "HASHING": { icon: <FileCode2 size={18} className="animate-pulse" />, text: "GENERATING SHA-256..." },
    "SYNCING": { icon: <Loader2 size={18} className="animate-spin" />, text: "SECURING TO LEDGER..." },
    "SUCCESS": { icon: <CheckCircle2 size={18} />, text: "REDIRECTING..." }
  }[processingState];

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-1.5 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={18} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Target Analysis</h1>
            <h2 className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Edge Active
            </h2>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
          
          {/* Scanner Window */}
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200/60 overflow-hidden relative group">
            {!previewUrl ? (
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 sm:h-64 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer transition-all group-active:scale-[0.98]">
                <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-3">
                  <Camera className="w-6 h-6 text-indigo-500" />
                </div>
                <span className="text-sm font-bold text-slate-700">Capture Evidence</span>
                <span className="text-xs text-slate-400 mt-1">High-Res Camera / Upload</span>
              </div>
            ) : (
              <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-black">
                <img src={previewUrl} alt="Evidence" className="w-full h-full object-contain opacity-90" />
                {processingState !== "IDLE" && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="w-full h-1 bg-emerald-400 animate-scan-line shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                    <div className="absolute top-1/2 left-[20%] w-8 h-8 -ml-4 -mt-4 border-2 border-emerald-400 rounded-full animate-ping"></div>
                    <div className="absolute top-1/2 left-[65%] w-8 h-8 -ml-4 -mt-4 border-2 border-indigo-400 rounded-full animate-ping delay-150"></div>
                  </div>
                )}
                <button type="button" onClick={() => {setPreviewUrl(null); setImageFile(null);}} className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-black/70 transition-colors">
                  RETAKE
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Controls */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/60 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reagent Profile</label>
              <div className="relative">
                <select value={reagent} onChange={(e) => setReagent(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  <option value="Auto-Detect (Lateral Flow)">Auto-Detect (Lateral Flow)</option>
                  <option value="Marquis">Marquis Reagent</option>
                  <option value="Ferric">Ferric Sulfate</option>
                  <option value="Nitric">Nitric Acid</option>
                  <option value="Wagner">Wagner Test</option>
                  <option value="Cobalt">Cobalt Thiocyanate</option>
                  <option value="Simon">Simon Test</option>
                  <option value="Liebermann">Liebermann</option>
                </select>
                <Scan className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Metadata (Optional)</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Subject ID / Case #" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Geolocation Overlay</label>
              <div className="flex gap-2">
                <input type="text" disabled value={location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Awaiting Lock..."} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 font-mono" />
                <button type="button" onClick={fetchGPS} className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-5 rounded-xl text-xs font-bold hover:bg-indigo-100 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm">
                  <MapPin size={16} /> LOCK
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={processingState !== "IDLE"} className={`relative w-full rounded-2xl font-bold py-4 text-sm transition-all shadow-lg flex items-center justify-center gap-2 overflow-hidden ${processingState !== "IDLE" ? "bg-slate-800 text-white cursor-wait scale-[0.99]" : "bg-gradient-to-r from-gov-blue to-blue-700 hover:shadow-blue-900/30 active:scale-[0.98] text-white"}`}>
            {processingState === "IDLE" && <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>}
            <AnimatePresence mode="popLayout">
              <motion.div key={processingState} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex items-center gap-2">
                {buttonContent.icon}
                <span className="tracking-widest uppercase">{buttonContent.text}</span>
              </motion.div>
            </AnimatePresence>
          </button>
        </motion.form>
      </main>
    </div>
  );
}
