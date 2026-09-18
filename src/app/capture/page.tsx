"use client";

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { Camera, RefreshCw, Upload } from "lucide-react";

export default function CapturePage() {
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setLoading(true);
    setStatusText("Fetching GPS...");

    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch (e) {
      console.log("GPS denied or unavailable");
    }

    setStatusText("Calibrating & Classifying...");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("operator_id", "OFFICER_01"); // Hardcoded for prototype
    formData.append("captured_at", new Date().toISOString());
    if (lat && lng) {
      formData.append("gps_lat", lat.toString());
      formData.append("gps_lng", lng.toString());
    }

    try {
      const apiRes = await fetch("/api/v1/tests", {
        method: "POST",
        body: formData,
      });
      const data = await apiRes.json();
      
      if (!apiRes.ok) {
        alert("Error: " + (data.error || "Unknown"));
        setLoading(false);
        return;
      }

      router.push(`/result/${data.id}`);
    } catch (err) {
      alert("Failed to capture");
      setLoading(false);
    }
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
    await processFile(file);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="relative h-screen w-full bg-black flex flex-col">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "environment" }}
        className="w-full h-full object-cover"
      />

      {/* Guide Overlays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Reference Card Guide */}
        <div className="absolute left-[7%] top-[35%] w-[10%] h-[10%] border-2 border-dashed border-white rounded flex items-center justify-center text-white/50 text-xs">
          REF
        </div>
        {/* Test Strip Guide */}
        <div className="absolute left-[65%] top-[25%] w-[10%] h-[10%] border-2 border-dashed border-yellow-400 rounded flex items-center justify-center text-yellow-400/50 text-xs">
          TEST
        </div>
      </div>

      <div className="absolute bottom-0 w-full p-8 flex justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent">
        {loading ? (
          <div className="text-white flex flex-col items-center animate-pulse">
            <RefreshCw className="animate-spin mb-2" />
            <p>{statusText}</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Upload size={24} className="text-white" />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />

            <button
              onClick={capture}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Camera size={32} className="text-black" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

