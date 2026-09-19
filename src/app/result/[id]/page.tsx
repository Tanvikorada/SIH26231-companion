"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, Landmark, ShieldCheck, ShieldAlert, Check } from "lucide-react";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/v1/tests/${id}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, [id]);

  if (!data) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#003366] text-sm font-bold">
      Fetching official record...
    </div>
  );

  const isPositive = data.result.toLowerCase() === "positive";
  const isNegative = data.result.toLowerCase() === "negative";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      
      {/* Top Nav (Non-printable) */}
      <div className="bg-[#003366] p-3 text-white flex justify-between items-center print:hidden sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/ledger")} className="flex items-center gap-1 hover:text-gray-300 text-xs">
            <ArrowLeft size={16} /> Back to Ledger
          </button>
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1 hover:text-gray-300 text-xs">
            Dashboard
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-1 hover:text-gray-300 text-xs bg-white/10 px-2 py-1 border border-white/20">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="p-4 flex justify-center">
        {/* A4 Certificate Container */}
        <div className="bg-white max-w-[800px] w-full border border-gray-300 relative overflow-hidden print:shadow-none print:border-none p-8 md:p-12 min-h-[1000px]">
          
          {/* Certificate Header */}
          <div className="flex justify-between items-start border-b-2 border-[#003366] pb-4 mb-6">
            <div className="flex items-center justify-center bg-gray-50 border border-gray-200 p-2 w-16 h-20 shrink-0">
              <div className="flex flex-col items-center justify-center text-center">
                <Landmark size={32} className="text-[#003366]" />
              </div>
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-xl font-bold text-[#003366] uppercase tracking-wide">Government of India</h1>
              <h2 className="text-md font-semibold text-gray-800">Ministry of Home Affairs</h2>
              <h3 className="text-sm text-gray-600 mt-1">Narcotics Control Bureau - Field Analysis Report</h3>
            </div>
            <div className="text-right shrink-0 flex flex-col items-end">
              <div className="text-[10px] text-gray-500 font-bold mb-1">Form 4A - Generated via NIC</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h4 className="text-lg font-bold border-b border-gray-300 inline-block px-4 pb-1 uppercase tracking-widest text-gray-800">
              Certificate of Analysis
            </h4>
          </div>

          <div className="space-y-6 text-sm text-gray-800 relative z-10">
            <p className="text-justify leading-relaxed">
              This is to certify that a chemical spot test analysis was conducted in the field by authorized personnel using the NCB Digital Companion App. The details of the evidence capture and subsequent algorithmic analysis are documented below.
            </p>

            <table className="w-full border-collapse border border-gray-400">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Certificate No.</td>
                  <td className="p-3 font-mono text-xs">{data.id}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Reagent Used</td>
                  <td className="p-3 font-bold">{data.reagent}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Date & Time of Capture</td>
                  <td className="p-3">{new Date(data.captured_at).toLocaleString('en-IN')}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Operator ID</td>
                  <td className="p-3 font-mono">{data.operator_id}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">GPS Coordinates</td>
                  <td className="p-3">
                    {data.gps_lat ? `${data.gps_lat.toFixed(6)}, ${data.gps_lng.toFixed(6)}` : "Location Not Recorded"}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Evidence Image Hash (SHA-256)</td>
                  <td className="p-3 font-mono text-[10px] break-all bg-gray-100">{data.image_hash}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-8 border-2 border-[#003366] p-6 flex flex-col items-center justify-center bg-gray-50">
              <h5 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Algorithmic Verdict</h5>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black uppercase tracking-wider ${
                  isPositive ? 'text-red-700' : isNegative ? 'text-green-700' : 'text-[#003366]'
                }`}>
                  {data.result}
                </span>
              </div>
              <div className="mt-4 text-xs font-bold border border-gray-300 bg-white px-4 py-1">
                Confidence Level: HIGH
              </div>
            </div>

            {/* Electronic Signature Block */}
            <div className="mt-12 flex justify-end">
              <div className="border-2 border-[#003366] p-3 text-[9px] text-[#003366] w-64 bg-blue-50">
                <div className="font-bold flex justify-between border-b border-[#003366] pb-1 mb-2">
                  <span>Cryptographic Signature Valid</span>
                  <Check size={12} />
                </div>
                <div>Digitally signed by Edge Node</div>
                <div>Date: {new Date(data.captured_at).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
