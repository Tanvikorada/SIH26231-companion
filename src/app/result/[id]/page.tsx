"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, Landmark, ShieldCheck, ShieldAlert, Check } from "lucide-react";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [ver, setVer] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/v1/tests/${id}`)
      .then(res => res.json())
      .then(d => {
        if (d.error) { window.location.href = "/login?next=/result/" + id; return; }
        setData(d);
      })
      .catch(console.error);
    fetch("/api/v1/verify/" + id).then(r => r.json()).then(setVer).catch(() => {});
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
              <div className="text-[10px] text-gray-500 font-bold mb-1">Form 4A - NCB Digital Companion</div>
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
                  <td className="p-3 font-bold">{data.reagent ?? (data.notes || "").replace(/^.*Reagent: /, "") ?? "-"}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Date & Time of Capture</td>
                  <td className="p-3">{new Date(data.captured_at).toLocaleString('en-IN')} <span className="text-[10px] text-gray-500">(device clock)</span></td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Recorded by Server</td>
                  <td className="p-3">{new Date(data.recorded_at).toLocaleString('en-IN')} <span className="text-[10px] text-gray-500">(server clock, signed)</span></td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Operator ID</td>
                  <td className="p-3 font-mono">{data.operator_id}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">GPS Coordinates</td>
                  <td className="p-3">
                    {data.gps_lat != null ? `${data.gps_lat.toFixed(6)}, ${data.gps_lng.toFixed(6)}` : <span className="font-bold text-red-700">GPS NOT RECORDED - location could not be verified</span>}
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
                Confidence Level: {String(data.confidence ?? "unknown").toUpperCase()}{data.calibration_status && data.calibration_status !== "calibrated" ? ` (${data.calibration_status})` : ""}
              </div>
            </div>

            <p className="mt-6 border border-[#FF9933] bg-orange-50 p-3 text-xs font-bold text-gray-900">
              PRESUMPTIVE SCREENING RESULT ONLY. Colorimetric tests are non-specific and do not identify a substance.
              Not admissible as proof of a controlled substance; confirm by laboratory analysis (GC-MS / FTIR).
            </p>

            {data.image_path && (
              <div className="mt-6">
                <h5 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Evidence Image (as hashed)</h5>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.image_path} alt="Captured test evidence" className="max-h-64 border border-gray-300" />
              </div>
            )}

            <div className={`mt-8 border-2 p-3 text-xs ${ver?.status === "valid" ? "border-green-700 bg-green-50 text-green-900" : ver?.status === "invalid" ? "border-red-700 bg-red-50 text-red-900" : "border-gray-400 bg-gray-50 text-gray-800"}`}>
              <div className="font-bold flex items-center gap-2 border-b border-current pb-1 mb-2">
                {ver?.status === "valid" ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                {!ver ? "Verifying digital signature..." : ver.status === "valid" ? "Digital signature verified (Ed25519, server-signed, chained)" : ver.status === "invalid" ? "SIGNATURE CHECK FAILED - record may have been altered" : "Unsigned legacy record (not tamper-evident)"}
              </div>
              {data.record_hash && <div className="font-mono break-all">Record hash: {data.record_hash}</div>}
              <div className="mt-1">Sequence #{data.seq} - <a className="underline font-bold" href={"/verify/" + data.id}>Open public verification page</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
