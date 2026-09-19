# Project: Forensic Drug Testing Government UI Transformation (UX4G & GIGW 3.0)

## Architecture
- **Framework**: Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`, `globals.css` with `@theme inline`).
- **Design Standard**: Digital India UX4G & GIGW 3.0 (Guidelines for Indian Government Websites).
- **Core Domain & Security Engines (STRICT NON-TOUCH)**:
  - CIEDE2000 color difference computation (`src/lib/engine.ts`).
  - Web Crypto SHA-256 evidence hashing (`src/lib/engine.ts`).
  - Reference white & reagent spot pixel extraction on hidden `<canvas>` (`src/app/capture/page.tsx`).
  - Prisma ORM 5.22 & PostgreSQL database schema (`prisma/schema.prisma`, `src/lib/prisma.ts`).
- **Presentation Layer (TARGET OF REFACTORING)**:
  - Global Shell & Header: `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ui/StampBadge.tsx`.
  - Application Pages: `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/capture/page.tsx`, `src/app/ledger/page.tsx`, `src/app/result/[id]/page.tsx`, `src/app/logs/page.tsx`, `src/app/logs/[id]/page.tsx`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | DBIM & UX4G Palette Tokens | High-contrast palette: Navy Blue (#003366), Saffron (#FF9933), Green (#138808), Stark White (#FFFFFF), Canvas (#F4F6F9), Slate Borders (#CBD5E1). Fix `--color-navy` and `--color-brass`. | M1 | R1, survey_1 |
| F2 | GIGW 3.0 Official Header & Shell | Official Government of India top strip, National Emblem placeholder, accessibility controls bar (A-/A/A+), unified navigation, remove noise SVG and radial grid dots. | M1 | R1, R2, survey_1 |
| F3 | Glassmorphism & Gradient Elimination | Remove all `backdrop-blur`, `bg-white/10`, `border-white/20`, `bg-gradient-to-*` across all layout and component files. | M1, M2, M3, M4 | R1, survey_2 |
| F4 | Animation & Motion Sanitization | Remove all `framer-motion` spring animations, infinite glow pulses, scan-lines, and ping animations in favor of static high-contrast UI states. | M2, M3, M4 | R1, survey_2 |
| F5 | Traditional Dense Dashboard Portal | Replace Bento-Box rounded-3xl floating cards with traditional, information-heavy government portal: official banner, metrics table/cards with solid borders, dense action table, correct stats API mapping. | M2 | R2, survey_2 |
| F6 | Forensic Capture Chamber UI | Redesign capture UI into official "Form 4A Sample Evidence Digitization & Analysis Chamber" with strict borders and dense parameter forms, eliminating rounded-3xl cards while preserving 100% of hidden canvas extraction and state pipeline. | M3 | R1, R2, R3, survey_3 |
| F7 | Strict Forensic Core Logic Preservation | Invariant: Zero modifications to CIEDE2000 math, SHA-256 hashing, canvas pixel sampling coordinates (20% white patch, 65% test spot), and Prisma sync APIs. | M3 | R3, survey_3 |
| F8 | Records, Ledger & Logs Harmonization | Redesign `/logs` and `/logs/[id]` from cyberpunk dark theme into authoritative government audit registry matching `/ledger` and formal Form 4A certificate styling. | M4 | R1, R2, survey_2 |
| F9 | Clean Build & Typecheck Verification | App builds cleanly (`npm run build`) and typechecks (`npx tsc --noEmit`) without Tailwind or TS errors. | M5 | Acceptance Criteria |
| F10 | Comprehensive Opaque-Box E2E Test Suite | Automated test suite verifying GIGW compliance, absence of glassmorphic classes, presence of gov branding, and intact forensic math. | E2E Track | Dual Track |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | UX4G Design System & Global Shell | `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/StampBadge.tsx`, navigation, emblem placeholder, accessibility strip. | None | DONE |
| M2 | Dashboard & Portal Layout Redesign | `src/app/page.tsx`, `src/app/dashboard/page.tsx`, statistics table, operational actions. | M1 | PLANNED |
| M3 | Forensic Capture UI Transformation | `src/app/capture/page.tsx` presentation refactoring with strict non-touch preservation of hidden canvas extraction & hashing. | M1 | PLANNED |
| M4 | Records, Ledger & Audit Trail Harmonization | `src/app/ledger/page.tsx`, `src/app/logs/page.tsx`, `src/app/logs/[id]/page.tsx`, `src/app/result/[id]/page.tsx`. | M1 | PLANNED |
| M5 | Final Milestone: 100% E2E Test Pass & Coverage Hardening | Run and pass 100% of E2E test suite (Tiers 1-4) then white-box adversarial hardening (Tier 5). | M2, M3, M4, E2E Track | PLANNED |
| E2E | E2E Testing Track | Design and construct opaque-box test suite (Tiers 1-4) and publish `TEST_READY.md`. | M1 (Parallel to M2-M4) | PLANNED |

---

## Code Layout & Write Boundaries
- **Exclusive Worker M1**:
  - `src/app/globals.css`
  - `src/app/layout.tsx`
  - `src/components/ui/StampBadge.tsx`
  - `public/` (removal of noise.svg or addition of gov emblem placeholder)
- **Exclusive Worker M2**:
  - `src/app/dashboard/page.tsx`
  - `src/app/page.tsx`
- **Exclusive Worker M3**:
  - `src/app/capture/page.tsx` (presentation only!)
- **Exclusive Worker M4**:
  - `src/app/ledger/page.tsx`
  - `src/app/logs/page.tsx`
  - `src/app/logs/[id]/page.tsx`
  - `src/app/result/[id]/page.tsx`
- **Exclusive E2E Testing Track**:
  - `tests/e2e/**` or test scripts outside `src/app/`
  - `TEST_INFRA.md`, `TEST_READY.md`
- **STRICT NON-TOUCH FILES (ALL WORKERS)**:
  - `src/lib/engine.ts`
  - `src/lib/color_library.json`
  - `src/lib/prisma.ts`
  - `prisma/schema.prisma`
  - `src/app/api/v1/**`

---

## Interface Contracts

### 1. Global Shell ↔ Application Pages (`M1` ↔ `M2, M3, M4`)
- Shell provides standard GIGW 3.0 header, navigation bar (`/dashboard`, `/capture`, `/ledger`), accessibility toolbar, and breadcrumb container.
- Theme tokens:
  - Primary / Nav: `bg-[#003366]` (Navy Blue)
  - Surface: `bg-[#FFFFFF]` (Stark White), Canvas: `bg-[#F4F6F9]`
  - Borders: `border-[#CBD5E1]` or `border-slate-300` (Dense 1px solid borders)
  - Semantic status: Positive `text-[#138808]`, Flagged/Narcotics `text-[#B91C1C]`, Saffron accent `bg-[#FF9933]`
  - StampBadge component accepts `{ variant?: "navy" | "brass" | "saffron" | "green", text: string }`.

### 2. Forensic Capture UI ↔ Forensic Engine (`M3` ↔ `src/lib/engine.ts`)
- `<canvas ref={canvasRef} style={{ display: "none" }} />` must be retained in the DOM.
- Canvas extraction sampling points must strictly remain:
  - Reference White: `x = img.width * 0.20`, `y = img.height * 0.50`
  - Sample Spot: `x = img.width * 0.65`, `y = img.height * 0.50`
- Extracted colors must be passed to `calibrateColor(sampleRgb, refRgb)` and `classifySpotTest(calibratedRgb)`.
- Image buffer must be passed to `generateSHA256(arrayBuffer)` before syncing.
- Submission payload to `/api/v1/tests/sync` must maintain exact schema:
  - `test_id`, `substance_detected`, `delta_e`, `confidence`, `sha256_hash`, `calibrated_rgb`, `officer_badge_no`, `jurisdiction`, `timestamp`.

### 3. Dashboard ↔ Stats API (`M2` ↔ `/api/v1/dashboard/stats`)
- API Response Schema:
  ```json
  {
    "total_tests": number,
    "by_result": {
      "positive": number,
      "negative": number,
      "inconclusive": number
    },
    "failed_calibration_count": number
  }
  ```
- Dashboard UI will map `total_tests` and `by_result.*` directly to the official government metrics summary table.
