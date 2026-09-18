import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { StampBadge } from "@/components/ui/StampBadge";

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ result?: string; operator_id?: string; page?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const result = resolvedSearchParams.result;
  const operator_id = resolvedSearchParams.operator_id;
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = 20;

  const where: any = {};
  if (result) where.result = result;
  if (operator_id) where.operator_id = operator_id;

  const tests = await prisma.test.findMany({
    where,
    orderBy: { captured_at: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-12">
      <header className="bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <Link href="/" className="flex items-center text-[var(--color-navy)] font-medium active:opacity-70">
          <ArrowLeft size={20} className="mr-1" /> Dashboard
        </Link>
        <div className="flex items-center text-[var(--color-brass)] font-bold text-xs uppercase tracking-widest">
          <ShieldCheck size={16} className="mr-1" /> Case Logs
        </div>
      </header>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-4 mt-4">
        <form className="flex flex-col md:flex-row gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <input type="text" name="operator_id" placeholder="Filter by Operator ID..." defaultValue={operator_id} className="border border-gray-200 p-3 rounded-xl flex-1 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] transition-all" />
          <div className="flex gap-3">
            <select name="result" defaultValue={result} className="border border-gray-200 p-3 rounded-xl flex-1 md:w-48 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] transition-all">
              <option value="">All Results</option>
              <option value="positive">Positive Only</option>
              <option value="negative">Negative Only</option>
              <option value="inconclusive">Inconclusive Only</option>
            </select>
            <button type="submit" className="bg-[var(--color-navy)] text-white px-5 rounded-xl flex items-center justify-center active:scale-95 transition-transform hover:bg-[var(--color-navy-dark)]">
              <Search size={18} />
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                  <th className="p-4 pl-6">ID / Date</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Result</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tests.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-mono text-xs text-gray-400 mb-0.5">{t.id.split('-')[0]}</p>
                      <p className="text-sm font-medium text-gray-900">{t.captured_at.toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{t.operator_id}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-[150px] truncate" title={t.notes || "N/A"}>
                      {t.notes || <span className="text-gray-400 italic">No notes</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md ${t.result === 'positive' ? 'bg-red-50 text-red-700 border border-red-100' : t.result === 'negative' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                        {t.result}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link href={`/logs/${t.id}`} className="inline-block bg-[var(--color-navy)] text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all">
                        Dossier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tests.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
              <Search size={32} className="mb-3 opacity-20" />
              <p>No matching case records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
