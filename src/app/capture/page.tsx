"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, MapPin, Loader2, CheckCircle, Scan, FileCode2, Crosshair, Cpu } from "lucide-react";
import { classifySpotTest, calibrateColor, generateSHA256, isCalibrated, assessConfidence } from "@/lib/engine";
import { autoDetectSpot } from "@/lib/autodetect";
import { analyzeLateralFlow } from "@/lib/lateralflow";
import { toast } from "sonner";

export default function CapturePage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<"IDLE" | "EXTRACTING" | "MATH" | "HASHING" | "SYNCING" | "SUCCESS">("IDLE");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [reagent, setReagent] = useState("Auto-Detect (Lateral Flow)");
  const [notes, setNotes] = useState("");
  const [useReference, setUseReference] = useState(true);
  const [operator, setOperator] = useState<{ operator_id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setOperator(d); else window.location.href = "/login?next=/capture"; }).catch(() => {});
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => {}, { enableHighAccuracy: true, timeout: 15000 });
    }
  }, []);

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

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, Math.min(ms, 150)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !previewUrl) return toast.error("Evidence photograph required.");

    try {
      let autoWhiteReliable = true;
      setProcessingState("EXTRACTING"); await sleep(500);
      const img = new Image(); img.src = previewUrl; await new Promise((resolve) => (img.onload = resolve));
      const canvas = canvasRef.current; if (!canvas) throw new Error("Canvas missing");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true }); if (!ctx) throw new Error("Canvas context missing");
      ctx.drawImage(img, 0, 0);

      const isLateralFlow = reagent === "Auto-Detect (Lateral Flow)";
      let lfResult: ReturnType<typeof analyzeLateralFlow> = null;
      let rawWhite: number[] = [255, 255, 255];
      let rawSpot: number[] = [0, 0, 0];
      if (isLateralFlow) {
        const id = ctx.getImageData(0, 0, img.width, img.height);
        lfResult = analyzeLateralFlow({ data: id.data, width: id.width, height: id.height, channels: 4 });
        if (!lfResult) throw new Error("No test lines found. Frame the strip window(s) with the C end at the top, in good light.");
      } else if (useReference) {
        rawWhite = extractColor(ctx, Math.floor(img.width * 0.20), Math.floor(img.height * 0.50));
        rawSpot = extractColor(ctx, Math.floor(img.width * 0.65), Math.floor(img.height * 0.50));
      } else {
        const id = ctx.getImageData(0, 0, img.width, img.height);
        const det = autoDetectSpot({ data: id.data, width: id.width, height: id.height, channels: 4 });
        if (!det) throw new Error("Could not locate the reagent spot. Use a white surface around the spot, or enable the reference card.");
        rawWhite = det.white;
        rawSpot = det.spot;
        autoWhiteReliable = det.whiteReliable;
      }

      setProcessingState("MATH"); await sleep(700);
      let classification: { result: string; distance: number };
      let calibrated = true;
      let confidence: string;
      let lfNotes = "";
      if (lfResult) {
        classification = { result: lfResult.result, distance: 0 };
        confidence = lfResult.result === "inconclusive" ? "low" : "high";
        lfNotes = "Panels: " + lfResult.panels.map((p) => p.index + "=" + p.verdict.toUpperCase()).join(", ");
      } else {
        const finalColor = calibrateColor(rawSpot, rawWhite);
        classification = classifySpotTest(finalColor, reagent);
        calibrated = isCalibrated(rawWhite) && autoWhiteReliable;
        confidence = assessConfidence(classification.result, classification.distance, calibrated, !useReference);
      }

      setProcessingState("HASHING"); await sleep(600);
      // The evidence image is the exact JPEG we upload: hash those bytes so the server can re-verify them.
      const maxSide = 1600;
      const k = Math.min(1, maxSide / Math.max(canvas.width, canvas.height));
      const ev = document.createElement("canvas");
      ev.width = Math.round(canvas.width * k);
      ev.height = Math.round(canvas.height * k);
      ev.getContext("2d")!.drawImage(canvas, 0, 0, ev.width, ev.height);
      const base64Image = ev.toDataURL("image/jpeg", 0.85);
      const raw = atob(base64Image.split(",")[1]);
      const evBytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) evBytes[i] = raw.charCodeAt(i);
      const image_hash = await generateSHA256(evBytes.buffer);

      let gps = location;
      if (!gps && "geolocation" in navigator) {
        gps = await new Promise<{ lat: number; lng: number } | null>((resolve) =>
          navigator.geolocation.getCurrentPosition((pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => resolve(null), { enableHighAccuracy: true, timeout: 8000 })
        );
      }
      if (!gps) toast.warning("GPS unavailable: the record will be flagged as having no location.");

      setProcessingState("SYNCING");
      const res = await fetch("/api/v1/tests/sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reagent, notes: [notes, lfNotes].filter(Boolean).join(" | ") || undefined,
          gps_lat: gps?.lat ?? null, gps_lng: gps?.lng ?? null,
          captured_at: new Date().toISOString(), image_hash, base64Image,
          result: classification.result, confidence, calibration_status: !calibrated ? "uncalibrated" : useReference || lfResult ? "calibrated" : "estimated"
        }),
      });

      const data = await res.json();
      if (res.status === 401) { window.location.href = "/login?next=/capture"; return; }
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Operator (record is signed under this ID)</label>
                <input type="text" disabled value={operator ? `${operator.operator_id} - ${operator.name}` : "Checking sign-in..."} className="w-full bg-gray-100 border border-gray-300 px-4 py-3 text-sm text-gray-700 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Reagent Profile</label>
                <div className="relative">
                  <select value={reagent} onChange={(e) => setReagent(e.target.value)} className="w-full appearance-none bg-white border border-gray-400 text-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]">
                    <option value="Auto-Detect (Lateral Flow)">Test cup / strip (C and T lines)</option>
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

              {reagent === "Auto-Detect (Lateral Flow)" ? (
                <div className="border border-gray-300 bg-gray-50 p-3 text-xs text-gray-800">
                  <b>Lateral-flow reading:</b> two lines (C + T) = negative; control line only = positive; no control line = invalid.
                  Hold the cup with the <b>C end at the top</b>. Line darkness is ignored. Read within the kit time window (about 5 minutes).
                </div>
              ) : (
              <div className="border border-gray-300 bg-gray-50 p-3">
                <label className="flex items-start gap-3 text-sm font-bold text-gray-900 cursor-pointer">
                  <input type="checkbox" checked={useReference} onChange={(e) => setUseReference(e.target.checked)} className="mt-1 w-4 h-4" />
                  <span>
                    White reference card in frame (recommended)
                    <span className="block text-xs font-normal text-gray-700 mt-1">
                      {useReference
                        ? "Card centred at 20% width, spot at 65% width. Most accurate."
                        : "No card: lighting is estimated from the brightest surface and the spot is auto-located. Spot must sit on a white plate or paper. Lower accuracy; confidence is capped."}
                    </span>
                  </span>
                </label>
              </div>
              )}

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
