const fs = require("fs");
const content = `import React from "react";
import { prisma } from "@/lib/prisma";
import { StampBadge } from "@/components/ui/StampBadge";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertTriangle, ChevronRight, Fingerprint } from "lucide-react";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center text-[var(--color-navy)] font-medium active:opacity-70">
          <ArrowLeft size={20} className="mr-1" /> Dashboard
        </Link>
        <span className="text-xs font-mono text-gray-400">ID: {id.split("-")[0]}</span>
      </header>
      
      <div className="flex-1 p-4 flex flex-col items-center">
        <div className="w-full max-w-md mt-4 space-y-6">
          <ResultContent id={id} />
        </div>
      </div>
    </div>
  );
}

async function ResultContent({ id }: { id: string }) {
  const test = await prisma.test.findUnique({ where: { id } });

  if (!test) {
    return <p className="text-center mt-10 text-gray-500">Test record not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[var(--color-navy)] text-white text-center py-3 text-xs font-bold tracking-widest uppercase">
          Field Test Analysis
        </div>
        
        <div className="p-8 flex flex-col items-center gap-6">
          {test.calibration_status.startsWith("calibrated") ? (
            <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center shadow-inner border border-green-100">
              <CheckCircle size={14} className="mr-1.5" /> CIEDE2000 Calibrated
            </div>
          ) : (
            <div className="bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center shadow-inner border border-red-100">
              <AlertTriangle size={14} className="mr-1.5" /> Calibration Failed
            </div>
          )}

          <div className="py-8 w-full flex justify-center bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
            <StampBadge status={test.result as any} />
          </div>

          <div className="text-center space-y-1">
            <p className="text-gray-500 text-sm font-medium">Algorithmic Confidence</p>
            <p className="text-xl font-bold text-[var(--color-navy)] capitalize tracking-wide">{test.confidence}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-5 rounded-r-xl shadow-sm">
        <div className="flex gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" />
          <div className="text-sm space-y-1">
            <p className="font-bold">Presumptive Result Only</p>
            <p className="opacity-90">This field-test algorithm provides presumptive analysis and does not replace laboratory confirmatory testing.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Fingerprint size={18} className="text-[var(--color-brass)]" /> Chain of Custody
        </h3>
        
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Image SHA-256 Hash</p>
          <p className="text-xs font-mono text-gray-700 break-all">{test.image_hash}</p>
        </div>

        <Link href={\`/logs/\${test.id}\`} className="flex items-center justify-between w-full py-4 px-2 text-[var(--color-navy)] hover:opacity-70 transition-opacity">
          <span className="font-bold text-sm">View Full Tamper-Evident Dossier</span>
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}
`;
fs.writeFileSync("src/app/result/[id]/page.tsx", content);
