# Comprehensive Survey: Build Setup, Styling Architecture, Configuration & Theme Foundations

**Date**: 2026-09-19  
**Target Goal**: Digital India UX4G & GIGW 3.0 Compliance Transformation  
**Application**: NCB Advanced Analytics (Field Forensic Drug Testing Companion)  
**Status**: Read-Only Baseline Architectural Survey Completed

---

## Executive Summary

The project is a Next.js (App Router) progressive web application designed for field narcotics testing. While parts of the application (such as the Certificate of Analysis and Login screen) attempted pseudo-governmental styling with hardcoded hex values, other parts (specifically the Dashboard, Capture interface, and Logs) feature classic "startup / glassmorphic / cyberpunk" aesthetics: `backdrop-blur-xl`, indigo-purple gradients, floating Bento cards, glowing circular drop shadows, background SVG noise filters, and `framer-motion` spring animations.

The build system is running on **Next.js 16.3.5 (Turbopack)**, **React 19.2.8**, and **Tailwind CSS v4** with `@tailwindcss/postcss`. The baseline production build (`npm run build`) and typecheck (`npx tsc --noEmit`) compile with **0 errors**.

This report provides the exhaustive technical inventory across the 5 required survey domains to guide the UX4G / GIGW 3.0 transformation.

---

## 1. Build Setup, Dependencies & Configuration Survey

### 1.1 Package Manager & Core Dependencies
- **Package Manager**: `npm` (evidenced by `package-lock.json` and `.npmrc`).
- **Framework & Core Runtime**:
  - `next`: `16.3.5` (App Router with Turbopack enabled)
  - `react`: `19.2.8`
  - `react-dom`: `19.2.8`
  - `typescript`: `^5` (TypeScript 5.x)
- **Styling & UI**:
  - `tailwindcss`: `^4` (Tailwind CSS v4)
  - `@tailwindcss/postcss`: `^4`
  - `framer-motion`: `^13.4.0` (target for removal/simplification in UI layers)
  - `lucide-react`: `^1.47.0` (iconography)
  - `sonner`: `^2.0.8` (toast notifications)
  - `clsx`: `^2.1.1` and `tailwind-merge`: `^3.7.0` (class utilities via `cn` in `src/lib/utils.ts`)
- **Backend & Database**:
  - `@prisma/client`: `^5.22.0`
  - `prisma`: `^5.22.0` (schema at `prisma/schema.prisma` targeting PostgreSQL via `DATABASE_URL` / `DIRECT_URL`)
- **Forensic Math, Image & Hardware Libraries**:
  - `delta-e`: `^0.0.8`
  - `color-convert`: `^3.1.3`
  - `canvas`: `^3.2.3`
  - `sharp`: `^0.35.4`
  - `react-webcam`: `^7.2.0`
  - `pdf-parse`: `^2.4.5`, `pdfreader`: `^3.0.8`
- **PWA Capabilities**:
  - `@ducanh2912/next-pwa`: `^10.2.9`
  - `next-pwa`: `^5.6.0`

### 1.2 TypeScript Configuration (`tsconfig.json`)
- **Target**: `ES2017`
- **Module & Resolution**: `module: "esnext"`, `moduleResolution: "bundler"`
- **Strictness**: `strict: true`, `noEmit: true`, `skipLibCheck: true`
- **Path Aliases**: `"@/*": ["./src/*"]`
- **Excludes**: `["**/*.test.ts", "node_modules"]` (Note: `src/lib/engine.test.ts` is explicitly excluded from TS compilation)

### 1.3 Next.js Configuration (`next.config.ts`)
```ts
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

module.exports = withPWA(nextConfig);
```

### 1.4 Tailwind CSS Architecture (Tailwind v4)
- **PostCSS Configuration (`postcss.config.mjs`)**:
  ```js
  const config = {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  };
  export default config;
  ```
- **Global Stylesheet (`src/app/globals.css`)**:
  Uses modern Tailwind v4 directive `@import "tailwindcss";` followed by `@theme inline { ... }`.
  Current theme declaration:
  ```css
  @import "tailwindcss";

  @theme inline {
    --color-gov-blue: #0F2862;
    --color-gov-gold: #D4AF37;
    --color-gov-green: #138808;
    --color-gov-orange: #FF9933;
    --color-gov-light: #F8FAFC;
    --color-gov-dark: #0F172A;
    
    --animate-scan-line: scan 2s linear infinite;
    --animate-pulse-slow: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    --animate-fade-in-up: fadeInUp 0.5s ease-out forwards;
    ...
  }
  ```
- **Legacy Config (`tailwind.config.ts`)**:
  Still present with duplicated color extensions (`gov.blue: #0F2862`, etc.). In Tailwind v4, `@theme inline` in CSS takes direct effect.

---

## 2. Existing Styling System & Page-by-Page Audit

### 2.1 Colors, Fonts, Shadows & Utilities
- **Color System Status**:
  - `globals.css` currently sets `--color-gov-blue: #0F2862` (a royal navy), `--color-gov-orange: #FF9933`, and `--color-gov-green: #138808`.
  - However, across different pages, developers bypassed theme variables and hardcoded arbitrary hex values:
    - `#003366` in `page.tsx`, `ledger/page.tsx`, `result/[id]/page.tsx`
    - `#0B192C` and `#1E3E62` (cyberpunk navy/slate) and `#FF6500` (neon orange) in `logs/page.tsx`
    - `from-indigo-500 to-purple-600` in `dashboard/page.tsx`
  - **Undefined CSS Variable Bug**: In `src/components/ui/StampBadge.tsx` and `src/app/logs/[id]/page.tsx`, classes `text-[var(--color-navy)]` and `text-[var(--color-brass)]` are used, but `--color-navy` and `--color-brass` are **not defined** anywhere in `globals.css`!
- **Typography**:
  - `Inter` from `next/font/google` is loaded in `src/app/layout.tsx` (`subsets: ["latin"], variable: "--font-inter"`).
  - Applied to `<body>` as `${inter.variable} font-sans`.
  - In `logs/page.tsx`, `font-mono` is globally forced.
- **Shadows**:
  - Heavy glow shadows are present: `shadow-lg shadow-blue-900/20`, `shadow-indigo-500/25`, `shadow-[0_0_15px_rgba(52,211,153,0.8)]`.
  - GIGW 3.0 requires clean, subtle or flat border structures rather than floating colored glow drop shadows.

### 2.2 Detailed Visual Audit by Route

| Route | Current Aesthetic | Key Styling Characteristics | GIGW / UX4G Compliance Issues |
|---|---|---|---|
| **`/` (Login)** | Semi-official form | Hardcoded `#003366`, `#FF9933`, Landmark icon with "सत्यमेव जयते", NIC footer | Hardcoded hexes; lacks standard GIGW top accessibility bar; non-standard emblem; needs unified design tokens. |
| **`/dashboard`** | Startup / Bento-box | `bg-white/70 backdrop-blur-xl`, `from-indigo-500 to-purple-600`, `rounded-3xl`, framer-motion springs (`damping: 24`), blurred circular glows | Non-compliant layout; floating bento cards; heavy startup glassmorphism; spring animations violate accessibility. |
| **`/capture`** | High-tech scanner | `backdrop-blur-xl`, `bg-gradient-to-r from-gov-blue to-blue-700`, `rounded-3xl`, indigo glows, `AnimatePresence` springs | Glassmorphic headers; non-government indigo accent colors; spring animations on submit button. |
| **`/ledger`** | Semi-official ledger | Clean table with `#003366` header, Section 65B citation | Inconsistent standalone header; lacks Gov of India super-header and accessibility controls; needs standard Gov table styling. |
| **`/logs`** | Cyberpunk Dark Mode | `bg-[#0B192C] font-mono`, `bg-[#1E3E62]/50 backdrop-blur-md`, neon `#FF6500`, framer-motion stagger | **Major Violation**: Completely breaks government visual identity. Dark hacker theme incompatible with GIGW 3.0. |
| **`/logs/[id]`** | Card-based detail | Uses undefined `var(--color-navy)` and `var(--color-brass)`, `rounded-3xl` card, `bg-gray-900` code block | Broken CSS variables; floating card structure instead of formal government dossier. |
| **`/result/[id]`** | A4 Certificate of Analysis | Official printable Form 4A, Landmark watermark, digital signature block, high-contrast table | Strongest existing structure; needs unification with official SVG emblem, DBIM color variables, and GIGW header/footer. |

---

## 3. Inventory of Startup & Glassmorphic Elements to Eliminate

Per **Requirement R1** and **Acceptance Criteria**, the following elements must be completely eliminated:

### 3.1 Glassmorphic Styles (`backdrop-blur`)
1. `src/app/dashboard/page.tsx:28`:
   `<header className="sticky top-1.5 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">`
2. `src/app/capture/page.tsx:114`:
   `<header className="sticky top-1.5 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">`
3. `src/app/capture/page.tsx:151`:
   `<button ... className="absolute top-3 right-3 bg-black/50 backdrop-blur-md ...">`
4. `src/app/logs/page.tsx:20`:
   `<div className="p-4 bg-[#1E3E62]/50 border-b border-[#1E3E62] ... backdrop-blur-md">`

### 3.2 SVG Noise Textures & Radial Grids
1. `public/noise.svg` (272 bytes filter texture).
2. `src/app/layout.tsx:39`:
   `<div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>`
3. `src/app/layout.tsx:40`:
   `<div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>`

### 3.3 Pastel, Startup & Multi-stop Gradients
1. `src/app/layout.tsx:35`:
   `<div className="h-1.5 w-full bg-gradient-to-r from-gov-orange via-white to-gov-green opacity-90 shadow-sm z-50 fixed top-0" />`
   *(Should be replaced by a clean, solid Indian Tricolor band: Saffron, White, Green)*
2. `src/app/dashboard/page.tsx:31`:
   `<div className="... bg-gradient-to-br from-gov-blue to-blue-800 ...">`
3. `src/app/dashboard/page.tsx:71`:
   `<Link href="/capture" className="... bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl ...">`
4. `src/app/capture/page.tsx:196`:
   `<button ... className="... bg-gradient-to-r from-gov-blue to-blue-700 hover:shadow-blue-900/30 ...">`

### 3.4 Motion Libraries & Spring Animations
1. `src/app/dashboard/page.tsx:6`:
   `import { motion } from "framer-motion";` with spring physics `{ type: "spring", stiffness: 300, damping: 24 }`
2. `src/app/capture/page.tsx:9`:
   `import { motion, AnimatePresence } from "framer-motion";` with spring transitions `{ type: "spring", stiffness: 300, damping: 20 }`
3. `src/app/logs/page.tsx:6`:
   `import { motion } from "framer-motion";` with staggered card transitions.

---

## 4. Digital India UX4G / GIGW 3.0 Government Foundations & Assets

### 4.1 Asset Inventory (`public/`)
- **Currently in `public/`**:
  - `noise.svg` (To be removed from DOM rendering)
  - `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` (Next.js starter templates)
  - `icon-192.png`, `icon-512.png`, `icons/icon-192x192.png`, `icons/icon-512x512.png` (PWA app icons)
  - `manifest.json`, `sw.js` (PWA service worker)
- **Assets Needed for GIGW 3.0 / UX4G**:
  1. **State Emblem of India (Lion Capital of Ashoka with "सत्यमेव जयते")**:
     - Currently simulated through Lucide's `Landmark` icon + small text `<span className="text-[6px]">सत्यमेव जयते</span>`.
     - An authoritative SVG vector or dedicated component for the National Emblem is required for the header and certificate.
  2. **Top Government Header Bar**:
     - "भारत सरकार | Government of India"
     - "गृह मंत्रालय | Ministry of Home Affairs"
     - "स्वापक नियंत्रण ब्यूरो | Narcotics Control Bureau (NCB)"
  3. **Accessibility Toolbar Component**:
     - Text resize buttons: `A-`, `A`, `A+`
     - High Contrast toggle
     - Language selector: `English` / `हिन्दी`
     - "Skip to Main Content" (`#main-content`) anchor for keyboard & screen-reader navigation (WCAG 2.1 Level AA requirement).
  4. **Solid Tri-color Border/Ribbon**:
     - Replaces pastel gradients with crisp 3px Indian Flag stripe: Saffron (`#FF9933`), White (`#FFFFFF`), Green (`#138808`).
  5. **Official NIC & Digital India Footer**:
     - Standardized across all pages: "Designed, Developed and Hosted by National Informatics Centre (NIC)", MHA disclaimer, IT Act 2000 warning, Section 65B Indian Evidence Act compliance statement, and security audit badge placeholder.

### 4.2 Standard DBIM / UX4G Color Palette Specification

To strictly adhere to the Digital Brand Identity Manual (DBIM) and UX4G design tokens, the color palette must be unified in `globals.css` and applied across components:

| Token Name | Hex Code | Purpose & Semantic Application |
|---|---|---|
| `--color-gov-navy` | `#003366` | Primary brand color: Top navigation header, primary buttons, major headings |
| `--color-gov-navy-dark`| `#072F5F` | Deep header bar background, active navigation tab, focus ring |
| `--color-gov-saffron` | `#FF9933` / `#E65100` | Accent color: Alert banners, active indicator tab, pending states |
| `--color-gov-green` | `#138808` / `#2E7D32` | Secondary accent: Negative test results (clear), digital verification badge |
| `--color-gov-red` | `#B91C1C` / `#991B1B` | High-contrast alert: Positive forensic test (narcotic detected) |
| `--color-gov-surface` | `#FFFFFF` | Stark white surface: Cards, tables, certificate canvas |
| `--color-gov-bg` | `#F4F6F9` | Light slate-gray canvas: Accessible neutral page background |
| `--color-gov-border` | `#CBD5E1` | Crisp 1px solid slate borders for tables, headers, and form inputs |
| `--color-gov-text` | `#0F172A` | Primary text (WCAG AAA compliant on white/light backgrounds) |
| `--color-gov-muted` | `#475569` | Secondary text, table headers, metadata |

---

## 5. Baseline Build, Lint & Test Health Check

### 5.1 Build Command (`npm run build`)
- **Status**: **PASSED** (Exit Code 0).
- **Tooling**: Next.js 16.3.5 (Turbopack).
- **Output Summary**:
  - Compiled successfully in 1695ms.
  - 11 routes successfully prerendered / dynamic compiled:
    - `○ /` (Login)
    - `○ /capture` (Camera & manual analysis)
    - `○ /dashboard` (Operator dashboard)
    - `○ /ledger` (Evidence ledger)
    - `○ /logs` (Forensic logs)
    - `ƒ /logs/[id]` (Log detail)
    - `ƒ /result/[id]` (Official analysis report)
    - `ƒ /api/v1/dashboard/stats`
    - `ƒ /api/v1/tests`
    - `ƒ /api/v1/tests/[id]`
    - `ƒ /api/v1/tests/sync`

### 5.2 TypeScript Check (`npx tsc --noEmit`)
- **Status**: **PASSED** (Exit Code 0). No TypeScript errors in application code.

### 5.3 Test Suite Baseline (`npx vitest run`)
- **Status**: **FAILED** (6 tests failed in `src/lib/engine.test.ts`).
- **Root Cause**: `src/lib/engine.test.ts` imports an obsolete `classifyResult({ r, g, b })` function that was refactored in `src/lib/engine.ts` to `calibrateColor(rawSpot: number[], rawWhite: number[])` and `classifySpotTest(testRGB: number[], reagent: string)`.
- **Note**: `src/lib/engine.test.ts` is explicitly excluded from `tsconfig.json` and there is no `"test"` script in `package.json`. It does not affect production build.

### 5.4 ESLint Baseline (`npm run lint`)
- **Status**: Fails with 82 errors / 12 warnings.
- **Root Causes**:
  - The root directory contains numerous scratch/utility scripts (`test_engine.js`, `test_api.js`, `swap_logic.js`, etc.) using `require()` syntax. `eslint.config.mjs` was not configured to ignore root JS files.
  - In `src/app/result/[id]/page.tsx`, ESLint reports an impure `Math.random` call in render (generating fake QR code blocks) and unescaped double quotes `"` in JSX.

### 5.5 Discrepancy Found in Existing Dashboard Telemetry
- In `src/app/dashboard/page.tsx:12`:
  `fetch("/api/v1/dashboard/stats").then(r => r.json()).then(setStats)`
- In `src/app/api/v1/dashboard/stats/route.ts`:
  The API returns:
  ```json
  {
    "total_tests": 7,
    "by_result": { "positive": 2, "negative": 4, "inconclusive": 1 },
    "failed_calibration_count": 0
  }
  ```
  The dashboard state expects `{ total: 0, positive: 0, negative: 0, inconclusive: 0 }`. Because keys do not match (`total` vs `total_tests`, `positive` vs `by_result.positive`), the dashboard currently displays `undefined` or zeroes. This is an important defect to rectify during the dashboard rewrite.

---

## 6. Recommended Action Plan for Implementation

1. **Shared Government Header & Navigation Layout (`src/app/layout.tsx`)**:
   - Strip `noise.svg` and `radial-gradient` background layers.
   - Strip multi-stop gradients; install a clean 3px Indian Flag top bar (`#FF9933` / `#FFFFFF` / `#138808`).
   - Implement universal GIGW 3.0 Top Bar with "Government of India | भारत सरकार", Ministry of Home Affairs, and accessibility controls (A-/A/A+, contrast, language, skip to content).
   - Provide an authoritative official National Emblem component.
   - Create a unified Navy Blue (`#003366`) navigation bar linking Dashboard, Target Scan, Ledger, and Dossier.

2. **Dashboard Redesign (`src/app/dashboard/page.tsx`)**:
   - Replace Bento-box cards and indigo/purple gradients with a dense, structured, information-heavy government portal layout.
   - Clean tabular/grid metrics for Live Telemetry (Total Tests, Confirmed Positive, Negative / Cleared, Inconclusive).
   - Fix the API mapping for stats.
   - Remove `framer-motion` spring animations and replace with clean standard CSS transitions.

3. **Capture Interface Refactor (`src/app/capture/page.tsx`)**:
   - Preserve 100% of underlying forensic math, hidden canvas, GPS lock, and SHA-256 generation.
   - Replace glassmorphic header and rounded-3xl buttons with solid, high-contrast, utilitarian government controls (`#003366`, `#138808`).
   - Remove `framer-motion` AnimatePresence springs from the action button.

4. **Logs & Dossier Pages Refactor (`src/app/logs/page.tsx`, `src/app/logs/[id]/page.tsx`)**:
   - Eradicate the dark cyberpunk theme in `logs/page.tsx`. Convert to a high-density, searchable government ledger table matching `ledger/page.tsx`.
   - In `logs/[id]/page.tsx` and `StampBadge.tsx`, resolve undefined `--color-navy` and `--color-brass` CSS variables by binding them to the official palette (`--color-gov-navy`, `--color-gov-saffron`).

5. **Style Foundation Updates (`src/app/globals.css`)**:
   - Standardize official DBIM color tokens: Navy Blue `#003366` / `#072F5F`, Saffron `#FF9933` / `#E65100`, Green `#138808` / `#2E7D32`, Surface `#FFFFFF`, Canvas `#F4F6F9`, Borders `#CBD5E1`.
   - Ensure WCAG 2.1 AA contrast compliance across all text and interactive states.
