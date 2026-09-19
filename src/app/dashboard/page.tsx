"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  Database,
  ShieldAlert,
  CheckCircle,
  Activity,
  Info,
  Search,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { StateEmblem } from "@/components/ui/StateEmblem";
import { StampBadge } from "@/components/ui/StampBadge";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, inconclusive: 0 });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchAlerts = () => {
    setAlertsLoading(true);
    fetch("/api/v1/alerts")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.alerts) setAlerts(data.alerts);
        setAlertsLoading(false);
      })
      .catch(() => setAlertsLoading(false));
  };

  useEffect(() => {
    fetch("/api/v1/dashboard/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesLevel =
      filterLevel === "ALL" || (alert.threatLevel && alert.threatLevel.toUpperCase() === filterLevel);
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (alert.id && alert.id.toLowerCase().includes(q)) ||
      (alert.substance && alert.substance.toLowerCase().includes(q)) ||
      (alert.source && alert.source.toLowerCase().includes(q)) ||
      (alert.region && alert.region.toLowerCase().includes(q)) ||
      (alert.summary && alert.summary.toLowerCase().includes(q));
    return matchesLevel && matchesQuery;
  });

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
            <StateEmblem size={44} variant="navy" />
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
          {/* Bilingual UX4G / GIGW 3.0 Header */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF9933] shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-600">राष्ट्रीय मादक पदार्थ चेतावनी प्रणाली</div>
                <div className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">
                  National Drug Threat Advisories & Early Warning System
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold border border-green-300 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                FEED ACTIVE
              </span>
            </div>
          </div>

          {/* Controls Bar: Filters & Refresh */}
          <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Threat Filter:</span>
              {(["ALL", "CRITICAL", "HIGH", "ELEVATED"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-3 py-1 text-xs font-bold font-mono transition-colors border ${
                    filterLevel === lvl
                      ? "bg-[#003366] text-white border-[#003366]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter substance, agency, ID..."
                  className="text-xs border border-gray-300 px-3 py-1.5 pr-7 w-64 focus:outline-none focus:border-[#003366] bg-white"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2" />
              </div>

              <button
                type="button"
                onClick={fetchAlerts}
                disabled={alertsLoading}
                className="bg-white hover:bg-blue-50 text-[#003366] border border-[#003366] px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${alertsLoading ? "animate-spin" : ""}`} />
                Refresh Feed
              </button>
            </div>
          </div>

          {/* 5-Column Dense Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b border-gray-300 uppercase">
                  <th className="p-3 font-bold border-r border-gray-200 w-44">Advisory ID & Date (IST)</th>
                  <th className="p-3 font-bold border-r border-gray-200 w-32 text-center">Threat Level</th>
                  <th className="p-3 font-bold border-r border-gray-200 w-48">Substance & Classification</th>
                  <th className="p-3 font-bold border-r border-gray-200 w-48">Originating Agency & Region</th>
                  <th className="p-3 font-bold">Advisory Summary & Reagent Marker</th>
                </tr>
              </thead>
              <tbody>
                {alertsLoading && alerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Loading threat intelligence feed...
                    </td>
                  </tr>
                ) : filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No active alerts match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert, i) => (
                    <tr key={alert.id || i} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 border-r border-gray-200">
                        <div className="font-mono font-bold text-xs text-[#003366]">{alert.id}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {alert.publishedAt ? new Date(alert.publishedAt).toLocaleDateString("en-IN") : "N/A"}
                        </div>
                      </td>
                      <td className="p-3 text-center border-r border-gray-200">
                        <StampBadge
                          size="sm"
                          variant={
                            alert.threatLevel === "CRITICAL"
                              ? "danger"
                              : alert.threatLevel === "HIGH"
                              ? "saffron"
                              : alert.threatLevel === "ELEVATED"
                              ? "brass"
                              : "navy"
                          }
                          text={alert.threatLevel || "ADVISORY"}
                        />
                      </td>
                      <td className="p-3 border-r border-gray-200">
                        <div className="font-bold text-gray-900 text-xs">{alert.substance || "UNKNOWN"}</div>
                        {alert.category && (
                          <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-300 uppercase">
                            {alert.category}
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-r border-gray-200">
                        <div className="font-semibold text-[#003366] text-xs">{alert.source}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{alert.region || "Global"}</div>
                      </td>
                      <td className="p-3">
                        <p className="text-xs text-gray-700 leading-snug">{alert.summary}</p>
                        {alert.reagentGuidance && (
                          <div className="mt-1.5 p-1.5 bg-blue-50 border border-blue-200 text-[11px] text-[#003366]">
                            <span className="font-bold">Field Reagent:</span> {alert.reagentGuidance.reagent} —{" "}
                            <span className="italic">{alert.reagentGuidance.expectedReaction}</span>
                          </div>
                        )}
                        {alert.url && (
                          <a
                            href={alert.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#003366] inline-flex items-center gap-1 mt-1 text-[11px] hover:underline font-semibold"
                          >
                            Official Bulletin <ExternalLink size={10} />
                          </a>
                        )}
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
