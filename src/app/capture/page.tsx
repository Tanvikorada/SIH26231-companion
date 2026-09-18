"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Landmark, ArrowLeft, Camera, MapPin, Upload } from "lucide-react";

export default function CapturePage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [reagent, setReagent] = useState("Auto-Detect (Lateral Flow)");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    } else {
      alert("GPS not supported.");
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please upload a photograph of the test kit first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("operator_id", "NCB-OP-109");
    formData.append("captured_at", new Date().toISOString());
    formData.append("reagent", reagent);
    if (notes) formData.append("notes", notes);
    
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
        alert("Submission Failed: " + data.error);
        setIsUploading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      
      {/* Official Header */}
      <header className="bg-[#003366] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-gray-200 mr-2">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xs font-bold tracking-wide">Conduct Field Test</h1>
            <h2 className="text-[10px] text-gray-300">NCB Optical Analysis Utility</h2>
          </div>
        </div>
        <Landmark size={20} className="text-white opacity-50" />
      </header>

      <div className="max-w-md mx-auto p-4">
        
        {/* Form Container */}
        <div className="bg-white border border-gray-300 shadow-sm rounded-sm">
          <div className="bg-gray-100 p-3 border-b border-gray-300 text-xs font-bold text-[#003366]">
            Evidence Collection Form (Form 4A)
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-5">
            
            {/* Step 1: Image Capture */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">1. Upload Test Photograph <span className="text-red-500">*</span></label>
              
              {!previewUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center cursor-pointer text-gray-500 transition-colors"
                >
                  <Upload size={24} className="mb-2 text-[#003366]" />
                  <span className="text-xs font-bold text-[#003366]">Click to Capture / Upload Image</span>
                  <span className="text-[10px] mt-1">Ensure color card is clearly visible.</span>
                </div>
              ) : (
                <div className="relative border border-gray-300 bg-gray-50 p-2">
                  <img src={previewUrl} alt="Evidence" className="w-full h-48 object-contain" />
                  <button type="button" onClick={() => {setPreviewUrl(null); setImageFile(null);}} className="absolute top-4 right-4 bg-white border border-red-500 text-red-500 text-xs font-bold px-3 py-1 shadow-sm">
                    RETAKE
                  </button>
                </div>
              )}
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleCapture} 
                className="hidden" 
              />
            </div>

            {/* Step 2: Form Fields */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">2. Select Chemical Reagent <span className="text-red-500">*</span></label>
              <select 
                value={reagent}
                onChange={(e) => setReagent(e.target.value)}
                className="w-full border border-gray-400 p-2 text-sm focus:outline-none focus:border-[#003366] bg-white"
              >
                <option value="Auto-Detect (Lateral Flow)">Auto-Detect (Lateral Flow Cassette)</option>
                <option value="Marquis">Marquis Reagent</option>
                <option value="Ferric Sulfate">Ferric Sulfate</option>
                <option value="Nitric Acid">Nitric Acid</option>
                <option value="Wagner">Wagner Test</option>
                <option value="Cobalt Thiocyanate">Cobalt Thiocyanate</option>
                <option value="Simon Test">Simon Test</option>
                <option value="Liebermann">Liebermann</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">3. Operator Notes (Optional)</label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter scene details or subjective observations" 
                className="w-full border border-gray-400 p-2 text-sm focus:outline-none focus:border-[#003366]" 
              />
            </div>

            {/* Step 3: Location */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">4. Geolocation Data</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  disabled
                  value={location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Not Fetched"}
                  className="flex-1 border border-gray-300 bg-gray-100 p-2 text-sm text-gray-500" 
                />
                <button type="button" onClick={fetchGPS} className="bg-gray-200 border border-gray-400 text-gray-700 px-3 py-2 text-xs font-bold hover:bg-gray-300 flex items-center gap-1">
                  <MapPin size={14} /> FETCH
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 text-[10px] text-blue-800 text-justify leading-tight">
              <strong>Declaration:</strong> I hereby certify that the physical evidence submitted via this utility was collected securely at the coordinates specified above, and I acknowledge that my Operator ID is irreversibly appended to the cryptographic hash of this submission.
            </div>

            <button 
              type="submit" 
              disabled={isUploading}
              className={`w-full font-bold py-3 text-sm transition-colors shadow-md ${
                isUploading ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-[#003366] hover:bg-[#153e90] text-white"
              }`}
            >
              {isUploading ? "SUBMITTING EVIDENCE..." : "SUBMIT TO FORENSIC ENGINE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
