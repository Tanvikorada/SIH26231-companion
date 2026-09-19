"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, MapPin, Loader2, CheckCircle, Scan, FileCode2, Crosshair, Cpu } from "lucide-react";
import { classifySpotTest, calibrateColor, generateSHA256 } from "@/lib/engine";
import { toast } from "sonner";

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
      { loading: "Acquiring GPS...", success: "GPS Lock Acquired", error: "Failed to acquire GPS" }
    );
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.success("Image secured in local memory");
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
    "IDLE": { icon: <Cpu size={18} />, text: "INITIATE ANALYSIS" },
    "EXTRACTING": { icon: <Crosshair size={18} className="animate-spin" />, text: "EXTRACTING PIXELS..." },
    "MATH": { icon: <Loader2 size={18} className="animate-spin" />, text: "COMPUTING CIEDE2000..." },
    "HASHING": { icon: <FileCode2 size={18} className="animate-pulse" />, text: "GENERATING SHA-256..." },
    "SYNCING": { icon: <Loader2 size={18} className="animate-spin" />, text: "UPDATING LEDGER..." },
    "SUCCESS": { icon: <CheckCircle size={18} />, text: "REDIRECTING..." }
  }[processingState];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="border border-gray-300 p-2 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} className="text-[#003366]" />
          </Link>
          <div>
            <h1 className="font-bold text-xl text-[#003366] tracking-tight uppercase">Optical Target Analysis</h1>
            <h2 className="text-xs text-green-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Edge Processing Engine Ready
            </h2>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-white border border-[#003366] shadow-sm">
            <div className="bg-[#003366] text-white px-4 py-3 font-bold uppercase tracking-wide text-sm">
              1. Visual Evidence Capture
            </div>
            <div className="p-4">
              {!previewUrl ? (
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-64 border-2 border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <Camera className="w-10 h-10 text-gray-500 mb-3" />
                  <span className="text-sm font-bold text-gray-700 uppercase">Select or Capture Image</span>
                  <span className="text-xs text-gray-500 mt-1">Accepts standard image formats</span>
                </div>
              ) : (
                <div className="relative w-full h-64 border border-gray-300 bg-black flex items-center justify-center overflow-hidden">
                  <img src={previewUrl} alt="Evidence" className="max-w-full max-h-full object-contain" />
                  <button type="button" onClick={() => {setPreviewUrl(null); setImageFile(null);}} className="absolute top-2 right-2 bg-white text-[#003366] border border-[#003366] text-xs font-bold px-4 py-2 hover:bg-gray-50 transition-colors">
                    RETAKE IMAGE
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 font-bold uppercase tracking-wide text-sm text-[#003366]">
              2. Test Parameters
            </div>
            <div className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Reagent Profile</label>
                <div className="relative">
                  <select value={reagent} onChange={(e) => setReagent(e.target.value)} className="w-full appearance-none bg-white border border-gray-400 text-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]">
                    <option value="Auto-Detect (Lateral Flow)">Auto-Detect (Lateral Flow)</option>
                    <option value="Marquis">Marquis Reagent</option>
                    <option value="Ferric">Ferric Sulfate</option>
                    <option value="Nitric">Nitric Acid</option>
                    <option value="Wagner">Wagner Test</option>
                    <option value="Cobalt">Cobalt Thiocyanate</option>
                    <option value="Simon">Simon Test</option>
                    <option value="Liebermann">Liebermann</option>
                  </select>
                  <Scan className="absolute right-4 top-3 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Subject Notes (Optional)</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Case ID / Location Code" className="w-full bg-white border border-gray-400 text-gray-900 px-4 py-3 text-sm focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">GPS Telemetry</label>
                <div className="flex gap-2">
                  <input type="text" disabled value={location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Awaiting Coordinates..."} className="flex-1 bg-gray-100 border border-gray-300 px-4 py-3 text-sm text-gray-600 font-mono" />
                  <button type="button" onClick={fetchGPS} className="bg-white text-[#003366] border-2 border-[#003366] px-5 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366]">
                    <MapPin size={16} /> ACQUIRE
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={processingState !== "IDLE"} className={`w-full font-bold py-4 text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] ${processingState !== "IDLE" ? "bg-gray-800 text-white cursor-wait" : "bg-[#FF9933] hover:bg-[#e68a2e] text-white border border-transparent shadow-sm"}`}>
              {buttonContent.icon}
              <span className="tracking-widest uppercase">{buttonContent.text}</span>
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
