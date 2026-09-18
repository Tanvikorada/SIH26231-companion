"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Fingerprint, Shield, Phone, Building } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState("officer");
  const [captcha, setCaptcha] = useState("");
  
  const expectedCaptcha = "x7K9p";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (captcha.toLowerCase() !== expectedCaptcha.toLowerCase()) {
      alert("Invalid CAPTCHA");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] font-sans pt-1">
      
      {/* Official Header */}
      <header className="bg-[#003366] text-white p-4 shadow-md flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center bg-white p-1 rounded-sm w-10 h-12">
            <Landmark size={24} className="text-[#003366]" />
            <span className="text-[6px] text-black font-bold mt-0.5">सत्यमेव जयते</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">Narcotics Control Bureau</h1>
            <h2 className="text-[10px] text-gray-300">Ministry of Home Affairs, Government of India</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        <div className="w-full max-w-md bg-white border border-gray-300 shadow-lg rounded-sm overflow-hidden">
          
          <div className="bg-gray-100 p-4 border-b border-gray-300 flex items-center gap-2">
            <Shield size={18} className="text-[#003366]" />
            <h3 className="font-bold text-[#003366]">Official Personnel Login</h3>
          </div>

          <div className="flex border-b border-gray-300 text-sm">
            <button 
              onClick={() => setTab("officer")} 
              className={`flex-1 p-3 font-semibold ${tab === "officer" ? "border-b-4 border-[#FF9933] text-[#003366]" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Officer ID
            </button>
            <button 
              onClick={() => setTab("mobile")} 
              className={`flex-1 p-3 font-semibold ${tab === "mobile" ? "border-b-4 border-[#FF9933] text-[#003366]" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Mobile / OTP
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-5">
            
            {tab === "officer" ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">NCB Officer ID <span className="text-red-500">*</span></label>
                  <input type="text" required defaultValue="NCB-OP-109" className="w-full border border-gray-400 p-2 text-sm focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input type="password" required defaultValue="********" className="w-full border border-gray-400 p-2 text-sm focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Registered Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex border border-gray-400 focus-within:border-[#003366] focus-within:ring-1 focus-within:ring-[#003366]">
                    <span className="bg-gray-100 p-2 text-sm text-gray-600 border-r border-gray-400">+91</span>
                    <input type="tel" required className="w-full p-2 text-sm focus:outline-none" />
                  </div>
                </div>
                <button type="button" className="text-[#003366] text-xs font-bold hover:underline">Generate OTP</button>
              </>
            )}

            {/* Captcha */}
            <div className="bg-gray-50 p-3 border border-gray-300 flex items-center justify-between">
              <div className="text-lg font-serif font-bold tracking-widest italic line-through text-gray-800 select-none bg-blue-100 px-4 py-1">{expectedCaptcha}</div>
              <input 
                type="text" 
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder="Enter CAPTCHA" 
                required 
                className="w-1/2 border border-gray-400 p-2 text-sm focus:outline-none focus:border-[#003366]" 
              />
            </div>

            <button type="submit" className="w-full bg-[#003366] hover:bg-[#153e90] text-white font-bold py-3 text-sm transition-colors shadow-md">
              LOGIN
            </button>
          </form>

          <div className="bg-yellow-50 p-3 text-[10px] text-gray-700 border-t border-gray-300">
            <strong>WARNING:</strong> This system is for authorized personnel of the Ministry of Home Affairs only. Unauthorized access is strictly prohibited and punishable under the IT Act 2000.
          </div>
        </div>

      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-gray-300 p-4 mt-auto">
        <div className="max-w-md mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex flex-col items-center">
              <Fingerprint size={20} className="text-[#003366]" />
              <span className="text-[8px] font-bold mt-1 text-[#003366]">e-Pramaan</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <Building size={20} className="text-[#138808]" />
              <span className="text-[8px] font-bold mt-1 text-[#138808]">Digital India</span>
            </div>
          </div>
          <p className="text-[10px] text-center text-gray-500 leading-tight">
            Designed, Developed and Hosted by<br/>
            <strong>National Informatics Centre (NIC)</strong><br/>
            Ministry of Electronics & Information Technology, Government of India
          </p>
        </div>
      </footer>
    </div>
  );
}
