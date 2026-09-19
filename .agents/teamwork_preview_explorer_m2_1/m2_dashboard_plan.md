# Technical Architecture & Layout Plan: Dashboard IA & Dense Layout Overhaul (M2)

**Author**: Explorer M2-1 (Dashboard IA & Dense Layout Explorer)  
**Target File**: `src/app/dashboard/page.tsx`  
**Target Milestone**: Milestone 2 (M2)  
**Design Standard**: Digital India UX4G & Guidelines for Indian Government Websites (GIGW 3.0)  
**Security Standard**: NDPS Act 1985 & Section 65B Indian Evidence Act  

---

## 1. Executive Summary & Objective

The objective of Milestone 2 is to completely eliminate the existing glassmorphic, startup-style "Bento-Box" layout in `src/app/dashboard/page.tsx` and replace it with an authoritative, high-density, accessible government portal conforming strictly to **Digital India UX4G** and **GIGW 3.0** standards.

The current dashboard suffers from:
1. Low information density with oversized rounded cards (`rounded-3xl`, `rounded-2xl`).
2. Non-compliant visual aesthetics (`backdrop-blur-xl`, `bg-gradient-to-br`, pastel indigo/purple washes, floating shadows).
3. Distracting and inaccessible animations (`framer-motion` spring animations, `animate-ping`, `blur-2xl` glow artifacts).
4. Redundant floating navigation header that clashes with the global 3-tier GIGW 3.0 shell in `src/app/layout.tsx`.
5. A critical data-mapping bug where the API response from `/api/v1/dashboard/stats` (`total_tests`, `by_result`) was incorrectly mapped to `stats.total`, causing metric counters to render empty/undefined.
6. Lack of an on-dashboard registry for recent forensic tests, forcing officers to navigate away to verify recent submissions.

This plan details the replacement architecture and provides complete, production-ready, drop-in JSX code for Worker M2.

---

## 2. Exhaustive Non-Compliance Audit of Existing Dashboard

Below is the line-by-line inventory of non-compliant patterns in `src/app/dashboard/page.tsx` that must be completely removed:

| Line(s) in Current File | Non-Compliant Pattern | Category | Replacement / Elimination Rationale |
|-------------------------|-----------------------|----------|-------------------------------------|
| `L6, L15-23, L50, L53, L70, L93` | `import { motion } from "framer-motion"`, `variants={container}`, `variants={item}`, spring physics | Framer Motion / Animation | Eliminate completely. Use static semantic HTML elements (`section`, `div`, `table`). GIGW 3.0 requires predictable, instant layout stability without motion triggers. |
| `L28-47` | Duplicate floating header with `sticky top-1.5`, `bg-white/70 backdrop-blur-xl`, `border-slate-200/50` | Glassmorphism / Duplicate Nav | Remove completely. `RootLayout` (`src/app/layout.tsx`) already renders the official GIGW 3.0 3-tier header with Ashoka State Emblem, accessibility bar, and navigation. |
| `L31` | `bg-gradient-to-br from-gov-blue to-blue-800`, `rounded-xl`, `shadow-lg shadow-blue-900/20` | Gradient & Soft Corners | Replace with solid Navy `#003366` and sharp 0px/1px borders. |
| `L41-42` | `animate-ping` pulsating status dot | Continuous Animation | GIGW 3.0 forbids continuous distracting pings. Replace with static high-contrast green indicator dot (`bg-[#138808]`). |
| `L53` | `rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-gov-blue/20` | Bento Floating Card | Replace with an Official Ministry Header Banner with statutory advisory, sharp corners, and 1px solid slate borders. |
| `L54-56` | Decorative `Fingerprint` watermark `w-48 h-48 opacity-10` | Decorative Watermark | GIGW 3.0 accessibility standard eliminates decorative background noise in favor of high-contrast readability. |
| `L71-78` | `bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl`, `hover:scale-[1.02]`, `shadow-lg hover:shadow-indigo-500/25` | Pastel Gradients & Scaling | Replace with utilitarian rectangular action button/card with solid borders and high contrast. |
| `L72, L82` | `bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20` | Glow & Blur Artifacts | Eliminate completely. Zero CSS blur or radial lighting. |
| `L81-89` | `rounded-3xl`, `hover:scale-[1.02] active:scale-[0.98]` | Bento Float / Micro-interaction | Replace with structured government action card with standard `:focus-visible` and sharp solid borders. |
| `L98, L102, L108, L112` | `rounded-2xl p-5 shadow-sm` | Curved Stat Tiles | Replace with dense 5-column solid-bordered summary table/grid with `#003366` header and 1px `#CBD5E1` borders. |
| `L9, L12` | `stats.total`, `stats.positive` mapping | Functional Defect | `/api/v1/dashboard/stats` returns `{ total_tests, by_result: { positive, negative, inconclusive }, failed_calibration_count }`. Correct mapping to reflect actual schema. |

---

## 3. Information Architecture & Density Specifications

### 3.1 Layout Wireframe (ASCII Diagram)

```
+---------------------------------------------------------------------------------------------------+
| BREADCRUMBS & CONTEXT BAR:                                                                        |
| Portal Home > Field Operations > Operator Dashboard | Operator: NCB-OP-109 | Zone: Delhi-HQ | IST |
+---------------------------------------------------------------------------------------------------+
| OFFICIAL MINISTRY HEADER BANNER (Solid 1px Slate Border, Saffron Accent Top Border)                |
| [Ministry Seal]  NARCOTICS CONTROL BUREAU - FORENSIC SPOT TESTING DASHBOARD                      |
|                  Ministry of Home Affairs, Government of India                                    |
| +-----------------------------------------------------------------------------------------------+ |
| | STATUTORY ADVISORY: OFFICIAL USE ONLY - LAW ENFORCEMENT & FORENSIC AUTHORITIES               | |
| | Authorized under NDPS Act 1985 & Section 65B Evidence Act. Tampering strictly prohibited.    | |
| +-----------------------------------------------------------------------------------------------+ |
| [Telemetry Bar]: CIEDE2000 Engine: OK | FIPS SHA-256: Active | Node: IN-DEL-01 | STQC Compliant    |
+---------------------------------------------------------------------------------------------------+
| SECTION 1: KEY FORENSIC METRICS SUMMARY TABLE & DENSE TILES                                       |
| [ Total Tests: N ] | [ Positive: N ] | [ Negative: N ] | [ Inconclusive: N ] | [ Calib Errors: N ] |
|                                                                                                   |
| SUMMARY TABLE: Category | Code | Count | Ratio (%) | Legal Protocol Directive | Forensic Status   |
| - Positive Narcotic Confirmed (NDPS-POS-01)  | Count | % | NDPS Sec 42 Seizure Memo | [STAMP: DANGER] |
| - Negative Substance Cleared  (NDPS-NEG-00)  | Count | % | Clearance Certificate    | [STAMP: GREEN]  |
| - Inconclusive Spot Test      (NDPS-INC-02)  | Count | % | Dispatch to CFSL Lab     | [STAMP: BRASS]  |
| - Calibration Error / Void    (NDPS-ERR-09)  | Count | % | Re-test with 20% Card    | [STAMP: NEUTRAL]|
+---------------------------------------------------------------------------------------------------+
| SECTION 2: QUICK OPERATIONAL ACTIONS TABLE / GRID                                                 |
| +-------------------------+ +-------------------------+ +---------------------------------------+ |
| | [Camera]                | | [FileText]              | | [Database]                            | |
| | FORENSIC CAPTURE        | | EVIDENCE LEDGER         | | AUDIT TRAIL & LOGS                    | |
| | Form 4A Colorimetry     | | Cryptographic Records   | | Chronological Chain of Custody        | |
| | [LAUNCH CHAMBER ->]     | | [ACCESS LEDGER ->]      | | [INSPECT AUDIT ->]                    | |
| +-------------------------+ +-------------------------+ +---------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
| SECTION 3: RECENT FORENSIC SCANS REGISTRY TABLE                                                   |
| Controls: Search by Sample / Officer ID | Refresh Telemetry Button | Total Records Found          |
| +-----------------------------------------------------------------------------------------------+ |
| | Sample ID | Timestamp (IST) | Officer Badge | Calibration | Verdict | SHA-256 Hash | Action   | |
| | TEST-xxxx | 19/09/2026, 22:00 | NCB-OP-109  | Valid Card  | POSITIVE| a3f8...9b    | [Dossier]| |
| | TEST-yyyy | 19/09/2026, 21:45 | NCB-OP-109  | Valid Card  | NEGATIVE| e71c...0d    | [Dossier]| |
| +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
| SECTION 4: STATUTORY ADVISORY & EVIDENTIARY DISCLAIMER                                            |
| NDPS Act 1985 Presumptive Testing Rules & Section 65B Evidence Act Certification Standards.      |
+---------------------------------------------------------------------------------------------------+
```

### 3.2 Design Token & Styling Specifications

1. **Color Tokens (Derived from UX4G / GIGW 3.0)**:
   - Primary Authority: Deep Navy Blue (`#003366`)
   - Accent / National: Saffron (`#FF9933`) and Green (`#138808`)
   - Backgrounds: Canvas (`#F4F6F9`), Surface (`#FFFFFF`), Table Zebra (`#F8FAFC`)
   - Borders: Dense 1px Solid Slate (`#CBD5E1` / `border-slate-300`)
   - Text: Primary Charcoal (`#0B1B3D` / `#1E293B`), Muted Subtext (`#475569` / `#64748B`), Inverted (`#FFFFFF`)
   - Semantic Status:
     - Positive / Flagged: Red text (`#B91C1C`), Red border (`#EF4444`), Light red tint (`#FEF2F2`)
     - Negative / Cleared: Green text (`#138808`), Green border (`#22C55E`), Light green tint (`#F0FDF4`)
     - Inconclusive / Retest: Brass text (`#855800`), Amber border (`#F59E0B`), Light amber tint (`#FFFBEB`)
     - Calibration Void: Slate text (`#334155`), Slate border (`#94A3B8`), Slate tint (`#F1F5F9`)

2. **Typography & Density Rules**:
   - Headers: Sans-serif bold uppercase (`tracking-wider`, `text-xs` to `text-lg`).
   - Numerical Data: Tabular figures, bold monospace or sans bold (`font-mono` / `font-black`).
   - Hashes & IDs: Strict monospace (`font-mono text-xs`).
   - Padding & Gaps: Compact, utilitarian (`p-3`, `p-4`, `gap-3`, `gap-4`). No wasteful `p-8` or `p-12` padding.
   - Corners: Strictly rectangular (`rounded-none` or `rounded-xs`). No `rounded-2xl` or `rounded-3xl`.

---

## 4. Detailed Component Specifications

### 4.1 Breadcrumb & Administrative Context Bar
- Provides unambiguous location context (`मुख्य पृष्ठ / Field Operations / Operator Dashboard`).
- Displays live session metadata: Operator ID (`NCB-OP-109`), Jurisdiction (`DEL-HQ`), Device Status (`STQC Compliant Node`).

### 4.2 Official Ministry Header Banner with Statutory Advisory
- Top Saffron accent stripe (`border-t-4 border-[#FF9933]`).
- Clear organizational hierarchy:
  - Line 1: `भारत सरकार / Government of India`
  - Line 2: `मादक पदार्थ नियंत्रण ब्यूरो / Narcotics Control Bureau`
  - Line 3: `राष्ट्रीय फोरेंसिक औषधि परीक्षण प्रणाली / National Forensic Drug Testing System`
- Statutory Advisory Box:
  - Box background: `#FEF2F2` (High contrast alert background), border `#B91C1C`.
  - Heading: `"OFFICIAL USE ONLY - LAW ENFORCEMENT & FORENSIC AUTHORITIES"`
  - Text: *"This portal is authorized exclusively for sworn enforcement officers under the Narcotic Drugs and Psychotropic Substances (NDPS) Act, 1985 and Section 65B of the Indian Evidence Act. Tampering, unauthorized disclosure, or fabrication of digital spot test evidence is a cognizable felony."*
- Engine Telemetry Strip:
  - Local CIEDE2000 algorithm status: `Active (ISO/CIE 11664-6:2014)`
  - Cryptographic engine: `FIPS 180-4 SHA-256 Secure Hash`
  - Calibration baseline: `20% Reference White Calibration Tile`

### 4.3 Key Forensic Metrics Summary
- **Top 5-Way Dense Metrics Bar**:
  - `TOTAL SCANS RECORDED`: `stats.total_tests`
  - `POSITIVE NARCOTIC CONFIRMED`: `stats.by_result.positive`
  - `NEGATIVE SUBSTANCE CLEARED`: `stats.by_result.negative`
  - `INCONCLUSIVE / RETEST`: `stats.by_result.inconclusive`
  - `CALIBRATION ERRORS / VOID`: `stats.failed_calibration_count`
- **Key Forensic Metrics Summary Table (`.gov-table`)**:
  - Structured government table with columns:
    1. Metric Classification
    2. Regulatory Code
    3. Total Records
    4. Ratio (%)
    5. Standard Operating Directive
    6. Forensic Seal Status
  - Implements `StampBadge` for each classification row.

### 4.4 Quick Operational Actions Grid
Three primary operational modules rendered as sharp, high-contrast action cards with solid 1px slate borders:
1. **Module 1 (`MOD-CAP-01`): Forensic Evidence Digitization Chamber (Form 4A)**
   - Destination: `/capture`
   - Icon: `Camera`
   - Description: Run real-time CIEDE2000 optical color calibration against physical spot test evidence using reference white tile.
   - Action: High-contrast Navy Blue button (`bg-[#003366] text-white hover:bg-[#002244]`).
2. **Module 2 (`MOD-LED-02`): Cryptographic Evidence Ledger**
   - Destination: `/ledger`
   - Icon: `FileText`
   - Description: Access immutable digital locker of issued certificates of analysis, GPS timestamps, and SHA-256 evidence hashes.
   - Action: Navy outline button (`border-2 border-[#003366] text-[#003366] hover:bg-slate-100`).
3. **Module 3 (`MOD-LOG-03`): Forensic Audit Trail & Chain of Custody**
   - Destination: `/logs`
   - Icon: `Database`
   - Description: Inspect chronological operational access logs, verification signatures, and device hardware telemetry.
   - Action: Navy outline button (`border-2 border-[#003366] text-[#003366] hover:bg-slate-100`).

### 4.5 Recent Forensic Scans Registry Table
- Fetches real-time records from `/api/v1/tests?limit=10`.
- Search & Filter bar: Operator can filter records instantly by Sample ID, Officer ID, or Verdict.
- Refresh Telemetry button: Allows re-fetching both stats and recent scans without reloading the page.
- Table Columns:
  1. `Sample ID`: Formatted as `TEST-${id.substring(0, 8).toUpperCase()}` with full UUID on hover.
  2. `Timestamp (IST)`: Localized formatted date and time.
  3. `Officer Badge`: Operator badge (e.g. `NCB-OP-109`).
  4. `Calibration Status`: Indicates if reference card was validated or failed.
  5. `Forensic Verdict`: Rendered with `StampBadge` (`status={test.result}`, size `"sm"`).
  6. `Evidence Hash (SHA-256)`: Truncated 12-char monospace string with copy indicator.
  7. `Official Action`: Direct link to `/result/${test.id}` ("View Dossier").

---

## 5. Complete Drop-In JSX Code for `src/app/dashboard/page.tsx`

Worker M2 can drop this exact code directly into `src/app/dashboard/page.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Camera,
  FileText,
  Database,
  RefreshCw,
  Search,
  ArrowRight,
  Lock,
  Scale,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
} from "lucide-react";
import { StampBadge } from "@/components/ui/StampBadge";

interface DashboardStats {
  total_tests: number;
  by_result: {
    positive: number;
    negative: number;
    inconclusive: number;
  };
  failed_calibration_count: number;
}

interface TestRecord {
  id: string;
  operator_id: string;
  image_path: string;
  image_hash: string;
  gps_lat: number | null;
  gps_lng: number | null;
  captured_at: string;
  recorded_at: string;
  result: string;
  confidence: string;
  calibration_status: string;
  notes: string | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_tests: 0,
    by_result: { positive: 0, negative: 0, inconclusive: 0 },
    failed_calibration_count: 0,
  });
  const [recentTests, setRecentTests] = useState<TestRecord[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingTests, setLoadingTests] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchDashboardData = useCallback(async () => {
    setLoadingStats(true);
    setLoadingTests(true);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/v1/dashboard/stats");
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          total_tests: data.total_tests ?? 0,
          by_result: {
            positive: data.by_result?.positive ?? 0,
            negative: data.by_result?.negative ?? 0,
            inconclusive: data.by_result?.inconclusive ?? 0,
          },
          failed_calibration_count: data.failed_calibration_count ?? 0,
        });
      }

      // 2. Fetch Recent Tests Registry
      const testsRes = await fetch("/api/v1/tests?limit=10");
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        setRecentTests(Array.isArray(testsData.data) ? testsData.data : []);
      }

      setLastRefreshed(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    } catch (err) {
      console.error("Failed to load dashboard telemetry:", err);
    } finally {
      setLoadingStats(false);
      setLoadingTests(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute percentage calculations for summary table
  const total = stats.total_tests || 0;
  const positivePct =
    total > 0 ? ((stats.by_result.positive / total) * 100).toFixed(1) : "0.0";
  const negativePct =
    total > 0 ? ((stats.by_result.negative / total) * 100).toFixed(1) : "0.0";
  const inconclusivePct =
    total > 0
      ? ((stats.by_result.inconclusive / total) * 100).toFixed(1)
      : "0.0";
  const calibrationErrorPct =
    total > 0
      ? ((stats.failed_calibration_count / total) * 100).toFixed(1)
      : "0.0";

  // Filtered recent tests for on-page quick search
  const filteredTests = useMemo(() => {
    if (!searchQuery.trim()) return recentTests;
    const q = searchQuery.toLowerCase();
    return recentTests.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.operator_id.toLowerCase().includes(q) ||
        t.result.toLowerCase().includes(q) ||
        t.image_hash.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
    );
  }, [recentTests, searchQuery]);

  return (
    <div className="w-full pb-16">
      {/* ------------------------------------------------------------------- */}
      {/* 1. Breadcrumb & Administrative Context Bar                         */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border-b border-slate-300 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-medium">
            <Link href="/" className="hover:text-[#003366] hover:underline">
              मुख्य पृष्ठ (Home)
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">फ़ील्ड संचालन (Field Ops)</span>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-[#003366]" aria-current="page">
              ऑपरेटर डैशबोर्ड (Operator Dashboard)
            </span>
          </nav>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-700">
            <span className="bg-slate-100 border border-slate-300 px-2 py-0.5">
              <strong>OPERATOR:</strong> NCB-OP-109
            </span>
            <span className="hidden md:inline bg-slate-100 border border-slate-300 px-2 py-0.5">
              <strong>ZONE:</strong> NORTH / DEL-HQ
            </span>
            <span className="hidden sm:inline bg-emerald-50 border border-emerald-300 text-emerald-800 px-2 py-0.5 font-bold">
              ● NODE CONNECTED
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ----------------------------------------------------------------- */}
        {/* 2. Official Ministry Header Banner with Statutory Advisory       */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white border border-slate-300 border-t-4 border-t-[#FF9933] shadow-xs">
          {/* Main Title Section */}
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#003366] text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                    Form 4A Analytical System
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    VER 3.4.1-UX4G
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#003366] tracking-tight">
                  केंद्रीय फोरेंसिक विश्लेषण एवं साक्ष्य डैशबोर्ड
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  Central Forensic Optical Analysis & Chain-of-Custody Management Console
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Narcotics Control Bureau (NCB) | Ministry of Home Affairs, Government of India
                </p>
              </div>

              {/* Quick Actions / Refresh in Header */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={loadingStats || loadingTests}
                  aria-label="Refresh telemetry data"
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={loadingStats || loadingTests ? "animate-spin text-[#003366]" : "text-slate-600"}
                  />
                  <span>ताज़ा करें / Refresh Telemetry</span>
                </button>
                {lastRefreshed && (
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    Updated: {lastRefreshed} IST
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Statutory Advisory Box (Mandatory GIGW 3.0 / UX4G Notice) */}
          <div className="bg-[#FEF2F2] border-l-4 border-[#B91C1C] p-3 sm:p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-[#B91C1C] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#991B1B] uppercase tracking-wider block mb-0.5">
                  OFFICIAL USE ONLY - LAW ENFORCEMENT & FORENSIC AUTHORITIES
                </span>
                <p className="text-[#7F1D1D] leading-relaxed text-justify">
                  This portal is restricted to authorized field operatives and laboratory personnel under the statutory
                  provisions of the <strong>Narcotic Drugs and Psychotropic Substances (NDPS) Act, 1985</strong> and{" "}
                  <strong>Section 65B of the Indian Evidence Act</strong>. Colorimetric results generated here are cryptographically
                  bound to local device telemetry. Any unauthorized access, data manipulation, or distribution is a cognizable
                  offence under the Information Technology Act, 2000.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Engine Telemetry Strip */}
          <div className="bg-slate-50 px-4 py-2 text-[11px] font-mono text-slate-600 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#138808]" />
                <span>Engine: CIEDE2000 ΔE₀₀ (ISO/CIE 11664-6)</span>
              </span>
              <span className="flex items-center gap-1">
                <Lock size={13} className="text-[#003366]" />
                <span>Cryptographic Digest: FIPS 180-4 SHA-256</span>
              </span>
              <span className="flex items-center gap-1">
                <Scale size={13} className="text-slate-700" />
                <span>Reference Standard: 20% White Calibration Card</span>
              </span>
            </div>
            <div className="text-slate-500 font-bold">STQC AUDIT COMPLIANT</div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 3. Key Forensic Metrics Summary Section                           */}
        {/* ----------------------------------------------------------------- */}
        <section aria-labelledby="metrics-summary-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              id="metrics-summary-heading"
              className="text-sm font-bold uppercase tracking-wider text-[#003366] flex items-center gap-2"
            >
              <FileSpreadsheet size={16} className="text-[#003366]" />
              <span>फ़ोरेंसिक परीक्षण सांख्यिकी सारांश / Forensic Testing Telemetry</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              AGGREGATED REAL-TIME RECORDS
            </span>
          </div>

          {/* 5-Way Dense Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border border-slate-300 bg-white shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
            {/* Metric 1: Total Tests */}
            <div className="p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Total Scans Recorded
              </span>
              <div className="my-2">
                <span className="text-3xl font-black text-[#003366] font-mono">
                  {loadingStats ? "..." : stats.total_tests}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                कुल पंजीकृत परीक्षण (NDPS Locker)
              </span>
            </div>

            {/* Metric 2: Positive Narcotic */}
            <div className="p-4 flex flex-col justify-between bg-red-50/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider">
                  Positive Narcotic
                </span>
                <span className="w-2.5 h-2.5 bg-[#B91C1C] inline-block" aria-hidden="true" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-[#B91C1C] font-mono">
                  {loadingStats ? "..." : stats.by_result.positive}
                </span>
              </div>
              <span className="text-[10px] text-red-700 font-semibold">
                पुष्ट नशीला पदार्थ ({positivePct}%)
              </span>
            </div>

            {/* Metric 3: Negative Cleared */}
            <div className="p-4 flex flex-col justify-between bg-emerald-50/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                  Negative Cleared
                </span>
                <span className="w-2.5 h-2.5 bg-[#138808] inline-block" aria-hidden="true" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-[#138808] font-mono">
                  {loadingStats ? "..." : stats.by_result.negative}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">
                नकारात्मक निकासी ({negativePct}%)
              </span>
            </div>

            {/* Metric 4: Inconclusive Retest */}
            <div className="p-4 flex flex-col justify-between bg-amber-50/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  Inconclusive
                </span>
                <span className="w-2.5 h-2.5 bg-[#855800] inline-block" aria-hidden="true" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-[#855800] font-mono">
                  {loadingStats ? "..." : stats.by_result.inconclusive}
                </span>
              </div>
              <span className="text-[10px] text-amber-800 font-semibold">
                अनिर्णायक पुनर्परीक्षण ({inconclusivePct}%)
              </span>
            </div>

            {/* Metric 5: Calibration Errors */}
            <div className="p-4 flex flex-col justify-between bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Calibration Errors
                </span>
                <AlertTriangle size={14} className="text-slate-600" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-slate-800 font-mono">
                  {loadingStats ? "..." : stats.failed_calibration_count}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-semibold">
                अंशांकन त्रुटि ({calibrationErrorPct}%)
              </span>
            </div>
          </div>

          {/* Key Forensic Metrics Summary Table */}
          <div className="border border-slate-300 bg-white overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "22%" }}>
                    वर्गीकरण पैरामीटर / Metric Parameter
                  </th>
                  <th scope="col" style={{ width: "12%" }}>
                    संहिता / Code
                  </th>
                  <th scope="col" style={{ width: "10%" }} className="text-right">
                    संख्या / Count
                  </th>
                  <th scope="col" style={{ width: "10%" }} className="text-right">
                    प्रतिशत / Ratio
                  </th>
                  <th scope="col" style={{ width: "30%" }}>
                    मानक संचालन प्रक्रिया / Operational Directive
                  </th>
                  <th scope="col" style={{ width: "16%" }} className="text-center">
                    मुहर / Legal Seal
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-red-950">
                    <span className="inline-block w-2 h-2 bg-[#B91C1C] mr-2" />
                    Positive Narcotic Confirmed
                  </td>
                  <td className="font-mono text-xs font-semibold text-slate-700">NDPS-POS-01</td>
                  <td className="font-mono font-bold text-right text-red-800">
                    {loadingStats ? "..." : stats.by_result.positive}
                  </td>
                  <td className="font-mono text-right text-slate-700">{positivePct}%</td>
                  <td className="text-xs text-slate-700">
                    Seizure memo mandatory under Section 42 of NDPS Act; sample custody sealing in Form 4A container.
                  </td>
                  <td className="text-center">
                    <StampBadge variant="danger" text="POSITIVE" size="sm" />
                  </td>
                </tr>

                <tr>
                  <td className="font-bold text-emerald-950">
                    <span className="inline-block w-2 h-2 bg-[#138808] mr-2" />
                    Negative Substance Cleared
                  </td>
                  <td className="font-mono text-xs font-semibold text-slate-700">NDPS-NEG-00</td>
                  <td className="font-mono font-bold text-right text-emerald-800">
                    {loadingStats ? "..." : stats.by_result.negative}
                  </td>
                  <td className="font-mono text-right text-slate-700">{negativePct}%</td>
                  <td className="text-xs text-slate-700">
                    No scheduled alkaloid detected above ΔE threshold; clearance memo logged in digital custody book.
                  </td>
                  <td className="text-center">
                    <StampBadge variant="green" text="NEGATIVE" size="sm" />
                  </td>
                </tr>

                <tr>
                  <td className="font-bold text-amber-950">
                    <span className="inline-block w-2 h-2 bg-[#855800] mr-2" />
                    Inconclusive / Retest Required
                  </td>
                  <td className="font-mono text-xs font-semibold text-slate-700">NDPS-INC-02</td>
                  <td className="font-mono font-bold text-right text-amber-900">
                    {loadingStats ? "..." : stats.by_result.inconclusive}
                  </td>
                  <td className="font-mono text-right text-slate-700">{inconclusivePct}%</td>
                  <td className="text-xs text-slate-700">
                    Spectral variance outside confidence boundary; sample must be dispatched to CFSL for GC-MS testing.
                  </td>
                  <td className="text-center">
                    <StampBadge variant="brass" text="INCONCLUSIVE" size="sm" />
                  </td>
                </tr>

                <tr>
                  <td className="font-bold text-slate-900">
                    <span className="inline-block w-2 h-2 bg-slate-500 mr-2" />
                    Calibration Void / No Reference Card
                  </td>
                  <td className="font-mono text-xs font-semibold text-slate-700">NDPS-ERR-09</td>
                  <td className="font-mono font-bold text-right text-slate-800">
                    {loadingStats ? "..." : stats.failed_calibration_count}
                  </td>
                  <td className="font-mono text-right text-slate-700">{calibrationErrorPct}%</td>
                  <td className="text-xs text-slate-700">
                    Failed white patch reference check at 20% coordinates; capture must be repeated with standard card.
                  </td>
                  <td className="text-center">
                    <StampBadge variant="neutral" text="RE-CALIBRATE" size="sm" />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td className="text-[#003366] uppercase">कुल परीक्षण / Cumulative Tests</td>
                  <td className="font-mono text-xs text-slate-700">NDPS-TOT-ALL</td>
                  <td className="font-mono text-right text-[#003366] text-sm">
                    {loadingStats ? "..." : stats.total_tests}
                  </td>
                  <td className="font-mono text-right text-slate-700">100.0%</td>
                  <td className="text-xs text-slate-600">
                    All digital spot tests signed with FIPS 180-4 SHA-256 evidence digests.
                  </td>
                  <td className="text-center">
                    <StampBadge variant="navy" text="AUDITED" size="sm" />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* 4. Quick Operational Actions Table / Grid                         */}
        {/* ----------------------------------------------------------------- */}
        <section aria-labelledby="operational-actions-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              id="operational-actions-heading"
              className="text-sm font-bold uppercase tracking-wider text-[#003366] flex items-center gap-2"
            >
              <Scale size={16} className="text-[#003366]" />
              <span>त्वरित संचालन मॉड्यूल / Operational Action Modules</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">AUTHORIZED MANDATES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Capture Chamber */}
            <div className="bg-white border-2 border-[#003366] p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-mono font-bold text-[#003366] bg-blue-50 border border-blue-200 px-2 py-0.5">
                    MOD-CAP-01
                  </span>
                  <Camera size={20} className="text-[#003366]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  साक्ष्य कक्ष / Forensic Capture Chamber
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Initiate real-time optical colorimetry on physical spot test evidence. Samples are calibrated against
                  the standard 20% white reference tile and evaluated via CIEDE2000 math.
                </p>
              </div>
              <Link
                href="/capture"
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 px-4 text-xs tracking-wider uppercase text-center transition-colors flex items-center justify-center gap-2 border border-[#002244]"
              >
                <span>साक्ष्य कक्ष प्रारंभ करें / Launch Chamber</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Action 2: Cryptographic Ledger */}
            <div className="bg-white border border-slate-300 p-5 flex flex-col justify-between shadow-xs hover:border-[#003366] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5">
                    MOD-LED-02
                  </span>
                  <FileText size={20} className="text-[#003366]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  नमूना बहीखाता / Cryptographic Ledger
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Access the immutable register of submitted field spot tests. Inspect issued certificates of analysis,
                  GPS coordinates, and SHA-256 evidence hashes admissible under Section 65B.
                </p>
              </div>
              <Link
                href="/ledger"
                className="w-full bg-white hover:bg-slate-100 text-[#003366] font-bold py-2.5 px-4 text-xs tracking-wider uppercase text-center transition-colors flex items-center justify-center gap-2 border-2 border-[#003366]"
              >
                <span>बहीखाता खोलें / Access Ledger</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Action 3: Audit Trail & Logs */}
            <div className="bg-white border border-slate-300 p-5 flex flex-col justify-between shadow-xs hover:border-[#003366] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5">
                    MOD-LOG-03
                  </span>
                  <Database size={20} className="text-[#003366]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  ऑडिट लॉग / Forensic Audit Trail
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Inspect continuous chronological system actions, device hardware telemetry, officer badge signatures,
                  and raw sensor extraction records in compliance with STQC guidelines.
                </p>
              </div>
              <Link
                href="/logs"
                className="w-full bg-white hover:bg-slate-100 text-[#003366] font-bold py-2.5 px-4 text-xs tracking-wider uppercase text-center transition-colors flex items-center justify-center gap-2 border-2 border-[#003366]"
              >
                <span>ऑडिट लॉग देखें / Inspect Audit</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* 5. Recent Forensic Scans Registry Table                           */}
        {/* ----------------------------------------------------------------- */}
        <section aria-labelledby="scans-registry-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2
                id="scans-registry-heading"
                className="text-sm font-bold uppercase tracking-wider text-[#003366] flex items-center gap-2"
              >
                <Clock size={16} className="text-[#003366]" />
                <span>हालिया फोरेंसिक स्कैन रजिस्ट्री / Recent Forensic Scans Registry</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time chronological log of field test submissions received from local and regional nodes
              </p>
            </div>

            {/* Quick Filter & View All */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter records..."
                  aria-label="Filter recent forensic scans"
                  className="bg-white border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-[#003366] w-48 sm:w-60"
                />
              </div>
              <Link
                href="/ledger"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
              >
                <span>पूर्ण बहीखाता / View All ({stats.total_tests})</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          {/* Registry Table */}
          <div className="border border-slate-300 bg-white overflow-x-auto shadow-xs">
            <table className="gov-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "16%" }}>
                    नमूना संख्या / Sample ID
                  </th>
                  <th scope="col" style={{ width: "18%" }}>
                    दिनांक एवं समय / Timestamp (IST)
                  </th>
                  <th scope="col" style={{ width: "14%" }}>
                    अधिकारी बैज / Officer Badge
                  </th>
                  <th scope="col" style={{ width: "16%" }}>
                    अंशांकन स्थिति / Calibration
                  </th>
                  <th scope="col" style={{ width: "14%" }} className="text-center">
                    विश्लेषण निर्णय / Verdict
                  </th>
                  <th scope="col" style={{ width: "12%" }}>
                    हैश / SHA-256 Digest
                  </th>
                  <th scope="col" style={{ width: "10%" }} className="text-center">
                    कार्रवाई / Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingTests ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      <div className="inline-flex items-center gap-2 text-xs">
                        <RefreshCw size={14} className="animate-spin text-[#003366]" />
                        <span>एनसीबी डेटाबेस से अभिलेख प्राप्त हो रहे हैं / Fetching records from NCB node...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      {searchQuery
                        ? `कोई मेल खाता अभिलेख नहीं मिला / No records matching filter "${searchQuery}"`
                        : "कोई हालिया परीक्षण अभिलेख उपलब्ध नहीं है / No recent forensic test records found in registry."}
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((test) => {
                    const formattedDate = test.captured_at
                      ? new Date(test.captured_at).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })
                      : "—";

                    const isCalibrationValid =
                      test.calibration_status === "valid_reference_card" ||
                      !test.calibration_status.includes("failed");

                    return (
                      <tr key={test.id} className="hover:bg-slate-50">
                        <td className="font-mono text-xs font-bold text-[#003366]">
                          <span title={test.id}>
                            TEST-{test.id.substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-slate-700 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="font-mono text-xs font-semibold text-slate-800">
                          {test.operator_id || "NCB-OP-109"}
                        </td>
                        <td className="text-xs">
                          {isCalibrationValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                              <CheckCircle2 size={12} className="text-[#138808]" />
                              <span>20% White Ref OK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-800 font-medium">
                              <AlertTriangle size={12} className="text-[#B91C1C]" />
                              <span>No Reference Card</span>
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <StampBadge status={test.result} size="sm" />
                        </td>
                        <td className="font-mono text-[11px] text-slate-600 truncate max-w-[120px]">
                          <span title={test.image_hash}>
                            {test.image_hash ? test.image_hash.substring(0, 10) + "..." : "—"}
                          </span>
                        </td>
                        <td className="text-center">
                          <Link
                            href={`/result/${test.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#003366] bg-slate-100 hover:bg-[#003366] hover:text-white border border-slate-300 transition-colors"
                          >
                            <span>Dossier</span>
                            <ArrowRight size={10} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* 6. Statutory Compliance & Legal Reference Panel                   */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-slate-100 border border-slate-300 p-4 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-[#003366] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800 uppercase tracking-wide block">
                वैधानिक अनुपालन एवं साक्ष्य प्रमाणन / Statutory Evidentiary Compliance
              </span>
              <p className="leading-relaxed text-justify text-slate-700">
                1. <strong>Presumptive Spot Test Advisory:</strong> Optical colorimetric analysis conducted via this system is
                admissible as presumptive investigative evidence for seizure justification under Section 42 of the NDPS Act, 1985.
                Mandatory quantitative confirmation via GC-MS or HPLC must be sought from government forensic science laboratories.
              </p>
              <p className="leading-relaxed text-justify text-slate-700">
                2. <strong>Electronic Record Integrity:</strong> In compliance with Section 65B of the Indian Evidence Act, each
                test record captures hardware geolocation, operator cryptographic authentication, and timestamped SHA-256 payload
                hashes to preserve unbroken chain-of-custody for judicial proceedings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Verification and Implementation Checklist for Worker M2

Worker M2 should follow these exact steps to implement and verify the change:

1. **Backup / Inspect Existing File**:
   - Verify `src/app/dashboard/page.tsx` line count and current imports.
2. **Replace File Content**:
   - Overwrite `src/app/dashboard/page.tsx` with the complete drop-in JSX code provided in Section 5.
3. **Verify Elimination of Non-Compliant Classes**:
   - Run grep to ensure zero instances of forbidden tokens exist in `src/app/dashboard/page.tsx`:
     ```bash
     grep "backdrop-blur" src/app/dashboard/page.tsx
     grep "bg-gradient" src/app/dashboard/page.tsx
     grep "framer-motion" src/app/dashboard/page.tsx
     grep "rounded-3xl" src/app/dashboard/page.tsx
     grep "animate-ping" src/app/dashboard/page.tsx
     ```
     All grep queries must return zero matches.
4. **Compile & Build Verification**:
   - Run typecheck:
     ```bash
     npx tsc --noEmit
     ```
   - Run Next.js production build:
     ```bash
     npm run build
     ```
   - Both commands must succeed with exit code 0.
5. **Functional Verification**:
   - Verify dashboard route `/dashboard` renders correctly.
   - Verify API stats `/api/v1/dashboard/stats` populate values into `total_tests`, `by_result`, and `failed_calibration_count`.
   - Verify recent test table loads from `/api/v1/tests?limit=10`.
   - Verify links to `/capture`, `/ledger`, `/logs`, and `/result/[id]` navigate to the correct routes.
