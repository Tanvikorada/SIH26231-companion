import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, User, ShieldCheck } from "lucide-react";
import { StampBadge } from "@/components/ui/StampBadge";

export default async function RecordDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id } });

  if (!test) return <div>Record not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-12">
      <header className="bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/logs" className="flex items-center text-[var(--color-navy)] font-medium active:opacity-70">
          <ArrowLeft size={20} className="mr-1" /> Case Logs
        </Link>
        <span className="text-xs font-mono text-gray-400">Dossier</span>
      </header>

      <div className="flex-1 p-4 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-4">
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[var(--color-navy)] text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="font-bold text-lg tracking-wide">Official Record</h1>
                <p className="text-xs font-mono text-blue-200 mt-1">{test.id}</p>
              </div>
              <ShieldCheck size={28} className="text-[var(--color-brass)] opacity-80" />
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1"><User size={12}/> Operator</p>
                    <p className="font-medium text-gray-900">{test.operator_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1"><Clock size={12}/> Timestamps</p>
                    <div className="text-sm text-gray-700">
                      <p><span className="text-gray-500 w-16 inline-block">Device:</span> {test.captured_at.toLocaleString()}</p>
                      <p><span className="text-gray-500 w-16 inline-block">Server:</span> {test.recorded_at.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1"><MapPin size={12}/> Location & Notes</p>
                    {test.gps_lat ? (
                      <a href={`https://www.google.com/maps?q=${test.gps_lat},${test.gps_lng}`} target="_blank" className="text-sm font-mono text-blue-600 hover:underline">
                        {test.gps_lat.toFixed(6)}, {test.gps_lng?.toFixed(6)}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No GPS coordinates available</p>
                    )}
                    {test.notes && <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">{test.notes}</p>}
                  </div>
                </div>
                
                <div className="shrink-0 bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center w-full md:w-auto shadow-inner">
                  <StampBadge status={test.result as any} />
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-500 text-center">Confidence: <span className="text-gray-900">{test.confidence}</span></p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="font-bold text-gray-900 mb-4 tracking-tight">Cryptographic Evidence</h3>
                
                <div className="bg-gray-900 p-4 rounded-xl text-gray-300 font-mono text-xs break-all shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck size={48} />
                  </div>
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-700 pb-2">SHA-256 Image Hash</span>
                  {test.image_hash}
                </div>

                <div className="mt-6">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Original Image</span>
                  <img src={test.image_path} alt="Captured Test" className="w-full max-w-sm rounded-xl shadow-md border border-gray-200 bg-white" />
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
