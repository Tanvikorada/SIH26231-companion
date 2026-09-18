import React from "react";
import Link from "next/link";
import { Camera, List, ShieldCheck, Activity, MapPin, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const total = await prisma.test.count();
  const positive = await prisma.test.count({ where: { result: "positive" } });
  const negative = await prisma.test.count({ where: { result: "negative" } });
  const inconclusive = await prisma.test.count({ where: { result: "inconclusive" } });

  const recentTests = await prisma.test.findMany({
    take: 3,
    orderBy: { captured_at: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[var(--color-navy)] text-white pt-12 pb-8 px-6 shadow-md rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <ShieldCheck size={200} className="text-white transform translate-x-1/4 -translate-y-1/4" />
        </div>
        <div className="relative z-10 flex flex-col gap-1">
          <p className="text-[var(--color-brass)] text-xs font-bold tracking-widest uppercase">SatyaLabel Digital Companion</p>
          <h1 className="text-3xl font-bold tracking-tight">Field Testing</h1>
          <p className="text-blue-100 text-sm mt-1 opacity-90">Officer: OFC-104 • Active Shift</p>
        </div>
      </header>

      <div className="flex-1 px-6 -mt-6 z-20 flex flex-col gap-6 pb-12">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/capture" className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-lg border border-gray-100 active:scale-95 transition-transform group hover:border-[var(--color-navy)]">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[var(--color-navy)] flex items-center justify-center group-hover:bg-[var(--color-navy)] group-hover:text-white transition-colors">
              <Camera size={28} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">New Test</span>
          </Link>
          <Link href="/logs" className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-lg border border-gray-100 active:scale-95 transition-transform group hover:border-[var(--color-brass)]">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[var(--color-brass)] flex items-center justify-center group-hover:bg-[var(--color-brass)] group-hover:text-white transition-colors">
              <List size={28} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Case Logs</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Activity size={18} className="text-[var(--color-brass)]" /> Shift Summary
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center divide-x divide-gray-100">
            <div className="px-2">
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Total</p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-bold text-red-600">{positive}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Pos</p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-bold text-green-600">{negative}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Neg</p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-bold text-yellow-600">{inconclusive}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Inc</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="font-bold text-gray-800 text-lg">Recent Scans</h2>
            <Link href="/logs" className="text-xs font-bold text-[var(--color-navy)] uppercase tracking-wider hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentTests.map((t) => (
              <Link href={`/logs/${t.id}`} key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-12 rounded-full ${t.result === 'positive' ? 'bg-red-500' : t.result === 'negative' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="font-mono text-xs text-gray-500 mb-1">{t.id.split('-')[0]}</p>
                    <p className="font-semibold text-gray-900 text-sm capitalize">{t.result} Result</p>
                    {t.notes && (
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin size={10} className="mr-1" /> {t.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-400">{t.captured_at.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </Link>
            ))}
            {recentTests.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                No tests logged this shift.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
