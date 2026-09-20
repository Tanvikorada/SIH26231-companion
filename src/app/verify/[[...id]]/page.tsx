"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Landmark, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

const LABELS: Record<string, string> = {
  signature: "Digital signature (Ed25519) matches the record",
  record_hash: "Record contents match the signed hash",
  image_hash: "Stored evidence image matches its SHA-256 hash",
};

export default function VerifyPage({ params }: { params: Promise<{ id?: string[] }> }) {
  const { id: idParts } = use(params);
  const initial = idParts?.[0] ?? "";
  const [query, setQuery] = useState(initial);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setBusy(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/v1/verify/${encodeURIComponent(q.trim())}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Verification failed");
      setData(d);
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (initial) run(initial);
  }, [initial, run]);

  const status = data?.status as "valid" | "invalid" | "unsigned" | undefined;
  const tone = status === "valid" ? "border-green-700 bg-green-50 text-green-900" : status === "invalid" ? "border-red-700 bg-red-50 text-red-900" : "border-gray-400 bg-gray-50 text-gray-900";
  const Icon = status === "valid" ? ShieldCheck : status === "invalid" ? ShieldAlert : ShieldQuestion;
  const r = data?.record;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#003366] text-white p-4 flex items-center gap-3">
        <Landmark size={24} />
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wide">Record Verification</h1>
          <p className="text-[11px] text-gray-300">Public check of a field-test record. No sign-in required.</p>
        </div>
        <Link href="/" className="ml-auto text-xs underline">Home</Link>
      </header>
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); run(query); }} className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Record ID or record hash" aria-label="Record ID or record hash" className="flex-1 border border-gray-400 px-3 py-3 text-sm font-mono focus:outline-none focus:border-[#003366]" />
          <button disabled={busy} className="bg-[#003366] text-white px-5 text-sm font-bold disabled:opacity-60">VERIFY</button>
        </form>
        {error && <p role="alert" className="border border-red-300 bg-red-50 text-red-800 text-sm font-bold p-3">{error}</p>}
        {data && r && (
          <section className={`border-2 p-4 ${tone}`}>
            <h2 className="flex items-center gap-2 text-lg font-black uppercase">
              <Icon size={22} />
              {status === "valid" ? "Record is authentic and unaltered" : status === "invalid" ? "Record FAILED verification" : "Unsigned legacy record"}
            </h2>
            {data.message && <p className="text-sm mt-2">{data.message}</p>}
            {data.checks && (
              <ul className="mt-3 space-y-1 text-sm">
                {Object.keys(LABELS).map((k) => (
                  <li key={k}>{data.checks[k] ? "PASS" : "FAIL"} - {LABELS[k]}</li>
                ))}
                <li>{data.checks.chain_link ? "PASS" : "FAIL"} - Chain link: {data.checks.chain_note}</li>
              </ul>
            )}
            <table className="w-full text-xs mt-4 border border-gray-300 bg-white text-gray-900">
              <tbody>
                {[
                  ["Sequence", r.seq],
                  ["Operator", r.operator_id],
                  ["Result (presumptive)", r.result],
                  ["Confidence", r.confidence],
                  ["Captured (device clock)", new Date(r.captured_at).toLocaleString("en-IN")],
                  ["Recorded (server clock)", new Date(r.recorded_at).toLocaleString("en-IN")],
                  ["GPS", r.gps_lat != null ? `${r.gps_lat.toFixed(6)}, ${r.gps_lng.toFixed(6)}` : "Not recorded"],
                  ["Image SHA-256", r.image_hash],
                  ["Record hash", r.record_hash ?? "-"],
                  ["Previous hash", r.prev_hash ?? "-"],
                ].map(([k, v]) => (
                  <tr key={String(k)} className="border-b border-gray-200">
                    <td className="p-2 font-bold bg-gray-50 w-40 align-top">{k}</td>
                    <td className="p-2 font-mono break-all">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] mt-3">Presumptive field-test result. Does not replace laboratory confirmatory testing.</p>
          </section>
        )}
      </main>
    </div>
  );
}
