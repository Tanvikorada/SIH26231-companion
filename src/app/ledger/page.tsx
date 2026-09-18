"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Landmark, FileText, Download } from "lucide-react";

export default function LedgerPage() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/tests?limit=100")
      .then(res => res.json())
      .then(d => setTests(d.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-12">
      
      {/* Official Header */}
      <header className="bg-[#003366] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-gray-200 mr-2">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xs font-bold tracking-wide">Evidence Ledger</h1>
            <h2 className="text-[10px] text-gray-300">Historical Cryptographic Records</h2>
          </div>
        </div>
        <Landmark size={20} className="text-white opacity-50" />
      </header>

      <div className="max-w-4xl mx-auto p-4 mt-2">
        <div className="bg-white border border-gray-300 shadow-sm p-4 mb-4">
          <p className="text-[10px] text-gray-600 leading-relaxed text-justify">
            This digital locker contains immutable records of all field spot tests submitted to the NCB servers. 
            These records are maintained under the guidelines of the Ministry of Home Affairs and can be submitted 
            as documentary evidence under Section 65B of the Indian Evidence Act.
          </p>
        </div>

        <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
          <div className="bg-gray-100 p-3 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-[#003366] text-sm">Issued Certificates</h3>
            <div className="text-[10px] bg-white border border-gray-300 px-2 py-1 text-gray-600">Total: {tests.length} Records</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300 text-gray-700">
                  <th className="py-3 px-3 font-bold uppercase tracking-wider">Date & Time (IST)</th>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider">Operator ID</th>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider">Verdict</th>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider">Evidence Hash (SHA-256)</th>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tests.map((test, index) => (
                  <tr key={test.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="py-3 px-3 text-gray-800 whitespace-nowrap">{new Date(test.captured_at).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{test.operator_id}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 font-bold rounded-sm border text-[9px] uppercase ${
                        test.result === 'positive' ? 'text-red-700 bg-red-50 border-red-200' :
                        test.result === 'negative' ? 'text-green-700 bg-green-50 border-green-200' :
                        'text-yellow-700 bg-yellow-50 border-yellow-200'
                      }`}>
                        {test.result}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[9px] text-gray-500 font-mono max-w-[200px] truncate">
                      {test.image_hash}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Link href={`/result/${test.id}`} className="inline-flex items-center gap-1 text-[#003366] hover:underline font-bold text-[10px]">
                        <FileText size={12} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {tests.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">
                No issued certificates found in this locker.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
