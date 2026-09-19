# Project: Forensic Drug Testing Analysis Engine Calibration & Live Threat Pipeline

## Architecture
- **Framework**: Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript 5.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`, `globals.css` with `@theme inline`), UX4G / GIGW 3.0.
- **Core Forensic Engine (`src/lib/engine.ts`)**:
  - Color space conversion: sRGB -> CIE XYZ -> CIE L*a*b* (D65 2°).
  - CIEDE2000 color difference formula (CIE 142-2001 standard angle wrapping).
  - Lighting-invariant calibration (`calibrateColor` with low-luma threshold 20).
  - Spot test classification (`classifySpotTest` with symmetric candidate minimization and $k_L = 1.5$).
  - Web Crypto SHA-256 evidence hashing.
- **Web Scraping Pipeline (`src/lib/scraper/`, `scripts/scrape.ts`)**:
  - Node 24 native fetch + AbortSignal timeout (8000ms).
  - 5-layer safe infrastructure: robots.txt engine, origin rate limiter (1500ms + jitter), timeout guard, source error isolation, offline fallback cache.
  - Multi-source ingestion: openFDA API, DrugsData, DEA/UNODC/NCB synthetic threat bulletins.
  - Colorimetric cross-referencing: matching substances to `src/lib/color_library.json`.
  - CLI runner: `"scrape": "node --experimental-strip-types scripts/scrape.ts"`.
  - Output artifact: `data/threat_alerts.json` (and `src/data/threat_alerts.json`).
- **Dashboard UI & API (`src/app/dashboard/page.tsx`, `src/app/api/v1/alerts/route.ts`)**:
  - API route `GET /api/v1/alerts`: dynamic file reader with in-memory seed fallback.
  - Full-width "Live Alerts" tabular section conforming to GIGW 3.0 / UX4G.
  - Reusable components: `<StampBadge size="sm" />`, `<StateEmblem size={44} />`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | CIEDE2000 Math Standardization | Fix angle wrapping and zero guards in `deltaE00` per CIE 142-2001. | M1 | R1, survey_1 |
| F2 | Low-Luma Calibration Guard Tuning | Lower `calibrateColor` threshold from 50 to 20 to preserve shadow/dim ambient captures. | M1 | R1, survey_1 |
| F3 | Symmetric Minimization & kL Scaling | Fix `classifySpotTest` asymmetric loop bug; set $k_L=1.5$ to decouple illumination from chromaticity. | M1 | R1, survey_1 |
| F4 | Synthetic Lighting Test Suite (>=95%) | Automated Vitest test suite (`npm run test`) verifying >=95% accuracy across 10 lighting conditions. | M1 | R1, AC, survey_1 |
| F5 | Safe Scraping Infrastructure | In-memory `robots.txt` parser, domain rate limiter (1500ms + jitter), 8s timeout, error isolation. | M2 | R2, R3, survey_2 |
| F6 | Multi-Source Threat Data Ingestion | Fetch openFDA, synthetic drug threat bulletins, and cross-reference with `color_library.json`. | M2 | R2, survey_2 |
| F7 | Programmatic Scrape Command | CLI command `"scrape": "node --experimental-strip-types scripts/scrape.ts"` generating structured JSON. | M2 | R2, AC, survey_2 |
| F8 | Offline Fallback Dataset | Pre-seeded fallback dataset ensuring 100% crash-free operation in air-gapped or network-down environments. | M2 | R3, survey_2 |
| F9 | Alerts API Route Handler | Next.js API route `GET /api/v1/alerts` serving threat data with fallback seed. | M3 | survey_3 |
| F10 | Live Alerts Dashboard Section | Dedicated 5-column GIGW 3.0 tabular section in `src/app/dashboard/page.tsx` with StampBadge styling. | M3 | AC, survey_3 |
| F11 | Dashboard Telemetry Fix | Correct stats adapter in `src/app/dashboard/page.tsx` to read `data.total_tests` and `data.by_result`. | M3 | survey_3 |
| F12 | Full Acceptance & Build Verification | Verify `npm run test` (>=95%), `npm run scrape`, and clean `npm run build` (Turbopack). | M4 | AC, survey_3 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Accuracy Calibration & Test Suite | `src/lib/engine.ts`, `src/lib/engine.test.ts`, `src/lib/color_matrix.test.ts`, `package.json` test script. | None | DONE |
| M2 | Web Scraping Pipeline & Safe Infra | `src/lib/scraper/**`, `scripts/scrape.ts`, `src/data/**`, `data/**`, `package.json` scrape script. | None | DONE |
| M3 | Live Alerts Dashboard UI & API Integration | `src/app/api/v1/alerts/route.ts`, `src/app/dashboard/page.tsx`. | M2 Contract | DONE |
| M4 | Full System Verification & Audit Gate | Run test suite, run scrape, verify build, review, challenge, and forensic audit. | M1, M2, M3 | DONE |

---

## Code Layout & Write Boundaries
- **Exclusive Worker M1**:
  - `src/lib/engine.ts`
  - `src/lib/engine.test.ts`
  - `src/lib/color_matrix.test.ts`
  - `package.json` (test script addition)
- **Exclusive Worker M2**:
  - `src/lib/scraper/**`
  - `scripts/scrape.ts`
  - `src/data/threat_alerts.json`
  - `src/data/threat_alerts_fallback.json`
  - `data/threat_alerts.json`
  - `package.json` (scrape script addition)
- **Exclusive Worker M3**:
  - `src/app/api/v1/alerts/route.ts`
  - `src/app/dashboard/page.tsx`
  - `src/lib/default_alerts.ts` (if needed for API route fallback seed)
- **Shared / Read-Only**:
  - `src/lib/color_library.json`
  - `tests/vitest.config.mjs`
  - `src/components/ui/StampBadge.tsx`
  - `src/components/ui/StateEmblem.tsx`

---

## Interface Contracts

### 1. Engine ↔ Test Harness (`M1` ↔ `npm run test`)
- `calibrateColor(rawSpot: number[], rawWhite: number[]): number[]`
  - Clamps output RGB to [0, 255].
  - Threshold: `lumaWhite < 20` returns `rawSpot`.
  - Invariant test vector `calibrateColor([50,75,100], [10,10,10])` returns `[50, 75, 100]`.
- `classifySpotTest(testRGB: number[], reagent: string): { result: "positive" | "negative" | "inconclusive", distance: number }`
  - Symmetric minimization across all library profiles for the given reagent.
  - $k_L = 1.5, k_C = 1.0, k_H = 1.0$.
  - Invariant test vectors:
    - `classifySpotTest([16,6,13], "Marquis")` => `"positive"`
    - `classifySpotTest([215,209,199], "Marquis")` => `"negative"`
    - `classifySpotTest([0,0,255], "Marquis")` => `"inconclusive"`
    - `classifySpotTest([100,100,100], "NonExistent")` => `"inconclusive"`

### 2. Scraper Output ↔ API Route (`M2` ↔ `src/app/api/v1/alerts/route.ts`)
- File path: `data/threat_alerts.json` and `src/data/threat_alerts.json`.
- Schema: `ThreatAlertsPayload`
  ```typescript
  export interface ThreatAlert {
    id: string;
    source: string;
    substance: string;
    category: string;
    threatLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE" | "ADVISORY";
    publishedAt: string;
    region: string;
    summary: string;
    details?: string;
    reagentGuidance?: {
      reagent: string;
      expectedReaction: string;
      rgbTarget?: [number, number, number];
      cautionNote?: string;
    };
    status: "ACTIVE" | "MONITORING" | "RESOLVED";
    url: string;
  }
  ```

### 3. API Route ↔ Dashboard UI (`M2/M3` ↔ `src/app/dashboard/page.tsx`)
- Endpoint: `GET /api/v1/alerts`
- Returns: `200 OK` with JSON matching `ThreatAlertsPayload`.
- UI renders 5 columns: Date/Timestamp, Threat Level, Substance & Category, Agency & Region, Advisory Summary & Reagent Marker.
