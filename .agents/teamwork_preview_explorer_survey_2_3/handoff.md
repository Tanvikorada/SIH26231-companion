# Handoff Report: Dashboard UI Live Alerts & System Integration

**Survey Explorer 3**: Dashboard UI Live Alerts & System Integration  
**Date / Timestamp**: 2026-09-19T17:42:00Z  
**Working Directory**: `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_survey_2_3`  
**Parent Conversation ID**: `6aaf4af0-8c06-4156-bc9f-fa15a903731f`

---

## Executive Summary
The Next.js 16.3.5 / React 19 application builds cleanly via Turbopack (`npm run build` in 2.0s, 0 errors) and currently features an authoritative GIGW 3.0 layout on `/dashboard`. To satisfy Milestone 2 acceptance criteria, the dashboard requires a dedicated, full-width "Live Alerts" tabular section consuming scraped drug threat data via a resilient server API route (`/api/v1/alerts`) reading from `data/threat_alerts.json` with an embedded fallback seed to strictly decouple build-time compilation from external scraping.

---

## 1. Observation

### 1.1 Existing Dashboard Layout & Structure (`src/app/dashboard/page.tsx`)
- **Component Nature**: `"use client"` component (line 1), utilizing React `useState` and `useEffect`.
- **Top Header Redundancy**: Lines 16–48 contain a hardcoded tricolor strip and header (`Narcotics Control Bureau - Optical Analysis System`), which partly overlaps with the global 3-tier GIGW 3.0 header already rendered by `src/app/layout.tsx` (lines 58–322).
- **Emblem Placeholder**: Line 36 contains a plain placeholder box:
  ```tsx
  <div className="w-12 h-16 bg-gray-100 border border-gray-300 flex items-center justify-center">
    <span className="text-[10px] text-gray-400 text-center uppercase font-bold leading-tight">National<br/>Emblem</span>
  </div>
  ```
  However, a production-grade vector component `<StateEmblem size={44} variant="navy" />` (`src/components/ui/StateEmblem.tsx`) is already available in the codebase.
- **Current Grid Layout**: Lines 58–148 define a 2-column grid (`grid grid-cols-1 lg:grid-cols-3 gap-6`):
  - **Left column (`lg:col-span-1`)**: "Field Operations" card (button to `/capture`) and "Secure Records" card (button to `/ledger`).
  - **Right column (`lg:col-span-2`)**: "Live National Telemetry" card with a 3-column table (Metric, Total Count, Status Indicator) displaying tests count, positive, negative, and inconclusive stats.
- **Telemetry State Disconnect**: In `page.tsx` line 11:
  `fetch("/api/v1/dashboard/stats").then(r => r.json()).then(setStats)`
  `setStats` expects `{ total, positive, negative, inconclusive }`, whereas `src/app/api/v1/dashboard/stats/route.ts` returns:
  `{ total_tests: total, by_result: { positive, negative, inconclusive }, failed_calibration_count }`.
  This causes `stats.total` to evaluate to `undefined` upon API fetch.

### 1.2 Reusable UI Component Assets
- **`StampBadge` (`src/components/ui/StampBadge.tsx`)**:
  - Fully compliant with Digital India UX4G & GIGW 3.0 standards.
  - Variants: `navy` (#003366), `brass` (#855800), `saffron` (#C2410C), `green` (#138808), `danger` (Red-700), `neutral` (Slate-500).
  - Sizes: `sm` (compact for dense tables, `px-2 py-0.5 text-xs border tracking-wider`), `md`, and `lg`.
  - Supports `status`, `variant`, `text`, `subtext`, and accessible ARIA attributes (`role="status"`).
- **`StateEmblem` (`src/components/ui/StateEmblem.tsx`)**:
  - High-precision SVG of Lion Capital of Ashoka with Satyameva Jayate motto and Ashoka Chakra.

### 1.3 System Lifecycle & Build Inspection
- **`npm run build`**:
  Executed command: `next build` (Next.js 16.3.5, Turbopack).
  Result: **Exit code 0**, compiled successfully in 2.0s, all 11 routes generated statically or dynamically without errors.
- **`npm run test`**:
  - `package.json` currently lacks a `"test"` script.
  - Running `npx vitest run --config tests/vitest.config.mjs` executes Vitest 5.0.1.
  - `tests/m1_shell_badge_emblem.test.tsx` (13 tests) passes 100%.
  - `src/lib/engine.test.ts` fails because `src/lib/engine.ts` function signatures and math have not yet been calibrated (assigned to Explorer 2_1 for R1).
- **Node Environment**:
  - Node version: `v24.18.0`.
  - Native TypeScript execution: Verified `node --experimental-strip-types` executes TypeScript scripts natively without installing `tsx` or `ts-node`.
- **E2E Suite (`tests/e2e_verify.mjs`)**:
  - Executed `node tests/e2e_verify.mjs`.
  - 15 of 17 tests passed (88.2%).
  - Two non-blocking M1 defects detected: line 20 in `src/app/logs/page.tsx` has leftover `backdrop-blur`, and `src/app/result/[id]/page.tsx` has a route regex mismatch for back link.

---

## 2. Logic Chain

```
[Observation 1.1] Dashboard layout currently has a 2-column grid without Live Alerts
      +
[Observation 1.2] StampBadge (sm) and StateEmblem components already exist and adhere to GIGW 3.0
      +
[User Requirement R2/AC] Dedicated "Live Alerts" tabular section displaying scraped threat data
      ↓
[Logic Step 1]: Live Alerts section must be designed as a full-width container (col-span-1 lg:col-span-3)
                beneath the operations & telemetry grid, featuring a 5-column dense table with StampBadge badges.

[Observation 1.3] `npm run build` succeeds cleanly right now in 2.0s
      +
[Risk Analysis]: Direct static import (e.g. `import data from '@/data/threat_alerts.json'`) will fail
                compilation if `npm run scrape` has not yet been executed in a fresh clone.
                Furthermore, static imports are baked into client bundles at build time, meaning running
                `npm run scrape` would not update the client UI dynamically without rebuilding.
      ↓
[Logic Step 2]: Data consumption must use an API route (`GET /api/v1/alerts`) that reads `data/threat_alerts.json`
                from the filesystem at runtime via `fs.promises.readFile`. If the file is missing or invalid,
                the route returns a seeded default alert payload.
                The client Dashboard component fetches `/api/v1/alerts` on mount (`useEffect`) and on manual refresh.

[Observation 1.3] Node is v24.18.0 with experimental strip-types; Vitest is installed but lacks package script
      ↓
[Logic Step 3]: Add `"test": "vitest run --config tests/vitest.config.mjs"` and
                `"scrape": "node --experimental-strip-types scripts/scrape.ts"` to `package.json`.
                The full solution workflow operates sequentially:
                1. `npm run test` (verifies engine math >=95% accuracy and UI rendering)
                2. `npm run scrape` (fetches public health feeds into `data/threat_alerts.json`)
                3. `npm run build` (builds Next.js production bundle cleanly)
```

---

## 3. Detailed Architecture & Design Specifications

### 3.1 "Live Alerts" Tabular Section Design
The Live Alerts section must be rendered prominently as a full-width section spanning `col-span-1 lg:col-span-3` in `src/app/dashboard/page.tsx`.

#### 3.1.1 Column Schema
| Column # | Column Header | Data Field | Display Specification |
|:---|:---|:---|:---|
| **Col 1** | `Advisory ID & Date (IST)` | `id`, `publishedAt` | Formatted date (e.g., `18 Sep 2026, 14:30`) with monospace advisory ID (`ALT-IN-2026-042`). |
| **Col 2** | `Threat Level` | `threatLevel` | Rendered via `<StampBadge size="sm" />`: <br>• `CRITICAL`: `variant="danger"` (Red)<br>• `HIGH`: `variant="saffron"` (Orange)<br>• `ELEVATED`: `variant="brass"` (Brass/Amber)<br>• `ADVISORY`: `variant="navy"` (Navy) |
| **Col 3** | `Substance & Classification` | `substance`, `category` | High-contrast bold text for substance name, accompanied by a monospace classification tag (e.g., `[Synthetic Opioid]`, `[NPS / Cathinone]`). |
| **Col 4** | `Source Agency` | `source`, `region` | Issuing authority (e.g., `NCB Directorate`, `WHO EWA`, `EUDA Alert`, `CDC HAN`) with jurisdiction badge (e.g., `IN`, `GLOBAL`, `EU`). |
| **Col 5** | `Advisory Summary & Reagent Marker` | `summary`, `reagentGuidance` | Clear narrative advisory summary with chemical/reagent warning (e.g., *"Marquis: Rapid black precipitate; high fentanyl analogue potency"*). |

#### 3.1.2 Header Controls & Interactivity
- **Title Block**:
  - Hindi: `राष्ट्रीय मादक पदार्थ चेतावनी प्रणाली`
  - English: `National Drug Threat Advisories & Early Warning System`
  - Subtitle: `Aggregated Surveillance Feeds (NCB, WHO, EUDA, UNODC, CDC)`
- **Live Feed Indicators**:
  - Green status pulse: `FEED ACTIVE`
  - Total records count: `4 ACTIVE ADVISORIES`
  - Last synced timestamp: `Updated: 18-09-2026 17:30 IST`
- **User Actions**:
  - Threat level filter buttons: `[ALL]`, `[CRITICAL]`, `[HIGH]`, `[ELEVATED]`
  - Search input box for quick substance/agency text matching
  - `Refresh Feed` button (triggers async re-fetch from `/api/v1/alerts` without page reload)

#### 3.1.3 Fallback, Loading & Empty States
- **Loading State**: Table body shows 4 pulse skeleton rows matching the 5-column layout.
- **Empty State**:
  ```tsx
  <div className="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-300">
    <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
    <p className="font-bold text-slate-700 text-sm">No Active Critical Threat Advisories Found</p>
    <p className="text-xs text-slate-500 mt-1">
      Continuous monitoring active across national and international early warning channels.
    </p>
  </div>
  ```
- **Offline / Scraper Not Run State**:
  If the API reports `source: "fallback"`, display a subtle utilitarian notice:
  `Operating on verified static advisory archive. Run 'npm run scrape' to sync live surveillance data.`

### 3.2 Threat Alert Data Schema (`ThreatAlert`)
Standard JSON structure written to `data/threat_alerts.json`:
```typescript
export interface ThreatAlert {
  id: string; // e.g. "ALT-IN-2026-089"
  source: string; // e.g. "Narcotics Control Bureau (NCB)" | "EUDA Early Warning System" | "WHO Surveillance"
  substance: string; // e.g. "Nitazene (Isotonitazene)"
  category: string; // e.g. "Synthetic Opioid" | "NPS"
  threatLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE" | "ADVISORY";
  publishedAt: string; // ISO 8601 string e.g. "2026-09-18T10:00:00Z"
  region: string; // e.g. "National (India)" | "International"
  summary: string; // Actionable advisory brief
  details?: string; // Extended forensic/clinical observations
  reagentGuidance?: {
    reagent: string; // e.g. "Marquis"
    expectedReaction: string; // e.g. "Dark Grey to Black within 5s"
    cautionNote?: string;
  };
  status: "ACTIVE" | "MONITORING" | "RESOLVED";
  url?: string;
}

export interface ThreatAlertsPayload {
  success: boolean;
  source: "live_cache" | "fallback";
  lastUpdated: string;
  count: number;
  sourcesScraped: string[];
  alerts: ThreatAlert[];
}
```

### 3.3 Data Consumption Flow (`/api/v1/alerts/route.ts`)
```
[External Public Health Sources]
             │
             │ (npm run scrape)
             ▼
[data/threat_alerts.json] (Disk Cache)
             │
             ▼ (fs.promises.readFile with fallback to default seed)
[src/app/api/v1/alerts/route.ts] (Next.js Route Handler)
             │
             ▼ (JSON response with HTTP Cache headers)
[src/app/dashboard/page.tsx] (Client Component fetch via useEffect)
             │
             ▼
[Live Alerts Tabular Section with StampBadge & Filter Controls]
```

**Implementation Pattern for `src/app/api/v1/alerts/route.ts`**:
```typescript
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { DEFAULT_THREAT_ALERTS } from "@/lib/default_alerts";

export async function GET(req: Request) {
  const filePath = path.join(process.cwd(), "data", "threat_alerts.json");
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return NextResponse.json({
      success: true,
      source: "live_cache",
      ...parsed,
    });
  } catch {
    // Graceful fallback to verified static seed
    return NextResponse.json({
      success: true,
      source: "fallback",
      lastUpdated: new Date().toISOString(),
      count: DEFAULT_THREAT_ALERTS.length,
      sourcesScraped: ["NCB National Archive", "WHO Surveillance Reference"],
      alerts: DEFAULT_THREAT_ALERTS,
    });
  }
}
```

### 3.4 Integration of Commands & Lifecycle Coordination
In `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run --config tests/vitest.config.mjs",
    "scrape": "node --experimental-strip-types scripts/scrape.ts",
    "postinstall": "prisma generate"
  }
}
```

- **`npm run test`**: Runs Vitest against the calibration matrix test suite (`src/lib/engine.test.ts` or `tests/m2_accuracy_calibration.test.ts`) to programmatically verify that >=95% of synthetic mock samples under lighting variance map correctly to reagent profiles, alongside Milestone 1 shell/component tests.
- **`npm run scrape`**: Executes the safe scraping engine, pulls alerts respecting `robots.txt`, and writes structured JSON to `data/threat_alerts.json` without crashing or throwing unhandled rejections.
- **`npm run build`**: Builds the production bundle (`next build`). Because the alerts data is consumed via the `/api/v1/alerts` route with a built-in fallback, `npm run build` is 100% decoupled from whether `npm run scrape` has been executed or if network access is available.

---

## 4. Caveats
1. **Network Availability in CI/Docker**: The scraper in `npm run scrape` may run in an offline or sandboxed environment. The scraper must handle `ENOTFOUND` or fetch timeouts by writing a fallback dataset or exiting gracefully with code 0.
2. **Path Alias in Vitest**: Vitest requires `--config tests/vitest.config.mjs` (or a root `vitest.config.ts`) because `tsconfig.json` path aliases (`@/*`) are not auto-resolved by Vitest without an explicit alias configuration.
3. **Existing Dashboard Telemetry Mapping**: As noted in Observation 1.1, the stats adapter in `src/app/dashboard/page.tsx` should be updated to read `data.total_tests ?? data.total ?? 0` and `data.by_result?.positive ?? 0` to prevent undefined display values.

---

## 5. Conclusion
The dashboard UI design for Live Alerts can be seamlessly integrated into `src/app/dashboard/page.tsx` as a full-width, GIGW 3.0-compliant dense data table powered by `StampBadge` and `StateEmblem`. Consuming the scraped data through `GET /api/v1/alerts` with an offline fallback guarantees that `npm run build`, `npm run scrape`, and `npm run test` remain robust, independent, and compliant with all authoritative acceptance criteria.

---

## 6. Verification Method

### 6.1 Automated Verification Commands
1. **Test Suite Verification**:
   ```bash
   npx vitest run --config tests/vitest.config.mjs tests/m1_shell_badge_emblem.test.tsx
   ```
   *Expected*: 13 tests pass.
2. **Production Build Verification**:
   ```bash
   npm run build
   ```
   *Expected*: Exits with code 0, Turbopack completes in <5s with 0 errors.
3. **Scraper Script Execution**:
   ```bash
   npm run scrape
   ```
   *Expected*: Exits with code 0, generates valid `data/threat_alerts.json`.
4. **Alerts API Route Endpoint**:
   ```bash
   curl -i http://localhost:3000/api/v1/alerts
   ```
   *Expected*: HTTP 200 OK with `ThreatAlertsPayload` JSON structure.

### 6.2 Visual Inspection Checklist (`/dashboard`)
- [ ] Prominent "Live Threat Alerts" table rendered across the full grid width (`col-span-3`).
- [ ] High-contrast header with bilingual title ("राष्ट्रीय मादक पदार्थ चेतावनी प्रणाली / National Drug Threat Advisories").
- [ ] Correct `StampBadge` color variant rendered per threat level (Red for Critical, Saffron for High, Brass for Elevated, Navy for Advisory).
- [ ] Filter controls (All, Critical, High, Moderate) and refresh button operational.
- [ ] Graceful empty state renders if no alerts are present, without throwing React runtime errors.
- [ ] No glassmorphism, no gradient backgrounds, and no spring animations present.
