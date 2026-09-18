"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Landmark, Shield, FileText, Camera, LogOut, Database, UserCheck } from "lucide-react";

export default function DashboardPage() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/tests?limit=3")
      .then(res => res.json())
      .then(d => setTests(d.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-10">
      
      {/* Official Header */}
      <header className="bg-[#003366] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center bg-white p-1 rounded-sm w-8 h-10">
            <Landmark size={20} className="text-[#003366]" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wide">NCB Dashboard</h1>
            <h2 className="text-[10px] text-gray-300">OP-ID: NCB-OP-109</h2>
          </div>
        </div>
        <Link href="/" className="text-white hover:text-gray-200">
          <LogOut size={20} />
        </Link>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        
        {/* Welcome Alert */}
        <div className="bg-white border-l-4 border-[#138808] p-3 shadow-sm text-sm">
          <strong>Welcome, Officer.</strong> You have successfully authenticated via e-Pramaan.
        </div>

        {/* Services Grid (UMANG Style) */}
        <h3 className="font-bold text-[#003366] text-sm border-b border-gray-300 pb-1 pt-2">NCB Field Services</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Link href="/capture" className="bg-white p-4 border border-gray-200 shadow-sm rounded-sm flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors gap-2 h-28">
            <div className="bg-blue-50 p-3 rounded-full text-[#003366]">
              <Camera size={28} />
            </div>
            <span className="text-xs font-bold text-gray-700">Conduct Field Test</span>
          </Link>
          
          <Link href="/ledger" className="bg-white p-4 border border-gray-200 shadow-sm rounded-sm flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors gap-2 h-28">
            <div className="bg-green-50 p-3 rounded-full text-[#138808]">
              <Database size={28} />
            </div>
            <span className="text-xs font-bold text-gray-700">Evidence Ledger</span>
          </Link>

          <div className="bg-gray-100 opacity-70 p-4 border border-gray-200 shadow-sm rounded-sm flex flex-col items-center justify-center text-center gap-2 h-28 cursor-not-allowed">
            <div className="bg-gray-200 p-3 rounded-full text-gray-500">
              <FileText size={28} />
            </div>
            <span className="text-xs font-bold text-gray-700">Generate Report (WIP)</span>
          </div>

          <div className="bg-gray-100 opacity-70 p-4 border border-gray-200 shadow-sm rounded-sm flex flex-col items-center justify-center text-center gap-2 h-28 cursor-not-allowed">
            <div className="bg-gray-200 p-3 rounded-full text-gray-500">
              <UserCheck size={28} />
            </div>
            <span className="text-xs font-bold text-gray-700">My Profile</span>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="mt-6 bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
          <div className="bg-gray-100 p-3 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-[#003366] text-sm">Recent Uploads</h3>
            <Link href="/ledger" className="text-xs text-[#003366] font-bold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {tests.map(test => (
              <div key={test.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <div className="text-xs font-bold text-gray-800">{new Date(test.captured_at).toLocaleDateString('en-IN')}</div>
                  <div className="text-[10px] text-gray-500">{test.notes?.substring(0,25) || "Field Scan"}...</div>
                </div>
                <div className={`px-2 py-1 text-[10px] font-bold rounded-sm border ${
                  test.result === 'positive' ? 'bg-red-50 text-red-700 border-red-200' :
                  test.result === 'negative' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {test.result.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
