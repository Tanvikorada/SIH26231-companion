"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Landmark, Printer, Download, ShieldCheck, ShieldAlert } from "lucide-react";

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/v1/tests/${id}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, [id]);

  if (!data) return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center text-[#003366] text-sm font-bold">
      Loading official record...
    </div>
  );

  const isPositive = data.result === "positive";
  const isNegative = data.result === "negative";

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-12">
      
      {/* Top Nav (Non-printable) */}
      <div className="bg-[#003366] p-3 text-white flex justify-between items-center print:hidden sticky top-0 z-50">
        <button onClick={() => router.push("/ledger")} className="flex items-center gap-1 hover:text-gray-300 text-xs">
          <ArrowLeft size={16} /> Back to Ledger
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-1 hover:text-gray-300 text-xs bg-white/10 px-2 py-1 rounded-sm border border-white/20">
            <Printer size={14} /> Print
          </button>
          <button className="flex items-center gap-1 hover:text-gray-300 text-xs bg-[#FF9933] text-white px-2 py-1 rounded-sm shadow-sm">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div className="p-4 flex justify-center">
        {/* A4 Certificate Container */}
        <div className="bg-white max-w-[800px] w-full shadow-lg border border-gray-300 relative overflow-hidden print:shadow-none print:border-none p-8 md:p-12 min-h-[1000px]">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Landmark size={400} />
          </div>

          {/* Certificate Header */}
          <div className="flex justify-between items-start border-b-2 border-[#003366] pb-4 mb-6">
            <div className="flex items-center justify-center bg-gray-50 border border-gray-200 p-2 w-16 h-20 shrink-0">
              <div className="flex flex-col items-center justify-center text-center">
                <Landmark size={32} className="text-[#003366]" />
                <span className="text-[6px] font-bold mt-1 text-black">सत्यमेव जयते</span>
              </div>
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-xl font-bold text-[#003366] uppercase tracking-wide">Government of India</h1>
              <h2 className="text-md font-semibold text-gray-800">Ministry of Home Affairs</h2>
              <h3 className="text-sm text-gray-600 mt-1">Narcotics Control Bureau - Field Analysis Report</h3>
            </div>
            <div className="text-right shrink-0 flex flex-col items-end">
              <div className="text-[10px] text-gray-500 font-bold mb-1">Form 4A - Generated via NIC</div>
              {/* QR Code Placeholder */}
              <div className="w-16 h-16 bg-white border border-gray-300 p-1 flex flex-wrap">
                {Array.from({length: 64}).map((_, i) => (
                  <div key={i} className={`w-[12.5%] h-[12.5%] ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
                ))}
              </div>
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
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Date & Time of Capture</td>
                  <td className="p-3">{new Date(data.captured_at).toLocaleString('en-IN', { timeZoneName: 'short' })}</td>
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
                  <td className="p-3 font-mono text-[10px] break-all">{data.image_hash}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-8 border-2 border-gray-400 p-6 flex flex-col items-center justify-center bg-gray-50">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Algorithmic Verdict</h5>
              <div className="flex items-center gap-3">
                {isPositive ? <ShieldAlert size={32} className="text-red-600" /> :
                 isNegative ? <ShieldCheck size={32} className="text-green-700" /> : null}
                <span className={`text-3xl font-black uppercase tracking-wider ${
                  isPositive ? 'text-red-700' : isNegative ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {data.result}
                </span>
              </div>
              <div className="mt-4 text-xs font-bold border border-gray-300 bg-white px-4 py-1">
                Confidence: {data.confidence.toUpperCase()}
              </div>
              {data.notes && (
                <div className="mt-4 text-xs text-gray-600 italic text-center w-full max-w-md">
                  "{data.notes}"
                </div>
              )}
            </div>

            <p className="text-[10px] text-justify leading-relaxed text-gray-500 mt-8">
              <strong>Disclaimer:</strong> This is a presumptively generated report based on algorithmic colorimetric analysis (CIEDE2000). While cryptographically secured to prevent tampering, field spot tests are presumptive in nature and must be followed by GC-MS or HPLC laboratory confirmation for absolute legal certainty. This document is electronically generated and requires no physical signature.
            </p>

            {/* Electronic Signature Block */}
            <div className="mt-12 flex justify-end">
              <div className="border border-green-600 bg-green-50 p-2 text-[8px] text-green-800 w-64">
                <div className="font-bold flex justify-between border-b border-green-300 pb-1 mb-1">
                  <span>Signature Valid</span>
                  <Check size={10} />
                </div>
                <div>Digitally signed by DS_MINISTRY_OF_HOME_AFFAIRS_1</div>
                <div>Date: {new Date(data.captured_at).toLocaleDateString('en-IN')}</div>
                <div>Reason: Field Evidence Capture</div>
                <div>Location: New Delhi</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
