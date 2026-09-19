"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, Database, ShieldAlert, CheckCircle, Activity, Info, Search, AlertTriangle, ExternalLink } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, inconclusive: 0 });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/dashboard/stats").then(r => r.json()).then(setStats).catch(() => {});
    fetch("/api/v1/alerts").then(r => r.json()).then(data => {
      if (data && data.alerts) setAlerts(data.alerts);
      setAlertsLoading(false);
    }).catch(() => setAlertsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Official GIGW Header Strip */}
      <div className="bg-[#003366] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-xs">
          <div className="flex gap-4">
            <span className="font-semibold tracking-wide">GOVERNMENT OF INDIA</span>
            <span className="hidden sm:inline opacity-80 border-l border-white/20 pl-4">Ministry of Home Affairs</span>
          </div>
          <div className="flex gap-3 font-semibold">
            <button aria-label="Decrease Text Size" className="hover:underline">A-</button>
            <button aria-label="Normal Text Size" className="hover:underline">A</button>
            <button aria-label="Increase Text Size" className="hover:underline">A+</button>
            <span className="border-l border-white/20 pl-3">English</span>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 bg-gray-100 border border-gray-300 flex items-center justify-center relative overflow-hidden p-1">
               {/* Minimal CSS representation of Ashoka Chakra instead of an image to keep it fully local and static */}
               <div className="w-8 h-8 rounded-full border-[3px] border-[#003366] flex items-center justify-center">
                 <div className="w-1 h-full bg-[#003366] absolute rotate-0"></div>
                 <div className="w-1 h-full bg-[#003366] absolute rotate-45"></div>
                 <div className="w-1 h-full bg-[#003366] absolute rotate-90"></div>
                 <div className="w-1 h-full bg-[#003366] absolute rotate-[135deg]"></div>
                 <div className="w-3 h-3 bg-white rounded-full absolute z-10"></div>
               </div>
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#003366] tracking-tight uppercase">Narcotics Control Bureau</h1>
              <p className="text-sm font-semibold text-gray-600">Optical Analysis System (O.A.S.) - Core Dashboard</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span> System Online
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="text-sm text-gray-500 flex items-center gap-2 border-b border-gray-200 pb-2">
          <span>Home</span> &gt; <span className="font-bold text-[#003366]">Operator Dashboard</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Actions */}
          <div className="xl:col-span-1 space-y-6">
            
            <div className="bg-white border border-[#003366] shadow-sm">
              <div className="bg-[#003366] text-white px-4 py-3 font-bold uppercase tracking-wide text-sm flex items-center justify-between">
                Field Operations
              </div>
              <div className="p-4 space-y-4">
                <Link href="/capture" className="w-full bg-[#FF9933] hover:bg-[#e68a2e] text-white font-bold py-3 px-4 flex items-center justify-center gap-2 shadow-sm transition-colors border border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933]">
                  <Camera className="w-5 h-5" />
                  Initiate New Optical Scan
                </Link>
                <div className="text-xs text-gray-600 bg-orange-50 p-3 border border-orange-200 flex gap-2 items-start">
                  <Info className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                  <p>Launch the CIEDE2000 calibration engine to scan physical reagent samples in the field. Ensure adequate lighting.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 font-bold uppercase tracking-wide text-sm text-[#003366]">
                Secure Records
              </div>
              <div className="p-4">
                <Link href="/ledger" className="w-full bg-white border-2 border-[#003366] text-[#003366] hover:bg-blue-50 font-bold py-3 px-4 flex items-center justify-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#003366]">
                  <Database className="w-5 h-5" />
                  Access Cryptographic Ledger
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Telemetry Tables */}
          <div className="xl:col-span-2 space-y-6">
            
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 font-bold uppercase tracking-wide text-sm text-[#003366] flex items-center gap-2">
                <Activity className="w-4 h-4" /> Live National Telemetry
              </div>
              
              {/* Dense Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#003366] text-white text-xs uppercase tracking-wider">
                      <th className="p-3 font-semibold border-r border-[#002244]">Metric</th>
                      <th className="p-3 font-semibold border-r border-[#002244]">Total Count</th>
                      <th className="p-3 font-semibold">Status Indicator</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-800 border-r border-gray-200">Total Forensic Tests Executed</td>
                      <td className="p-3 font-mono text-lg text-[#003366] border-r border-gray-200">{stats.total}</td>
                      <td className="p-3 text-gray-500 text-xs">Active Logging</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-red-50 hover:bg-red-100">
                      <td className="p-3 font-bold text-red-900 border-r border-red-200 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-600" /> Positive Detections
                      </td>
                      <td className="p-3 font-mono text-lg text-red-700 border-r border-red-200 font-bold">{stats.positive}</td>
                      <td className="p-3 text-red-600 text-xs font-bold uppercase">Alert State</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-green-50 hover:bg-green-100">
                      <td className="p-3 font-bold text-green-900 border-r border-green-200 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" /> Negative Detections
                      </td>
                      <td className="p-3 font-mono text-lg text-green-700 border-r border-green-200">{stats.negative}</td>
                      <td className="p-3 text-green-600 text-xs uppercase">Cleared</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-700 border-r border-gray-200">Inconclusive Scans</td>
                      <td className="p-3 font-mono text-lg text-gray-600 border-r border-gray-200">{stats.inconclusive}</td>
                      <td className="p-3 text-gray-500 text-xs">Requires Manual Review</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* Live Alerts Section */}
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 font-bold uppercase tracking-wide text-sm text-[#003366] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF9933]" /> Live Threat Alerts & Advisories
            </div>
            <div className="relative">
              <input type="text" placeholder="Filter alerts..." className="text-xs border border-gray-300 px-3 py-1.5 focus:outline-none focus:border-[#003366]" />
              <Search className="w-3 h-3 text-gray-400 absolute right-2 top-2" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b border-gray-300 uppercase">
                  <th className="p-3 font-bold border-r border-gray-200 w-24">Date</th>
                  <th className="p-3 font-bold border-r border-gray-200 w-32">Source</th>
                  <th className="p-3 font-bold border-r border-gray-200 w-32">Substance</th>
                  <th className="p-3 font-bold border-r border-gray-200">Summary</th>
                  <th className="p-3 font-bold w-24 text-center">Threat Lvl</th>
                </tr>
              </thead>
              <tbody>
                {alertsLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading threat intelligence feed...</td></tr>
                ) : alerts.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No active alerts at this time.</td></tr>
                ) : (
                  alerts.map((alert, i) => (
                    <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-600 border-r border-gray-200">
                        {new Date(alert.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-bold text-[#003366] border-r border-gray-200">
                        {alert.source}
                      </td>
                      <td className="p-3 font-bold text-gray-800 border-r border-gray-200">
                        {alert.substance || "UNKNOWN"}
                      </td>
                      <td className="p-3 text-gray-600 border-r border-gray-200">
                        <span className="line-clamp-2" title={alert.details}>{alert.summary}</span>
                        {alert.url && (
                          <a href={alert.url} target="_blank" rel="noreferrer" className="text-[#003366] inline-flex items-center gap-1 mt-1 hover:underline">
                            Source Link <ExternalLink size={10} />
                          </a>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 font-bold tracking-wider rounded-sm text-[10px] ${alert.threatLevel === 'HIGH' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}>
                          {alert.threatLevel || 'ELEVATED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-xs text-gray-500 border-t border-gray-200 pt-4 mt-8 flex justify-between">
          <p>Designed strictly conforming to GIGW 3.0 standards.</p>
          <p>National Informatics Centre (NIC)</p>
        </div>
      </main>
    </div>
  );
}
