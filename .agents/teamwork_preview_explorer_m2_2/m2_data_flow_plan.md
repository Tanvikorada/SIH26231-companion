# M2 Data Flow & Stats API Integration Plan
**Role**: Explorer M2-2 (Stats API Mapping & Data Flow Explorer)  
**Date**: 2026-09-19  
**Milestone**: Milestone 2 — Dashboard & Portal Layout Redesign  
**Target Files**: `src/app/dashboard/page.tsx` (consumer), `src/app/api/v1/dashboard/stats/route.ts` (API route, read-only/invariant)

---

## 1. Executive Summary & Problem Boundary

In the legacy codebase, `src/app/dashboard/page.tsx` suffered from a catastrophic data-flow mismatch with the backend API route `src/app/api/v1/dashboard/stats/route.ts`. The route handler returns a structured, nested JSON response, whereas the client page attempted to read flat keys that do not exist. Consequently, as soon as the fetch succeeded, all live telemetry numbers turned into `undefined`, rendering empty strings on screen.

Furthermore, critical forensic quality control data provided by the API (`failed_calibration_count`) was completely discarded, errors were swallowed silently without operator feedback, and no loading state or refresh mechanism was provided.

This plan details the exact schema contracts, documents every discrepancy, formulates resilient TypeScript types and normalization logic, and provides drop-in code snippets for **Worker M2**.

---

## 2. Line-by-Line Backend API Inspection (`src/app/api/v1/dashboard/stats/route.ts`)

The backend route handler is located at:
`src/app/api/v1/dashboard/stats/route.ts` (18 lines total).

```typescript
1: import { NextResponse } from "next/server";
2: import { prisma } from "@/lib/prisma";
3: 
4: export async function GET() {
5:   const total = await prisma.test.count();
6:   
7:   const positive = await prisma.test.count({ where: { result: "positive" } });
8:   const negative = await prisma.test.count({ where: { result: "negative" } });
9:   const inconclusive = await prisma.test.count({ where: { result: "inconclusive" } });
10:   const failed_calibration = await prisma.test.count({ where: { calibration_status: "failed_no_reference_card" } });
11: 
12:   return NextResponse.json({
13:     total_tests: total,
14:     by_result: { positive, negative, inconclusive },
15:     failed_calibration_count: failed_calibration,
16:   });
17: }
```

### Route Behavior & Contract Observations
1. **HTTP Method**: `GET`
2. **Database Queries**:
   - `prisma.test.count()`: Aggregates total test records across all operators and jurisdictions.
   - `prisma.test.count({ where: { result: "positive" } })`: Counts records with statutory narcotic positive classification.
   - `prisma.test.count({ where: { result: "negative" } })`: Counts records cleared of narcotic presence.
   - `prisma.test.count({ where: { result: "inconclusive" } })`: Counts records where delta-E was insufficient or ambiguous.
   - `prisma.test.count({ where: { calibration_status: "failed_no_reference_card" } })`: Counts records where camera sampling failed to detect the reference white card, jeopardizing evidentiary admissibility under Section 65B.
3. **Exact Response Payload Contract**:
   ```json
   {
     "total_tests": 12,
     "by_result": {
       "positive": 5,
       "negative": 6,
       "inconclusive": 1
     },
     "failed_calibration_count": 0
   }
   ```
4. **Key Schema Invariants**:
   - `total_tests` is a `number` at the top level. There is **no** `total` property.
   - Individual result counts (`positive`, `negative`, `inconclusive`) are nested inside `by_result`. There are **no** top-level `positive`, `negative`, or `inconclusive` properties.
   - `failed_calibration_count` is a `number` at the top level.
   - If the database table is empty, all values are `0` (numbers), not `null`.
   - **Crucial Rule**: `src/app/api/v1/**` is a **STRICT NON-TOUCH FILE** per `PROJECT.md`. The client consumer MUST adapt to the API, never modify the route.

---

## 3. Line-by-Line Frontend Consumer Analysis (`src/app/dashboard/page.tsx`)

Inspection of `src/app/dashboard/page.tsx` reveals the following critical bugs and architectural gaps:

### Discrepancy Matrix

| Feature / Field | API Return (`route.ts`) | Legacy Consumer (`dashboard/page.tsx`) | Runtime Consequence |
|---|---|---|---|
| **Total Tests** | `total_tests: number` | `stats.total` (lines 9, 100) | `stats.total` becomes `undefined`. Metric card renders empty blank. |
| **Positive Tests** | `by_result.positive: number` | `stats.positive` (lines 9, 106) | `stats.positive` becomes `undefined`. Metric card renders empty blank. |
| **Negative Tests** | `by_result.negative: number` | `stats.negative` (lines 9, 110) | `stats.negative` becomes `undefined`. Metric card renders empty blank. |
| **Inconclusive** | `by_result.inconclusive: number` | `stats.inconclusive` (lines 9, 114) | `stats.inconclusive` becomes `undefined`. Metric card renders empty blank. |
| **Failed Calibrations** | `failed_calibration_count: number` | *Completely omitted* | Critical statutory QC data is never displayed to officers. |
| **Error Handling** | May return 500 if DB down | `.catch(() => {})` (line 12) | Silently swallows error; if 500 JSON is returned, crashes or breaks types. |
| **Loading State** | Async network request | None (`stats` defaults to 0) | No loading spinner/skeleton; operator cannot distinguish loading vs zero. |
| **Refresh Trigger** | Static mount `useEffect(..., [])` | None | No button to refresh metrics after recording a new test at `/capture`. |
| **Cache Control** | Standard HTTP fetch | Default caching | May return stale HTTP cache in client navigations. |

### Code Excerpt Showing Discrepancies
```typescript
// src/app/dashboard/page.tsx (Lines 8-13)
export default function Dashboard() {
  // BUG: Initial state assumes flat shape
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, inconclusive: 0 });

  useEffect(() => {
    // BUG: Raw setStats replaces object with API shape containing `total_tests` and `by_result`
    // BUG: No response.ok check
    // BUG: Error silently swallowed
    fetch("/api/v1/dashboard/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // ...
  // BUG (Lines 100-114): Reading properties that do not exist on the new state
  <div>{stats.total}</div>        // undefined!
  <div>{stats.positive}</div>     // undefined!
  <div>{stats.negative}</div>     // undefined!
  <div>{stats.inconclusive}</div> // undefined!
```

---

## 4. TypeScript Type System Specification

Worker M2 should implement strongly-typed interfaces for the API payload, UI data structures, and state management.

```typescript
/**
 * Raw response contract matching GET /api/v1/dashboard/stats
 */
export interface DashboardStatsApiResponse {
  total_tests: number;
  by_result: {
    positive: number;
    negative: number;
    inconclusive: number;
  };
  failed_calibration_count: number;
}

/**
 * Normalized statistics structure for dashboard UI consumption
 */
export interface DashboardStatsData {
  totalTests: number;
  positiveCount: number;
  negativeCount: number;
  inconclusiveCount: number;
  failedCalibrationCount: number;
  
  // Derived operational metrics (0 - 100%)
  positivityRate: number;
  negativityRate: number;
  inconclusiveRate: number;
  calibrationSuccessRate: number;
}

/**
 * Recent scan record matching GET /api/v1/tests?limit=X
 */
export interface RecentScanRecord {
  id: string;
  operator_id: string;
  image_path: string;
  image_hash: string;
  gps_lat: number | null;
  gps_lng: number | null;
  captured_at: string;
  recorded_at: string;
  result: "positive" | "negative" | "inconclusive" | string;
  confidence: string;
  calibration_status: string;
  notes: string | null;
}

/**
 * Dashboard holistic data state
 */
export interface DashboardTelemetryState {
  stats: DashboardStatsData;
  recentScans: RecentScanRecord[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastSyncedAt: Date | null;
}
```

---

## 5. Resilient Normalization & Defensive Extraction Logic

To protect against `null`, `undefined`, partial objects, division by zero, or network anomalies, Worker M2 should use the following normalizer:

```typescript
export const DEFAULT_DASHBOARD_STATS: DashboardStatsData = {
  totalTests: 0,
  positiveCount: 0,
  negativeCount: 0,
  inconclusiveCount: 0,
  failedCalibrationCount: 0,
  positivityRate: 0,
  negativityRate: 0,
  inconclusiveRate: 0,
  calibrationSuccessRate: 100,
};

/**
 * Safely parses raw API response into normalized DashboardStatsData.
 * Guards against null, undefined, partial payloads, or type mismatches.
 */
export function normalizeDashboardStats(
  raw: Partial<DashboardStatsApiResponse> | null | undefined
): DashboardStatsData {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_DASHBOARD_STATS;
  }

  const total = typeof raw.total_tests === "number" && !isNaN(raw.total_tests)
    ? Math.max(0, raw.total_tests)
    : 0;

  const positive = typeof raw.by_result?.positive === "number" && !isNaN(raw.by_result.positive)
    ? Math.max(0, raw.by_result.positive)
    : 0;

  const negative = typeof raw.by_result?.negative === "number" && !isNaN(raw.by_result.negative)
    ? Math.max(0, raw.by_result.negative)
    : 0;

  const inconclusive = typeof raw.by_result?.inconclusive === "number" && !isNaN(raw.by_result.inconclusive)
    ? Math.max(0, raw.by_result.inconclusive)
    : 0;

  const failedCalibration = typeof raw.failed_calibration_count === "number" && !isNaN(raw.failed_calibration_count)
    ? Math.max(0, raw.failed_calibration_count)
    : 0;

  // Defensive rate calculations (avoiding division by zero)
  const positivityRate = total > 0 ? Math.round((positive / total) * 1000) / 10 : 0;
  const negativityRate = total > 0 ? Math.round((negative / total) * 1000) / 10 : 0;
  const inconclusiveRate = total > 0 ? Math.round((inconclusive / total) * 1000) / 10 : 0;

  const validCalibrations = Math.max(0, total - failedCalibration);
  const calibrationSuccessRate = total > 0 ? Math.round((validCalibrations / total) * 1000) / 10 : 100;

  return {
    totalTests: total,
    positiveCount: positive,
    negativeCount: negative,
    inconclusiveCount: inconclusive,
    failedCalibrationCount: failedCalibration,
    positivityRate,
    negativityRate,
    inconclusiveRate,
    calibrationSuccessRate,
  };
}
```

---

## 6. Complete Data Fetching, Error Handling & Refresh Architecture

### A. Cache Control & Concurrency
1. Set `cache: "no-store"` on fetch requests so fresh data is retrieved whenever the officer revisits or refreshes the page.
2. Fetch both `/api/v1/dashboard/stats` and `/api/v1/tests?limit=5` in parallel via `Promise.allSettled`.
3. Provide an explicit `refreshData()` handler that can be triggered by a "Refresh Telemetry" button in the official UI header.

### B. Implementation Code for Worker M2

```typescript
import { useState, useEffect, useCallback } from "react";

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStatsData>(DEFAULT_DASHBOARD_STATS);
  const [recentScans, setRecentScans] = useState<RecentScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [statsResult, scansResult] = await Promise.allSettled([
        fetch("/api/v1/dashboard/stats", { cache: "no-store" }),
        fetch("/api/v1/tests?limit=6", { cache: "no-store" }),
      ]);

      // Process Stats
      if (statsResult.status === "fulfilled") {
        const res = statsResult.value;
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status} while fetching stats.`);
        }
        const rawJson: DashboardStatsApiResponse = await res.json();
        setStats(normalizeDashboardStats(rawJson));
      } else {
        throw new Error(statsResult.reason?.message || "Failed to reach stats endpoint.");
      }

      // Process Recent Scans
      if (scansResult.status === "fulfilled") {
        const res = scansResult.value;
        if (res.ok) {
          const rawJson = await res.json();
          if (Array.isArray(rawJson?.data)) {
            setRecentScans(rawJson.data);
          }
        }
      }

      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error("[Dashboard Telemetry Error]:", err);
      setError(err?.message || "An unexpected error occurred while synchronizing forensic telemetry.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    stats,
    recentScans,
    isLoading,
    isRefreshing,
    error,
    lastSyncedAt,
    refreshData: () => loadData(true),
  };
}
```

---

## 7. UX4G / GIGW 3.0 UI Integration & Presentation

### Metric Extraction Mapping

In accordance with GIGW 3.0 and the Digital India UX4G design system, the metrics should be rendered in:
1. **Primary High-Contrast Telemetry Tiles** (Solid 1px slate borders, sharp rectangular geometry, stark white background).
2. **Statutory Summary Table** (`.gov-table` with `#003366` header and structured data cells).

#### Telemetry Mapping Table
| UI Tile / Cell | Value Binding | Percentage Binding | Color Token & Status Stamp |
|---|---|---|---|
| **Total Evidence Dossiers** | `stats.totalTests` | `100.0%` | Navy `#003366`, `StampBadge variant="navy" text="CATALOGED"` |
| **Narcotics Positive** | `stats.positiveCount` | `${stats.positivityRate}%` | Crimson `#B91C1C`, `StampBadge variant="danger" status="positive"` |
| **Negative / Cleared** | `stats.negativeCount` | `${stats.negativityRate}%` | Green `#138808`, `StampBadge variant="green" status="negative"` |
| **Inconclusive / Retest** | `stats.inconclusiveCount` | `${stats.inconclusiveRate}%` | Brass `#855800`, `StampBadge variant="brass" status="inconclusive"` |
| **Calibration Anomalies** | `stats.failedCalibrationCount` | `${stats.calibrationSuccessRate}% valid` | High-contrast Amber/Navy: `StampBadge variant={stats.failedCalibrationCount > 0 ? "brass" : "navy"}` |

### JSX Code Snippet: Dense Metrics Summary Grid
```tsx
{/* Forensic Telemetry Grid (GIGW 3.0 Utilitarian Grid) */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
  {/* Total Tests */}
  <div className="bg-white border border-[#CBD5E1] p-4 flex flex-col justify-between shadow-xs">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Scans</span>
      <StampBadge variant="navy" size="sm" text="ARCHIVE" />
    </div>
    <div className="text-3xl font-black text-[#003366] font-mono tracking-tight">
      {isLoading ? "—" : stats.totalTests.toLocaleString("en-IN")}
    </div>
    <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
      <span>100% NDPS Logged</span>
      <span className="font-semibold text-slate-700">Sec 65B</span>
    </div>
  </div>

  {/* Positive Tests */}
  <div className="bg-white border-2 border-red-700 p-4 flex flex-col justify-between shadow-xs">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-red-800">Narcotic Detected</span>
      <StampBadge variant="danger" size="sm" text="POSITIVE" />
    </div>
    <div className="text-3xl font-black text-red-800 font-mono tracking-tight">
      {isLoading ? "—" : stats.positiveCount.toLocaleString("en-IN")}
    </div>
    <div className="text-[10px] text-red-700 mt-2 pt-2 border-t border-red-100 flex justify-between font-semibold">
      <span>Positivity Ratio</span>
      <span>{isLoading ? "—" : `${stats.positivityRate}%`}</span>
    </div>
  </div>

  {/* Negative Tests */}
  <div className="bg-white border-2 border-[#138808] p-4 flex flex-col justify-between shadow-xs">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#138808]">Cleared / Negative</span>
      <StampBadge variant="green" size="sm" text="CLEARED" />
    </div>
    <div className="text-3xl font-black text-[#138808] font-mono tracking-tight">
      {isLoading ? "—" : stats.negativeCount.toLocaleString("en-IN")}
    </div>
    <div className="text-[10px] text-emerald-800 mt-2 pt-2 border-t border-emerald-100 flex justify-between font-semibold">
      <span>Clearance Ratio</span>
      <span>{isLoading ? "—" : `${stats.negativityRate}%`}</span>
    </div>
  </div>

  {/* Inconclusive Tests */}
  <div className="bg-white border-2 border-[var(--color-brass,#855800)] p-4 flex flex-col justify-between shadow-xs">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brass,#855800)]">Inconclusive</span>
      <StampBadge variant="brass" size="sm" text="RETEST" />
    </div>
    <div className="text-3xl font-black text-[var(--color-brass,#855800)] font-mono tracking-tight">
      {isLoading ? "—" : stats.inconclusiveCount.toLocaleString("en-IN")}
    </div>
    <div className="text-[10px] text-amber-900 mt-2 pt-2 border-t border-amber-100 flex justify-between font-semibold">
      <span>Retest Ratio</span>
      <span>{isLoading ? "—" : `${stats.inconclusiveRate}%`}</span>
    </div>
  </div>

  {/* Calibration Anomalies */}
  <div className={`bg-white border p-4 flex flex-col justify-between shadow-xs ${
    stats.failedCalibrationCount > 0 ? "border-amber-600 bg-amber-50/20" : "border-[#CBD5E1]"
  }`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Calibration QC</span>
      <StampBadge variant={stats.failedCalibrationCount > 0 ? "brass" : "navy"} size="sm" text={stats.failedCalibrationCount > 0 ? "QC RISK" : "VALID"} />
    </div>
    <div className={`text-3xl font-black font-mono tracking-tight ${
      stats.failedCalibrationCount > 0 ? "text-amber-800" : "text-slate-800"
    }`}>
      {isLoading ? "—" : stats.failedCalibrationCount.toLocaleString("en-IN")}
    </div>
    <div className="text-[10px] text-slate-600 mt-2 pt-2 border-t border-slate-100 flex justify-between font-semibold">
      <span>Integrity Score</span>
      <span>{isLoading ? "—" : `${stats.calibrationSuccessRate}%`}</span>
    </div>
  </div>
</div>
```

### JSX Code Snippet: Telemetry Header with Refresh Trigger & Timestamp
```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-300">
  <div>
    <h2 className="text-base sm:text-lg font-bold text-[#003366] flex items-center gap-2">
      <span>राष्ट्रीय फोरेंसिक टेलीमेट्री सारांश</span>
      <span className="text-xs font-normal text-slate-500">| National Telemetry Summary</span>
    </h2>
    <p className="text-[11px] text-slate-600">
      Real-time synchronization with Central Narcotics Field Database (NDPS Evidence Vault)
    </p>
  </div>

  <div className="flex items-center gap-3">
    {lastSyncedAt && (
      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
        Last synced: {lastSyncedAt.toLocaleTimeString("en-IN")} IST
      </span>
    )}
    <button
      type="button"
      onClick={refreshData}
      disabled={isRefreshing || isLoading}
      aria-label="Refresh telemetry from database"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CBD5E1] text-[#003366] hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
    >
      <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#FF9933]" : "text-[#003366]"} />
      <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
    </button>
  </div>
</div>
```

### JSX Code Snippet: Statutory Telemetry Dense Table
```tsx
{/* Structured Government Metrics Table (.gov-table) */}
<div className="overflow-x-auto border border-[#CBD5E1] bg-white mb-6">
  <table className="gov-table">
    <thead>
      <tr>
        <th scope="col">Statutory Parameter / Verdict</th>
        <th scope="col" className="text-right">Dossier Count (N)</th>
        <th scope="col" className="text-right">Ratio (% Total)</th>
        <th scope="col">Admissibility Status</th>
        <th scope="col">Prescribed Protocol</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="font-semibold text-slate-800">Narcotic Confirmed (Positive)</td>
        <td className="text-right font-mono font-bold text-red-700">{stats.positiveCount}</td>
        <td className="text-right font-mono">{stats.positivityRate}%</td>
        <td><StampBadge variant="danger" size="sm" text="SECTION 20/22 NDPS" /></td>
        <td className="text-xs text-slate-600">Immediate Seizure & Laboratory Dossier Dispatch (Form 4B)</td>
      </tr>
      <tr>
        <td className="font-semibold text-slate-800">Clear Sample (Negative)</td>
        <td className="text-right font-mono font-bold text-[#138808]">{stats.negativeCount}</td>
        <td className="text-right font-mono">{stats.negativityRate}%</td>
        <td><StampBadge variant="green" size="sm" text="CLEARED" /></td>
        <td className="text-xs text-slate-600">Sample Released / Routine Transit Archive Maintained</td>
      </tr>
      <tr>
        <td className="font-semibold text-slate-800">Ambiguous Reaction (Inconclusive)</td>
        <td className="text-right font-mono font-bold text-[var(--color-brass,#855800)]">{stats.inconclusiveCount}</td>
        <td className="text-right font-mono">{stats.inconclusiveRate}%</td>
        <td><StampBadge variant="brass" size="sm" text="RETEST MANDATORY" /></td>
        <td className="text-xs text-slate-600">Secondary Cassette Extraction or GC-MS Laboratory Referral</td>
      </tr>
      <tr>
        <td className="font-semibold text-slate-800">Calibration Anomaly (No White Card)</td>
        <td className="text-right font-mono font-bold text-amber-800">{stats.failedCalibrationCount}</td>
        <td className="text-right font-mono">{stats.totalTests > 0 ? (100 - stats.calibrationSuccessRate).toFixed(1) : 0}%</td>
        <td><StampBadge variant={stats.failedCalibrationCount > 0 ? "brass" : "navy"} size="sm" text={stats.failedCalibrationCount > 0 ? "INVALID" : "COMPLIANT"} /></td>
        <td className="text-xs text-slate-600">Recalibrate camera rig with standard reference target</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 8. Verification & Test Invariants

To guarantee 100% type safety and zero runtime exceptions:

1. **Compilation Check**:
   `npx tsc --noEmit` must pass with zero errors on `src/app/dashboard/page.tsx`.
2. **Build Check**:
   `npm run build` must succeed with zero linting or Tailwind warnings.
3. **Runtime Invariants**:
   - Total count matches `prisma.test.count()`.
   - Positive + Negative + Inconclusive + Untagged = Total tests.
   - Zero `NaN%` or `undefined` text nodes exist in the rendered DOM.
   - Disconnecting network or stopping database displays the official error banner without crashing the React tree.
   - Refresh button updates timestamp and data without reloading the browser page.
