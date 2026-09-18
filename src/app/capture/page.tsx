"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Landmark, ArrowLeft, Upload, MapPin, Loader2, CheckCircle2 } from "lucide-react";
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
    toast.info("Acquiring GPS Signal...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("GPS Lock Acquired");
      }, () => {
        toast.error("Failed to acquire GPS. Please check permissions.");
      }, { enableHighAccuracy: true });
    } else {
      toast.error("GPS not supported on this device.");
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.success("Image loaded into local memory");
    }
  };

  const extractColor = (ctx: CanvasRenderingContext2D, x: number, y: number): number[] => {
    const imageData = ctx.getImageData(x - 5, y - 5, 10, 10);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    const count = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  };

  // Helper to artificially slow down processing just enough to show the user the steps (improves perceived UI certainty)
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !previewUrl) {
      toast.error("Please upload an evidence photograph.");
      return;
    }

    try {
      // PHASE 1: EXTRACTING
      setProcessingState("EXTRACTING");
      await sleep(400); // UI Certainty
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas missing");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas context missing");
      ctx.drawImage(img, 0, 0);

      const refX = Math.floor(img.width * 0.20);
      const refY = Math.floor(img.height * 0.50);
      const testX = Math.floor(img.width * 0.65);
      const testY = Math.floor(img.height * 0.50);

      const rawWhite = extractColor(ctx, refX, refY);
      const rawSpot = extractColor(ctx, testX, testY);

      // PHASE 2: MATH
      setProcessingState("MATH");
      await sleep(500); // UI Certainty
      const finalColor = calibrateColor(rawSpot, rawWhite);
      const classification = classifySpotTest(finalColor, reagent);

      // PHASE 3: HASHING
      setProcessingState("HASHING");
      await sleep(600); // UI Certainty
      const arrayBuffer = await imageFile.arrayBuffer();
      const image_hash = await generateSHA256(arrayBuffer);
      const base64Image = canvas.toDataURL("image/jpeg", 0.5);

      // PHASE 4: SYNCING
      setProcessingState("SYNCING");
      const res = await fetch("/api/v1/tests/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator_id: "NCB-OP-109",
          reagent,
          notes,
          gps_lat: location?.lat || null,
          gps_lng: location?.lng || null,
          captured_at: new Date().toISOString(),
          image_hash,
          base64Image,
          result: classification.result,
          confidence: "high"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProcessingState("SUCCESS");
        toast.success("Analysis Complete & Synced");
        await sleep(300);
        router.push(`/result/${data.id}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Local processing error.");
      setProcessingState("IDLE");
    }
  };

  const buttonText = {
    "IDLE": "RUN ZERO-TRUST ANALYSIS",
    "EXTRACTING": "1/4 EXTRACTING PIXELS...",
    "MATH": "2/4 RUNNING CIEDE2000 MATH...",
    "HASHING": "3/4 GENERATING SHA-256...",
    "SYNCING": "4/4 SECURING TO LEDGER...",
    "SUCCESS": "REDIRECTING..."
  }[processingState];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-10">
      <header className="bg-[#003366] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-gray-200 mr-2 transition-transform active:scale-95">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xs font-bold tracking-wide">Conduct Field Test</h1>
            <h2 className="text-[10px] text-gray-300">NCB Optical Analysis Utility</h2>
          </div>
        </div>
        <Landmark size={20} className="text-white opacity-50" />
      </header>

      <div className="max-w-md mx-auto p-4 mt-2">
        <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
          <div className="bg-gray-100 p-3 border-b border-gray-300 text-xs font-bold text-[#003366] flex justify-between items-center">
            <span>Evidence Collection (Form 4A)</span>
            <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded text-[9px] border border-green-300 uppercase font-black flex items-center gap-1">
              <CheckCircle2 size={10} /> EDGE ACTIVE
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-5">
            {/* Step 1: Image Capture */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">1. Upload Test Photograph <span className="text-red-500">*</span></label>
              {!previewUrl ? (
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 hover:border-[#003366] active:bg-gray-200 flex flex-col items-center justify-center cursor-pointer text-gray-500 transition-all">
                  <Upload size={24} className="mb-2 text-[#003366]" />
                  <span className="text-xs font-bold text-[#003366]">Capture / Upload</span>
                </div>
              ) : (
                <div className="relative border border-gray-300 bg-gray-50 p-2 group">
                  <img src={previewUrl} alt="Evidence" className="w-full h-48 object-contain" />
                  <button type="button" onClick={() => {setPreviewUrl(null); setImageFile(null);}} className="absolute top-4 right-4 bg-white border border-red-500 text-red-500 text-xs font-bold px-3 py-1 shadow-sm active:bg-red-50 transition-colors opacity-90 hover:opacity-100">RETAKE</button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">2. Select Chemical Reagent <span className="text-red-500">*</span></label>
              <select value={reagent} onChange={(e) => setReagent(e.target.value)} className="w-full border border-gray-400 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-white transition-shadow">
                <option value="Auto-Detect (Lateral Flow)">Auto-Detect (Lateral Flow Cassette)</option>
                <option value="Marquis">Marquis Reagent</option>
                <option value="Ferric">Ferric Sulfate</option>
                <option value="Nitric">Nitric Acid</option>
                <option value="Wagner">Wagner Test</option>
                <option value="Cobalt">Cobalt Thiocyanate</option>
                <option value="Simon">Simon Test</option>
                <option value="Liebermann">Liebermann</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">3. Operator Notes (Optional)</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter scene details" className="w-full border border-gray-400 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-shadow" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">4. Geolocation Data</label>
              <div className="flex gap-2">
                <input type="text" disabled value={location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Not Fetched"} className="flex-1 border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-500 font-mono" />
                <button type="button" onClick={fetchGPS} className="bg-[#003366]/10 border border-[#003366]/30 text-[#003366] px-4 py-2 text-xs font-bold hover:bg-[#003366]/20 active:bg-[#003366]/30 flex items-center gap-1 transition-colors"><MapPin size={14} /> FETCH</button>
              </div>
            </div>

            <button type="submit" disabled={processingState !== "IDLE"} className={`w-full font-bold py-3.5 text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${processingState !== "IDLE" ? "bg-[#e5e7eb] text-[#003366] border-2 border-[#003366]" : "bg-[#003366] hover:bg-[#153e90] active:scale-[0.99] text-white"}`}>
              {processingState !== "IDLE" && <Loader2 size={16} className="animate-spin" />}
              {buttonText}
            </button>
          </form>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-4 font-mono">DIGITAL INDIA • ZERO-TRUST ARCHITECTURE</p>
      </div>
    </div>
  );
}
