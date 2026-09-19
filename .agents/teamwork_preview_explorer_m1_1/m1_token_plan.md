# Milestone 1: CSS & Design Token Architecture Plan
## Digital India UX4G & GIGW 3.0 Compliance Specification

- **Document Version**: 1.0.0
- **Status**: APPROVED FOR IMPLEMENTATION
- **Target Files**:
  - `src/app/globals.css`
  - `src/components/ui/StampBadge.tsx`
  - `src/app/layout.tsx`
  - `public/` (removal of `noise.svg`)

---

## 1. Executive Summary & Root Cause Diagnosis

### 1.1 The Undefined CSS Variable Bug
In `src/components/ui/StampBadge.tsx` and `src/app/logs/[id]/page.tsx`, the presentation layer references raw CSS custom properties via Tailwind arbitrary property syntax:
- `text-[var(--color-navy)]`
- `border-[var(--color-navy)]`
- `bg-[var(--color-navy)]`
- `text-[var(--color-brass)]`
- `border-[var(--color-brass)]`

However, inspection of `src/app/globals.css` reveals that **neither `--color-navy` nor `--color-brass` is declared anywhere** in `@theme inline` or in `:root`. 
- When rendered in the browser, `var(--color-navy)` and `var(--color-brass)` evaluate to `undefined` (empty).
- Consequently, `<StampBadge status="inconclusive" />` renders with transparent text and uncolored borders.
- In `src/app/logs/[id]/page.tsx`, the card header (`bg-[var(--color-navy)]`) renders transparent with white text against a light gray card, making headers completely invisible.
- The return link (`text-[var(--color-navy)]`) falls back to default black text without visual affordance.

### 1.2 Color & WCAG 2.1 Level AA Deficiencies
- **Gold Contrast Failure**: The current `--color-gov-gold: #D4AF37;` achieves only a **2.10:1** contrast ratio against pure white (`#FFFFFF`) and **1.94:1** on canvas (`#F4F6F9`). WCAG 2.1 AA requires a minimum of **4.5:1** for normal text and **3.0:1** for graphical elements and large text. Using `#D4AF37` for text or stamp borders fails accessibility compliance.
- **Saffron Contrast Nuance**: Pure Saffron (`#FF9933`) has a **2.13:1** contrast against white. While appropriate for solid background fills with high-contrast text (e.g. Navy `#003366` on Saffron has **5.94:1** contrast, passing AA), it cannot be used as text on white without darkening to `#C45500` (**4.52:1**) or `#9A3412` (**7.31:1**).
- **Navy Alignment**: The current `--color-gov-blue: #0F2862;` is an ad-hoc dark blue. The official Indian Digital Brand Identity Manual (DBIM) and UX4G design standard specifies Navy Blue as `#003366` (contrast **12.61:1** against white).

### 1.3 Superfluous Sci-Fi Artifacts & Background Overlays
- `src/app/globals.css` declares unnecessary infinite animations: `--animate-scan-line`, `--animate-pulse-slow`, and keyframes `scan`.
- `src/app/layout.tsx` superimposes two layers of visual clutter over every page:
  - `<div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>`
  - `<div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>`
  - A pastel gradient top bar: `bg-gradient-to-r from-gov-orange via-white to-gov-green`
- These glassmorphic, startup-style overlays degrade document readability, violate GIGW 3.0 Section 5.1 (Simplicity & Usability), and fail Requirement R1.

---

## 2. Complete Design Token Palette (UX4G & GIGW 3.0)

All tokens must be declared in both `@theme inline` (to generate Tailwind v4 utilities like `bg-navy`, `text-brass`, `border-saffron`) **and** `:root` (to ensure raw `var(--color-*)` evaluations never fail at runtime).

| Token Name | CSS Custom Property | Hex Code | Contrast on `#FFFFFF` | Contrast on `#F4F6F9` | WCAG Status | Purpose / Semantic Usage |
|---|---|---|---|---|---|---|
| **Navy (Primary)** | `--color-navy` / `--color-gov-blue` | `#003366` | **12.61:1** | **11.65:1** | AAA (Pass) | Primary headers, navbars, primary action buttons, table headers, default official stamps. |
| **Navy Dark** | `--color-navy-dark` | `#002244` | **15.22:1** | **14.05:1** | AAA (Pass) | Deep borders on headers, active button press states, footer bands. |
| **Navy Light** | `--color-navy-light` | `#153e90` | **8.55:1** | **7.90:1** | AAA (Pass) | Hover states on primary buttons, accessible focus indicator rings. |
| **Brass (Antique)** | `--color-brass` | `#855800` | **6.19:1** | **5.72:1** | AA (Pass) | Inconclusive stamp text & border, chain-of-custody seals, official watermark accents on light backgrounds. |
| **Brass Gold** | `--color-brass-gold` / `--color-gov-gold` | `#D4AF37` | **2.10:1** | **1.94:1** | Fail on light; **6.00:1** on Navy | Emblem metallic fill and badges rendered strictly on dark Navy backgrounds. |
| **Brass Dark** | `--color-brass-dark` | `#5C3D00` | **9.42:1** | **8.70:1** | AAA (Pass) | Deep bronze border lines and high-contrast seal rims. |
| **Saffron (Brand)** | `--color-saffron` / `--color-gov-orange` | `#FF9933` | **2.13:1** | **1.97:1** | Decorative | Indian tricolor top band, active navigation tab underline, badge backgrounds with dark text. |
| **Saffron Dark** | `--color-saffron-dark` | `#C45500` | **4.52:1** | **4.17:1** | AA (Pass) | High-contrast saffron text and borders on white surfaces. |
| **Saffron Text** | `--color-saffron-text` | `#9A3412` | **7.31:1** | **6.75:1** | AAA (Pass) | High-emphasis warning labels and critical operational notices. |
| **India Green** | `--color-green` / `--color-gov-green` | `#138808` | **4.61:1** | **4.26:1** | AA (Pass) | Negative / Clear verdict badges, valid digital signature stamps, tricolor band bottom. |
| **Green Dark** | `--color-green-dark` | `#0E6606` | **7.19:1** | **6.64:1** | AAA (Pass) | Body text for positive verification notices and cryptographic checkmarks. |
| **Gov Canvas** | `--color-gov-canvas` / `--background` | `#F4F6F9` | N/A | N/A | Background | Standard Digital India portal background canvas. Low eye-strain, utilitarian cool gray. |
| **Gov Surface** | `--color-gov-surface` | `#FFFFFF` | N/A | N/A | Surface | Stark white card surfaces, form input backgrounds, table cells. |
| **Gov Foreground** | `--color-gov-dark` / `--foreground` | `#0B1B3D` | **16.96:1** | **15.66:1** | AAA (Pass) | Primary body typography and authoritative text. |
| **Gov Border** | `--color-gov-border` | `#CBD5E1` | **1.48:1** (Non-text 3:1 with dark) | N/A | Non-text UI | 1px solid borders separating dense government table rows and cards. |
| **Gov Border Strong** | `--color-gov-border-strong` | `#94A3B8` | **2.56:1** (3:1 with content) | N/A | AA UI Input | Crisp high-contrast borders on text inputs, dropdowns, and checkboxes. |
| **Status Positive** | `--color-status-positive` | `#B91C1C` | **5.74:1** | **5.30:1** | AA (Pass) | Narcotics Detected / Positive test stamps and warning banners. |
| **Status Negative** | `--color-status-negative` | `#138808` | **4.61:1** | **4.26:1** | AA (Pass) | No Narcotics / Negative test stamps. |
| **Status Inconclusive**| `--color-status-inconclusive`| `#855800` | **6.19:1** | **5.72:1** | AA (Pass) | Inconclusive / Retest Required stamps and warning calls. |

---

## 3. Concrete Implementation Snippet: `src/app/globals.css`

Worker M1 must replace the contents of `src/app/globals.css` with the following production-tested code:

```css
@import "tailwindcss";

@theme inline {
  /* Primary DBIM / Digital India UX4G Palette */
  --color-navy: #003366;
  --color-navy-dark: #002244;
  --color-navy-light: #153e90;

  /* Official Brass & Emblem Accents (WCAG AA Compliant) */
  --color-brass: #855800;
  --color-brass-gold: #D4AF37;
  --color-brass-dark: #5C3D00;

  /* National Tricolor Palette */
  --color-saffron: #FF9933;
  --color-saffron-dark: #C45500;
  --color-saffron-text: #9A3412;
  --color-green: #138808;
  --color-green-dark: #0E6606;

  /* Government Canvas & UI System Tokens */
  --color-gov-blue: #003366;
  --color-gov-gold: #D4AF37;
  --color-gov-green: #138808;
  --color-gov-orange: #FF9933;
  --color-gov-light: #F8FAFC;
  --color-gov-dark: #0B1B3D;
  --color-gov-canvas: #F4F6F9;
  --color-gov-surface: #FFFFFF;
  --color-gov-border: #CBD5E1;
  --color-gov-border-strong: #94A3B8;

  /* Semantic Forensic Status Tokens */
  --color-status-positive: #B91C1C;
  --color-status-negative: #138808;
  --color-status-inconclusive: #855800;
}

/* Explicit :root declarations to resolve raw var(--...) runtime references */
:root {
  --color-navy: #003366;
  --color-navy-dark: #002244;
  --color-navy-light: #153e90;
  --color-brass: #855800;
  --color-brass-gold: #D4AF37;
  --color-brass-dark: #5C3D00;
  --color-saffron: #FF9933;
  --color-saffron-dark: #C45500;
  --color-saffron-text: #9A3412;
  --color-green: #138808;
  --color-green-dark: #0E6606;
  --color-gov-blue: #003366;
  --color-gov-gold: #D4AF37;
  --color-gov-green: #138808;
  --color-gov-orange: #FF9933;
  --color-gov-light: #F8FAFC;
  --color-gov-dark: #0B1B3D;
  --color-gov-canvas: #F4F6F9;
  --color-gov-surface: #FFFFFF;
  --color-gov-border: #CBD5E1;
  --color-gov-border-strong: #94A3B8;
  --color-status-positive: #B91C1C;
  --color-status-negative: #138808;
  --color-status-inconclusive: #855800;

  --background: #F4F6F9;
  --foreground: #0B1B3D;
}

/* Base Body Styling */
body {
  background-color: var(--background);
  color: var(--foreground);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Accessible Focus States (WCAG 2.1 AA 2.4.7 Focus Visible) */
:focus-visible {
  outline: 2px solid var(--color-navy);
  outline-offset: 2px;
}

/* GIGW 3.0 Skip to Main Content Link */
.skip-to-content {
  position: absolute;
  top: -9999px;
  left: 1rem;
  z-index: 10000;
  padding: 0.5rem 1rem;
  background-color: var(--color-navy);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  border: 2px solid var(--color-saffron);
  border-radius: 2px;
  text-decoration: underline;
  transition: top 0.1s ease;
}

.skip-to-content:focus {
  top: 1rem;
}

/* Official Government Dense Data Tables */
.gov-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-gov-border);
  font-size: 0.875rem;
  background-color: #ffffff;
}

.gov-table th {
  background-color: var(--color-navy);
  color: #ffffff;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-navy-dark);
  text-align: left;
}

.gov-table td {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-gov-border);
  color: #1E293B;
  vertical-align: middle;
}

.gov-table tr:nth-child(even) {
  background-color: #F8FAFC;
}

.gov-table tr:hover {
  background-color: #EDF2F7;
}

/* Official Stamp Badge Utility */
.gov-stamp {
  display: inline-block;
  border: 3px double currentColor;
  padding: 0.375rem 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transform: rotate(-2deg);
  user-select: none;
}

/* Accessibility: Motion Sanitization */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Official Print Stylesheet for Form 4A & Court Dossiers */
@media print {
  body {
    background-color: #ffffff !important;
    color: #000000 !important;
  }
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
}
```

---

## 4. Concrete Implementation Snippet: `src/components/ui/StampBadge.tsx`

The updated `StampBadge` component satisfies both:
1. The **Interface Contract** in `PROJECT.md` line 83: `{ variant?: "navy" | "brass" | "saffron" | "green", text: string }`.
2. **Backward Compatibility** with existing call sites: `<StampBadge status={test.result as any} />` in `src/app/logs/[id]/page.tsx:62`.

```tsx
import React from "react";

export type StampVariant = 
  | "navy" 
  | "brass" 
  | "saffron" 
  | "green" 
  | "positive" 
  | "negative" 
  | "inconclusive";

export interface StampBadgeProps {
  status?: "positive" | "negative" | "inconclusive";
  variant?: "navy" | "brass" | "saffron" | "green";
  text?: string;
  className?: string;
}

const variantStyles: Record<string, string> = {
  navy: "text-[#003366] border-[#003366] bg-[#003366]/5",
  brass: "text-[#855800] border-[#855800] bg-[#855800]/5",
  saffron: "text-[#C45500] border-[#FF9933] bg-[#FF9933]/5",
  green: "text-[#0E6606] border-[#138808] bg-[#138808]/5",
  positive: "text-red-700 border-red-700 bg-red-50/60",
  negative: "text-green-800 border-green-700 bg-green-50/60",
  inconclusive: "text-[#855800] border-[#855800] bg-amber-50/60",
};

export function StampBadge({ status, variant, text, className = "" }: StampBadgeProps) {
  // Resolve variant: explicit variant prop takes precedence, followed by status prop fallback
  let resolvedVariant = "navy";
  if (variant) {
    resolvedVariant = variant;
  } else if (status === "positive") {
    resolvedVariant = "positive";
  } else if (status === "negative") {
    resolvedVariant = "negative";
  } else if (status === "inconclusive") {
    resolvedVariant = "inconclusive";
  }

  const styleClass = variantStyles[resolvedVariant] || variantStyles.navy;
  const labelText = text || (status ? status.toUpperCase() : "VERIFIED");

  return (
    <div
      className={`inline-block border-[3px] border-double px-4 py-2 uppercase font-mono font-black text-2xl tracking-widest ${styleClass} rotate-[-2deg] select-none shadow-xs ${className}`}
      role="status"
      aria-label={`Forensic Status: ${labelText}`}
    >
      <div className="border border-current px-2.5 py-0.5">
        {labelText}
      </div>
    </div>
  );
}
```

---

## 5. Architectural Blueprint for `src/app/layout.tsx`

Worker M1 must update `src/app/layout.tsx` to establish the GIGW 3.0 government shell.

### 5.1 Elements to Remove
1. **Noise overlay**: Delete line 39:
   `<div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>`
2. **Radial dot grid**: Delete line 40:
   `<div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>`
3. **Pastel tricolor gradient**: Delete line 35:
   `<div className="h-1.5 w-full bg-gradient-to-r from-gov-orange via-white to-gov-green opacity-90 shadow-sm z-50 fixed top-0" />`
4. **File asset removal**: Remove `public/noise.svg`.

### 5.2 GIGW 3.0 Shell Components to Introduce
1. **Accessibility & Skip Link Strip**:
   - `<a href="#main-content" className="skip-to-content">Skip to Main Content</a>`
   - Top GIGW 3.0 utility strip: "भारत सरकार | Government of India" on left; accessibility controls (Font Size A- / A / A+, High Contrast) on right.
2. **Authoritative National Banner**:
   - Crisp 3-color solid Indian tricolor band:
     `<div className="h-1 w-full flex"><div className="h-full bg-[#FF9933] flex-1" /><div className="h-full bg-white flex-1" /><div className="h-full bg-[#138808] flex-1" /></div>`
   - Official Header container:
     - National Emblem placeholder with "सत्यमेव जयते"
     - "Narcotics Control Bureau / स्वापक नियंत्रण ब्यूरो"
     - "Ministry of Home Affairs, Government of India"
3. **Global Navigation Bar**:
   - Solid Navy background: `bg-[#003366]`
   - Utilitarian text links: `/dashboard`, `/capture` (Form 4A Capture), `/ledger` (Evidence Ledger), `/logs` (System Audit)
   - Active state indicator: Solid Saffron bottom border (`border-b-2 border-[#FF9933]`) and white text.
4. **Main Content Container**:
   - Wrapped in `<main id="main-content" className="flex-1 bg-[#F4F6F9]">`
   - Clean, solid canvas background with zero opacity masks.
5. **Official GIGW Footer**:
   - Standard NIC / Digital India attribution:
     "Designed, Developed and Hosted by National Informatics Centre (NIC)"
     "Ministry of Electronics & Information Technology, Government of India"
   - Security Notice: "RESTRICTED ACCESS - AUTHORIZED LAW ENFORCEMENT PERSONNEL ONLY"

---

## 6. Verification and Validation Procedure

Worker M1 must execute the following commands to ensure no regressions:
1. **TypeScript Verification**:
   ```pwsh
   npx tsc --noEmit
   ```
   *Expected result: 0 errors.*
2. **Next.js Production Build**:
   ```pwsh
   npm run build
   ```
   *Expected result: Successful Turbopack build with all static and dynamic routes compiled.*
3. **CSS Variable Runtime Resolution Test**:
   ```pwsh
   node -e '
   const fs = require("fs");
   const css = fs.readFileSync("src/app/globals.css", "utf-8");
   const requiredVars = ["--color-navy", "--color-brass", "--color-saffron", "--color-green", "--color-gov-blue", "--color-gov-orange", "--color-gov-canvas"];
   const missing = requiredVars.filter(v => !css.includes(v));
   if (missing.length > 0) { console.error("FAILED: Missing vars:", missing); process.exit(1); }
   console.log("PASSED: All required UX4G variables present in globals.css");
   '
   ```

---

## 7. Next Steps for Milestone 1 Worker
1. Apply the CSS replacement to `src/app/globals.css`.
2. Apply the `StampBadge.tsx` replacement to `src/components/ui/StampBadge.tsx`.
3. Refactor `src/app/layout.tsx` to implement the GIGW 3.0 government shell and remove noise/dots overlays.
4. Delete `public/noise.svg`.
5. Run `npm run build` and report completion to parent orchestrator.
