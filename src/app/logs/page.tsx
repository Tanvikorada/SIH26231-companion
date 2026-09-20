"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

const PAGE = 20;

export default function LogsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [result, setResult] = useState("");
  const [operator, setOperator] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (off: number) => {
    setLoading(true);
    setError("");
    const sp = new URLSearchParams({ limit: String(PAGE), offset: String(off) });
    if (q.trim()) sp.set("q", q.trim());
    if (result) sp.set("result", result);
    if (operator.trim()) sp.set("operator", operator.trim());
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    try {
      const res = await fetch(`/api/v1/tests?${sp}`);
      if (res.status === 401) { window.location.href = "/login?next=/logs"; return; }
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setTests(d.data);
      setTotal(d.total);
      setOffset(off);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, [q, result, operator, from, to]);

  useEffect(() => { load(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const field = "border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]";

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-12">
      <header className="bg-[#003366] text-white p-4 flex items-center gap-3 sticky top-0 z-50">
        <Link href="/dashboard" aria-label="Back to dashboard" className="hover:text-gray-300"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wide">Test Register</h1>
          <p className="text-[11px] text-gray-300">Searchable log of all field tests</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); load(0); }} className="bg-white border border-gray-300 p-4 grid gap-3 md:grid-cols-6">
          <div className="md:col-span-3 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search records" placeholder="Search record ID, hash, operator, reagent, notes" className={`${field} w-full pl-9`} />
          </div>
          <select value={result} onChange={(e) => setResult(e.target.value)} aria-label="Result" className={field}>
            <option value="">All results</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="inconclusive">Inconclusive</option>
          </select>
          <input value={operator} onChange={(e) => setOperator(e.target.value)} aria-label="Operator ID" placeholder="Operator ID" className={field} />
          <button className="bg-[#003366] text-white text-sm font-bold px-4 py-2">SEARCH</button>
          <label className="text-xs font-bold text-gray-700 md:col-span-2 flex items-center gap-2">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${field} flex-1`} /></label>
          <label className="text-xs font-bold text-gray-700 md:col-span-2 flex items-center gap-2">To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`${field} flex-1`} /></label>
          <button type="button" onClick={() => { setQ(""); setResult(""); setOperator(""); setFrom(""); setTo(""); setTimeout(() => load(0), 0); }} className="border border-gray-400 text-sm font-bold px-4 py-2 md:col-start-6">CLEAR</button>
        </form>

        {error && <p role="alert" className="border border-red-300 bg-red-50 text-red-800 text-sm font-bold p-3">{error}</p>}

        <div className="bg-white border border-gray-300 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>{["#", "Captured", "Operator", "Reagent", "Result", "Confidence", "Signed", "Hash"].map((h) => <th key={h} className="p-2 font-bold uppercase tracking-wide text-gray-700">{h}</th>)}</tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} className="border-b border-gray-200 hover:bg-blue-50">
                  <td className="p-2 font-mono">{t.seq}</td>
                  <td className="p-2 whitespace-nowrap"><Link className="text-[#003366] underline" href={`/result/${t.id}`}>{new Date(t.captured_at).toLocaleString("en-IN")}</Link></td>
                  <td className="p-2 font-mono">{t.operator_id}</td>
                  <td className="p-2">{t.reagent ?? "-"}</td>
                  <td className={`p-2 font-bold uppercase ${t.result === "positive" ? "text-red-700" : t.result === "negative" ? "text-green-700" : "text-gray-700"}`}>{t.result}</td>
                  <td className="p-2 uppercase">{t.confidence}</td>
                  <td className="p-2">{t.signature ? <Link className="text-green-800 underline font-bold" href={`/verify/${t.id}`}>Verify</Link> : <span className="text-gray-500">Legacy</span>}</td>
                  <td className="p-2 font-mono">{t.image_hash.slice(0, 12)}...</td>
                </tr>
              ))}
              {!loading && tests.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-600">No records match.</td></tr>}
              {loading && <tr><td colSpan={8} className="p-6 text-center text-gray-600">Loading...</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-700">
          <span>{total} record{total === 1 ? "" : "s"}{total > 0 && ` - showing ${offset + 1}-${Math.min(offset + PAGE, total)}`}</span>
          <span className="flex gap-2">
            <button disabled={offset === 0 || loading} onClick={() => load(Math.max(0, offset - PAGE))} className="border border-gray-400 bg-white px-3 py-1 font-bold disabled:opacity-40">PREV</button>
            <button disabled={offset + PAGE >= total || loading} onClick={() => load(offset + PAGE)} className="border border-gray-400 bg-white px-3 py-1 font-bold disabled:opacity-40">NEXT</button>
          </span>
        </div>
      </main>
    </div>
  );
}
