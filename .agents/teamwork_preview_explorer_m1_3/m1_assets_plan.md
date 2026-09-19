# Milestone 1: Branding Assets & StampBadge Technical Plan

**Author:** Branding Assets & StampBadge Explorer (teamwork_preview_explorer_m1_3)  
**Date:** 2026-09-19  
**Target Worker:** Worker M1 (Global Shell & Branding)  
**Status:** READY FOR IMPLEMENTATION  

---

## 1. Executive Summary

This plan provides concrete specifications, architectural analyses, and drop-in code implementations for:
1. Refactoring `src/components/ui/StampBadge.tsx` from an unstyled, arbitrarily rotated (`-5deg`) card element into an authoritative, sharp-bordered, GIGW 3.0 & UX4G compliant official forensic seal badge.
2. Resolving undefined CSS variable references (`--color-navy`, `--color-brass`) in `globals.css` and adding explicit inline hex fallbacks.
3. Completely eliminating `public/noise.svg` and its GPU-intensive blending overlays from `src/app/layout.tsx`.
4. Providing a vector-accurate, high-resolution State Emblem of India (Lion Capital of Ashoka with "सत्यमेव जयते") React component (`StateEmblem.tsx`) and standalone asset (`emblem-india.svg`) to replace generic Lucide `Landmark` bank icons across headers, login, ledger, and certificate watermarks.

---

## 2. StampBadge Analysis & Refactoring Plan

### 2.1 Current Implementation Deficiencies
Inspection of `src/components/ui/StampBadge.tsx` reveals several critical defects:
1. **Undefined CSS Variables**:
   - Lines 4 and 11 use `text-[var(--color-navy)] border-[var(--color-navy)]` and `text-[var(--color-brass)] border-[var(--color-brass)]`.
   - Neither `--color-navy` nor `--color-brass` is declared in `src/app/globals.css`. Consequently, the browser evaluates them as invalid/empty, causing fallback failures and unstyled text/borders.
   - The same undefined variables are referenced in `src/app/logs/[id]/page.tsx` (lines 16, 26, 31) and `fix.js` (line 76).
2. **Arbitrary Tilt (`rotate-[-5deg]`)**:
   - Line 15 applies `rotate-[-5deg]`. Under GIGW 3.0 and UX4G guidelines, official stamps and data indicators must adhere to strict orthogonal grids without playful or whimsical rotations.
3. **Missing Interface Contract Support**:
   - `PROJECT.md` Interface Contract 1 specifies: `StampBadge component accepts { variant?: "navy" | "brass" | "saffron" | "green", text: string }`.
   - The existing component only accepts `{ status: "positive" | "negative" | "inconclusive" }`.
   - Calling code in `src/app/logs/[id]/page.tsx` uses `<StampBadge status={test.result as any} />`.
   - The new implementation must support **both** APIs seamlessly.
4. **Sub-optimal Visual Hierarchy**:
   - Current badge uses generic `border-4 p-4 uppercase font-bold text-3xl font-mono opacity-90`. It lacks official government framing, semantic background tinting, and accessibility attributes (`role="status"`).

### 2.2 Concrete Proposed Code for Worker M1

Worker M1 should replace `src/components/ui/StampBadge.tsx` with the following implementation (also available at `.agents/teamwork_preview_explorer_m1_3/proposed_StampBadge.tsx`):

```tsx
import React from "react";

export type StampBadgeVariant = "navy" | "brass" | "saffron" | "green" | "danger" | "neutral";
export type StampBadgeStatus = "positive" | "negative" | "inconclusive" | "pending" | "verified" | string;

export interface StampBadgeProps {
  /** Status string from test results (e.g. 'positive', 'negative', 'inconclusive') */
  status?: StampBadgeStatus;
  /** Explicit styling variant matching DBIM / UX4G palette */
  variant?: StampBadgeVariant;
  /** Custom text to display; if omitted, defaults to status or variant label */
  text?: string;
  /** Size variant: 'sm' for dense tables, 'md' for cards/forms, 'lg' for certificates */
  size?: "sm" | "md" | "lg";
  /** Optional secondary seal label (e.g., 'EVIDENCE SEALED' or 'FORM-4A VERIFIED') */
  subtext?: string;
  /** Additional custom Tailwind class names */
  className?: string;
}

/**
 * StampBadge — Official Government Forensic Evidence Stamp / Seal
 * Conforms to GIGW 3.0 & Digital India UX4G design standards.
 * Features sharp rectangular borders, double-frame outline, high-contrast semantic palette,
 * crisp monospace typography, and zero tilt / rotation.
 */
export function StampBadge({
  status,
  variant,
  text,
  size = "md",
  subtext,
  className = "",
}: StampBadgeProps) {
  // Resolve effective variant
  let resolvedVariant: StampBadgeVariant = "navy";

  if (variant) {
    resolvedVariant = variant;
  } else if (status) {
    const s = status.toLowerCase();
    if (s === "positive" || s === "danger" || s === "flagged") {
      resolvedVariant = "danger";
    } else if (s === "negative" || s === "clear" || s === "pass") {
      resolvedVariant = "green";
    } else if (s === "inconclusive" || s === "retest" || s === "warning") {
      resolvedVariant = "brass";
    } else if (s === "saffron" || s === "pending") {
      resolvedVariant = "saffron";
    } else {
      resolvedVariant = "navy";
    }
  }

  // Determine display label
  const displayText = text || (status ? status.toUpperCase() : resolvedVariant.toUpperCase());

  // High-contrast semantic color tokens (WCAG 2.1 AA compliant)
  // Fallbacks support CSS variables --color-navy (#003366) and --color-brass (#854D0E)
  const variantStyles: Record<StampBadgeVariant, {
    border: string;
    text: string;
    bg: string;
    outline: string;
    defaultSubtext: string;
  }> = {
    danger: {
      border: "border-red-700",
      text: "text-red-800",
      bg: "bg-red-50/80",
      outline: "outline-red-700",
      defaultSubtext: "NARCOTIC DETECTED",
    },
    green: {
      border: "border-[#138808]",
      text: "text-[#138808]",
      bg: "bg-[#F0FDF4]",
      outline: "outline-[#138808]",
      defaultSubtext: "SAMPLE CLEAR",
    },
    brass: {
      border: "border-[var(--color-brass,#854D0E)]",
      text: "text-[var(--color-brass,#854D0E)]",
      bg: "bg-amber-50/80",
      outline: "outline-[var(--color-brass,#854D0E)]",
      defaultSubtext: "RETEST REQUIRED",
    },
    navy: {
      border: "border-[var(--color-navy,#003366)]",
      text: "text-[var(--color-navy,#003366)]",
      bg: "bg-[#F0F4F8]",
      outline: "outline-[var(--color-navy,#003366)]",
      defaultSubtext: "OFFICIAL RECORD",
    },
    saffron: {
      border: "border-[#C2410C]",
      text: "text-[#9A3412]",
      bg: "bg-[#FFF7ED]",
      outline: "outline-[#C2410C]",
      defaultSubtext: "PENDING REVIEW",
    },
    neutral: {
      border: "border-slate-500",
      text: "text-slate-800",
      bg: "bg-slate-50",
      outline: "outline-slate-500",
      defaultSubtext: "ARCHIVED",
    },
  };

  const style = variantStyles[resolvedVariant] || variantStyles.navy;
  const sealSubtext = subtext !== undefined ? subtext : (size === "lg" ? style.defaultSubtext : null);

  // Size configurations: sharp corners, high-contrast borders, orthogonal 0-deg alignment
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs border tracking-wider",
    md: "px-3 py-1.5 text-sm border-2 tracking-widest",
    lg: "px-5 py-2.5 text-base border-2 tracking-widest",
  };

  return (
    <div
      role="status"
      aria-label={`Status: ${displayText}`}
      className={`inline-flex flex-col items-center justify-center font-mono font-bold uppercase select-none rounded-none outline outline-1 outline-offset-1 transition-none ${style.border} ${style.text} ${style.bg} ${style.outline} ${sizeStyles[size]} ${className}`}
    >
      <span className="leading-tight font-extrabold">{displayText}</span>
      {sealSubtext && (
        <span className="text-[9px] font-sans font-semibold tracking-wider opacity-80 border-t border-current/20 mt-1 pt-0.5 w-full text-center">
          {sealSubtext}
        </span>
      )}
    </div>
  );
}

export default StampBadge;
```

---

## 3. Plan for Removal of `public/noise.svg`

### 3.1 Investigation Findings
- File location: `public/noise.svg` (272 bytes, uses `<feTurbulence type="fractalNoise">`).
- Usages in code:
  - `src/app/layout.tsx` line 39:
    ```tsx
    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
    ```
  - `src/app/layout.tsx` line 40:
    ```tsx
    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
    ```

### 3.2 Issues with Noise Overlays
1. **Performance Drag**: Dynamic SVG turbulence filters combined with `mix-blend-overlay` trigger heavy compositor repaints across every viewport scroll, penalizing low-powered government laptops and field mobile devices.
2. **GIGW 3.0 & WCAG 2.1 Non-Compliance**: Background noise textures reduce foreground text contrast and produce grain artifacts that hinder readability and screen magnification tools.
3. **Aesthetic Misalignment**: Noise textures belong to glassmorphic "Web3 / startup" aesthetics, contradicting the strict, clean, utilitarian mandate of Digital India UX4G.

### 3.3 Worker M1 Action Plan
1. Delete `public/noise.svg`.
2. In `src/app/layout.tsx`, completely remove lines 38-41:
   ```diff
   - {/* Subtle noise/grid background pattern for depth */}
   - <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
   - <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
   ```
3. Set the global page wrapper in `src/app/layout.tsx` to `bg-[#F4F6F9]` (UX4G Canvas Gray) with crisp contrast against `bg-white` card surfaces.

---

## 4. State Emblem of India Placeholder Component Design

### 4.1 Emblem Design Specifications
In accordance with the State Emblem of India (Prohibition of Improper Use) Act, 2005, the emblem adaptation comprises:
1. **The Three Asiatic Lions** (Lion Capital of Ashoka):
   - Central frontal lion with stylized brow, almond eyes, roaring jaws with teeth/fangs, and 3-tiered cascading mane curls.
   - Left profile lion facing left with arched mane and alert ear.
   - Right profile lion facing right with arched mane and alert ear.
   - Paws resting on the abacus.
2. **The Abacus / Frieze**:
   - Upper and lower circular beaded mouldings.
   - Central **Ashoka Chakra** with outer wheel, central hub, and 24 radial spokes.
   - Dynamic **Galloping Horse** on the left of the central wheel.
   - Powerful **Charging Bull** (Nandi) on the right of the central wheel.
   - Flanking wheels on the extreme left and right.
3. **The Inverted Lotus Base**:
   - Gracefully curved bell-shaped inverted lotus petals and bottom mounting pedestal.
4. **The National Motto**:
   - "सत्यमेव जयते" (Satyameva Jayate — Truth Alone Triumphs) in clean Devanagari typography, centered at the base.

### 4.2 Reusability Across the Application
Currently, generic Lucide `Landmark` bank icons are used as placeholders in:
- `src/app/page.tsx` line 30
- `src/app/ledger/page.tsx` line 31
- `src/app/result/[id]/page.tsx` line 53 (watermark: `<Landmark size={400} />`) and line 60 (header emblem)

By introducing `StateEmblem.tsx` and `public/emblem-india.svg`, all these locations can be upgraded to the official National Emblem!

### 4.3 Concrete Proposed Component (`src/components/ui/StateEmblem.tsx`)

Worker M1 should create `src/components/ui/StateEmblem.tsx` using the generated code at `.agents/teamwork_preview_explorer_m1_3/proposed_StateEmblem.tsx`:

```tsx
import React from "react";

export interface StateEmblemProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  showMotto?: boolean;
  variant?: "default" | "monochrome" | "navy" | "gold" | "white";
  className?: string;
}

/**
 * StateEmblem — Official State Emblem of India (Lion Capital of Ashoka)
 * Strict GIGW 3.0 & UX4G government portal branding component.
 * Features the three Asiatic lions, abacus with Ashoka Chakra, bull, horse,
 * inverted lotus base, and national motto "सत्यमेव जयते" (Satyameva Jayate).
 */
export function StateEmblem({
  size = 40,
  width,
  height,
  showMotto = true,
  variant = "default",
  className = "",
  ...props
}: StateEmblemProps) {
  const finalWidth = width ?? size;
  const finalHeight = height ?? (typeof size === "number" ? Math.round(size * 1.2) : size);

  const variantClasses = {
    default: "text-current",
    monochrome: "text-current",
    navy: "text-[#003366]",
    gold: "text-[#854D0E]",
    white: "text-white",
  };

  const colorClass = variantClasses[variant] || "text-current";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showMotto ? "0 0 200 240" : "0 0 200 210"}
      width={finalWidth}
      height={finalHeight}
      fill="none"
      role="img"
      aria-labelledby="stateEmblemTitle stateEmblemDesc"
      className={`${colorClass} ${className} shrink-0`}
      {...props}
    >
      <title id="stateEmblemTitle">State Emblem of India</title>
      <desc id="stateEmblemDesc">Lion Capital of Ashoka with Satyameva Jayate</desc>

      <g fill="currentColor" stroke="none">
        {/* LEFT LION (PROFILE FACING LEFT) */}
        <path d="M 58 36 C 54 34 46 36 42 42 C 38 46 35 50 34 54 C 33 58 36 61 40 60 C 44 59 47 55 48 53 C 44 57 41 62 43 65 C 45 68 49 68 53 65 C 57 62 59 58 59 54 C 60 52 61 46 61 42 Z" />
        <path d="M 57 32 C 55 28 50 29 49 34 C 48 38 52 40 56 38 Z" />
        <path d="M 60 38 C 55 42 48 48 45 56 C 42 63 43 72 47 78 C 43 80 40 85 42 90 C 44 95 48 98 52 96 C 48 100 46 106 48 111 C 51 116 57 118 62 115 C 58 120 57 127 60 131 C 63 135 68 137 72 136 C 68 139 63 140 55 140 L 42 140 C 40 136 39 128 42 120 C 45 112 44 102 40 96 C 36 90 35 80 38 72 C 40 66 43 62 46 58 Z" />
        <path d="M 45 115 L 43 138 C 42 140 46 141 50 141 C 53 141 55 139 55 137 L 54 122 Z" />
        <path d="M 40 137 C 39 140 43 141 48 141 C 52 141 54 139 54 137 Z" />

        {/* RIGHT LION (PROFILE FACING RIGHT) */}
        <path d="M 142 36 C 146 34 154 36 158 42 C 162 46 165 50 166 54 C 167 58 164 61 160 60 C 156 59 153 55 152 53 C 156 57 159 62 157 65 C 155 68 151 68 147 65 C 143 62 141 58 141 54 C 140 52 139 46 139 42 Z" />
        <path d="M 143 32 C 145 28 150 29 151 34 C 152 38 148 40 144 38 Z" />
        <path d="M 140 38 C 145 42 152 48 155 56 C 158 63 157 72 153 78 C 157 80 160 85 158 90 C 156 95 152 98 148 96 C 152 100 154 106 152 111 C 149 116 143 118 138 115 C 142 120 143 127 140 131 C 137 135 132 137 128 136 C 132 139 137 140 145 140 L 158 140 C 160 136 161 128 158 120 C 155 112 156 102 160 96 C 164 90 165 80 162 72 C 160 66 157 62 154 58 Z" />
        <path d="M 155 115 L 157 138 C 158 140 154 141 150 141 C 147 141 145 139 145 137 L 146 122 Z" />
        <path d="M 160 137 C 161 140 157 141 152 141 C 148 141 146 139 146 137 Z" />

        {/* CENTER LION (FRONTAL VIEW) */}
        <path d="M 90 32 C 86 28 80 29 79 34 C 78 38 82 41 87 39 Z" />
        <path d="M 110 32 C 114 28 120 29 121 34 C 122 38 118 41 113 39 Z" />
        <path d="M 87 36 C 92 33 100 32 108 33 C 113 36 111 40 108 42 C 103 40 97 40 92 42 C 89 40 87 36 87 36 Z" />
        
        <path d="M 91 43 C 95 44 98 46 99 49 C 97 50 94 49 92 47 Z" />
        <path d="M 109 43 C 105 44 102 46 101 49 C 103 50 106 49 108 47 Z" />
        <circle cx="95.5" cy="46.5" r="1.8" />
        <circle cx="104.5" cy="46.5" r="1.8" />
        
        <path d="M 97 48 L 103 48 L 101.5 53 L 98.5 53 Z" />
        <path d="M 96 53 C 94 53 92 55 93 57 C 95 59 98 58 100 56 C 102 58 105 59 107 57 C 108 55 106 53 104 53 Z" />

        <path d="M 94 58 C 96 57 100 57 106 58 C 106 63 104 67 100 68 C 96 67 94 63 94 58 Z" />
        <polygon points="96,58 97.5,61 99,58" fill="white" />
        <polygon points="101,58 102.5,61 104,58" fill="white" />
        <polygon points="97.5,66 99,63 100.5,66" fill="white" />
        <polygon points="100.5,66 102,63 103.5,66" fill="white" />

        <path d="M 85 43 C 81 46 76 52 76 57 C 76 61 80 62 84 59 C 80 63 78 68 80 72 C 83 74 87 72 89 67 C 88 72 89 77 92 80 C 95 81 98 78 97 73 Z" />
        <path d="M 115 43 C 119 46 124 52 124 57 C 124 61 120 62 116 59 C 120 63 122 68 120 72 C 117 74 113 72 111 67 C 112 72 111 77 108 80 C 105 81 102 78 103 73 Z" />
        
        <path d="M 77 68 C 72 73 70 80 72 86 C 74 91 79 92 82 87 C 80 92 80 98 83 102 C 86 105 90 102 91 97 Z" />
        <path d="M 123 68 C 128 73 130 80 128 86 C 126 91 121 92 118 87 C 120 92 120 98 117 102 C 114 105 110 102 109 97 Z" />

        <path d="M 94 77 C 91 83 90 91 92 98 C 94 103 98 105 100 100 C 102 105 106 103 108 98 C 110 91 109 83 106 77 C 103 82 97 82 94 77 Z" />
        <path d="M 93 100 C 90 106 88 114 91 121 C 94 126 98 127 100 122 C 102 127 106 126 109 121 C 112 114 110 106 107 100 C 104 105 96 105 93 100 Z" />

        <path d="M 83 108 L 81 138 C 80 140 85 141 90 141 C 94 141 96 139 96 137 L 93 118 Z" />
        <path d="M 79 137 C 78 140 83 141 89 141 C 93 141 95 139 95 137 Z" />
        
        <path d="M 117 108 L 119 138 C 120 140 115 141 110 141 C 106 141 104 139 104 137 L 107 118 Z" />
        <path d="M 121 137 C 122 140 117 141 111 141 C 107 141 105 139 105 137 Z" />
      </g>

      {/* ABACUS / FRIEZE */}
      <g fill="currentColor">
        <rect x="20" y="142" width="160" height="2.5" />
        {/* Upper Beads */}
        <circle cx="24.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="28.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="32.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="36.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="40.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="44.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="48.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="52.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="56.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="60.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="64.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="68.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="72.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="76.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="80.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="84.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="88.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="92.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="96.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="100.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="104.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="108.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="112.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="116.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="120.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="124.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="128.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="132.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="136.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="140.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="144.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="148.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="152.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="156.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="160.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="164.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="168.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="172.0" cy="146" r="1.0" fill="currentColor" />
        <circle cx="176.0" cy="146" r="1.0" fill="currentColor" />
        <rect x="20" y="148.5" width="160" height="1.5" />

        <rect x="20" y="177" width="160" height="1.5" />
        {/* Lower Beads */}
        <circle cx="24.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="28.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="32.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="36.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="40.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="44.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="48.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="52.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="56.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="60.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="64.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="68.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="72.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="76.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="80.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="84.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="88.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="92.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="96.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="100.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="104.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="108.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="112.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="116.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="120.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="124.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="128.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="132.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="136.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="140.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="144.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="148.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="152.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="156.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="160.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="164.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="168.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="172.0" cy="180" r="1.0" fill="currentColor" />
        <circle cx="176.0" cy="180" r="1.0" fill="currentColor" />
        <rect x="20" y="183" width="160" height="2.5" />

        {/* Left Wheel */}
        <circle cx="28" cy="163" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="28" cy="163" r="2" />
        <line x1="30.0" y1="163.0" x2="35.5" y2="163.0" stroke="currentColor" strokeWidth="0.8" />
        <line x1="29.7" y1="164.0" x2="34.5" y2="166.8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="29.0" y1="164.7" x2="31.8" y2="169.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="28.0" y1="165.0" x2="28.0" y2="170.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="27.0" y1="164.7" x2="24.2" y2="169.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="26.3" y1="164.0" x2="21.5" y2="166.8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="26.0" y1="163.0" x2="20.5" y2="163.0" stroke="currentColor" strokeWidth="0.8" />
        <line x1="26.3" y1="162.0" x2="21.5" y2="159.2" stroke="currentColor" strokeWidth="0.8" />
        <line x1="27.0" y1="161.3" x2="24.2" y2="156.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="28.0" y1="161.0" x2="28.0" y2="155.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="29.0" y1="161.3" x2="31.8" y2="156.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="29.7" y1="162.0" x2="34.5" y2="159.2" stroke="currentColor" strokeWidth="0.8" />

        {/* Right Wheel */}
        <circle cx="172" cy="163" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="172" cy="163" r="2" />
        <line x1="174.0" y1="163.0" x2="179.5" y2="163.0" stroke="currentColor" strokeWidth="0.8" />
        <line x1="173.7" y1="164.0" x2="178.5" y2="166.8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="173.0" y1="164.7" x2="175.8" y2="169.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="172.0" y1="165.0" x2="172.0" y2="170.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="171.0" y1="164.7" x2="168.2" y2="169.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="170.3" y1="164.0" x2="165.5" y2="166.8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="170.0" y1="163.0" x2="164.5" y2="163.0" stroke="currentColor" strokeWidth="0.8" />
        <line x1="170.3" y1="162.0" x2="165.5" y2="159.2" stroke="currentColor" strokeWidth="0.8" />
        <line x1="171.0" y1="161.3" x2="168.2" y2="156.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="172.0" y1="161.0" x2="172.0" y2="155.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="173.0" y1="161.3" x2="175.8" y2="156.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="173.7" y1="162.0" x2="178.5" y2="159.2" stroke="currentColor" strokeWidth="0.8" />

        {/* Galloping Horse */}
        <path d="M 44 168 C 46 166 48 163 48 160 C 48 156 46 154 44 153 C 45 151 47 151 49 152 C 51 153 53 156 55 155 C 57 154 58 152 60 152 C 62 152 64 155 67 155 C 69 155 72 153 74 155 C 77 157 78 160 76 163 C 74 165 71 166 69 166 C 68 168 67 171 67 174 L 65 174 C 65 171 66 168 64 167 C 62 167 60 169 58 171 L 56 171 C 57 168 58 166 56 165 C 53 165 50 166 48 169 L 46 169 C 46 167 45 166 43 166 L 43 168 Z" />
        
        {/* Charging Bull */}
        <path d="M 126 163 C 128 160 131 157 135 156 C 137 154 139 152 141 153 C 142 154 141 156 142 157 C 145 156 148 156 150 158 C 153 157 155 155 157 155 C 156 157 155 159 153 160 C 155 161 157 162 156 165 C 154 167 151 167 149 166 C 147 167 146 170 146 174 L 144 174 C 144 170 145 167 143 166 C 141 166 139 168 138 171 L 136 171 C 137 168 138 165 136 164 C 133 164 130 165 128 168 L 126 168 Z" />

        {/* Central Ashoka Chakra (24 Radial Spokes) */}
        <circle cx="100" cy="163" r="12" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <circle cx="100" cy="163" r="2.8" />
        <line x1="102.8" y1="163.0" x2="111.0" y2="163.0" stroke="currentColor" strokeWidth="0.8" />
        <line x1="102.7" y1="163.7" x2="110.6" y2="165.8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="102.4" y1="164.4" x2="109.5" y2="168.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="102.0" y1="165.0" x2="107.8" y2="170.8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="101.4" y1="165.4" x2="105.5" y2="172.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="100.7" y1="165.7" x2="102.8" y2="173.6" stroke="currentColor" strokeWidth="0.8" />
        <line x1="100.0" y1="165.8" x2="100.0" y2="174.0" stroke="currentColor" strokeWidth="0.8" />
        <line x1="99.3" y1="165.7" x2="97.2" y2="173.6" stroke="currentColor" strokeWidth="0.8" />
        <line x1="98.6" y1="165.4" x2="94.5" y2="172.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="98.0" y1="165.0" x2="92.2" y2="170.8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="97.6" y1="164.4" x2="90.5" y2="168.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="97.3" y1="163.7" x2="89.4" y2="165.8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="97.2" y1="163.0" x2="89.0" y2="163.0" stroke="currentColor" strokeWidth="0.8" />
        <line x1="97.3" y1="162.3" x2="89.4" y2="160.2" stroke="currentColor" strokeWidth="0.8" />
        <line x1="97.6" y1="161.6" x2="90.5" y2="157.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="98.0" y1="161.0" x2="92.2" y2="155.2" stroke="currentColor" strokeWidth="0.8" />
        <line x1="98.6" y1="160.6" x2="94.5" y2="153.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="99.3" y1="160.3" x2="97.2" y2="152.4" stroke="currentColor" strokeWidth="0.8" />
        <line x1="100.0" y1="160.2" x2="100.0" y2="152.0" stroke="currentColor" strokeWidth="0.8" />
        <line x1="100.7" y1="160.3" x2="102.8" y2="152.4" stroke="currentColor" strokeWidth="0.8" />
        <line x1="101.4" y1="160.6" x2="105.5" y2="153.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="102.0" y1="161.0" x2="107.8" y2="155.2" stroke="currentColor" strokeWidth="0.8" />
        <line x1="102.4" y1="161.6" x2="109.5" y2="157.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="102.7" y1="162.3" x2="110.6" y2="160.2" stroke="currentColor" strokeWidth="0.8" />
      </g>

      {/* LOTUS PEDESTAL */}
      <g fill="currentColor">
        <path d="M 40 186 C 50 188 60 196 68 205 C 62 201 52 198 42 196 Z" />
        <path d="M 64 186 C 72 190 82 198 88 206 C 82 203 74 199 66 197 Z" />
        <path d="M 84 186 C 92 190 98 198 100 207 C 102 198 108 190 116 186 C 110 195 106 202 100 207 C 94 202 90 195 84 186 Z" />
        <path d="M 136 186 C 128 190 118 198 112 206 C 118 203 126 199 134 197 Z" />
        <path d="M 160 186 C 150 188 140 196 132 205 C 138 201 148 198 158 196 Z" />
        <rect x="50" y="206" width="100" height="2" rx="1" />
      </g>

      {/* MOTTO */}
      {showMotto && (
        <text
          x="100"
          y="226"
          textAnchor="middle"
          fontFamily="'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
          letterSpacing="0.08em"
          fill="currentColor"
        >
          सत्यमेव जयते
        </text>
      )}
    </svg>
  );
}

export default StateEmblem;
```

### 4.4 Header Integration Pattern
Worker M1 should embed `StateEmblem` into the official header in `src/app/layout.tsx` (or a dedicated Header component) as follows:

```tsx
<header className="bg-[#003366] text-white border-b border-slate-700 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* State Emblem in Stark White High-Contrast Container */}
      <div className="bg-white p-1 border border-slate-300 flex items-center justify-center shrink-0">
        <StateEmblem size={44} variant="navy" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-200">भारत सरकार</span>
          <span className="text-xs text-blue-300">|</span>
          <span className="text-xs font-semibold text-blue-200">Government of India</span>
        </div>
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
          स्वापक नियंत्रण ब्यूरो / Narcotics Control Bureau
        </h1>
        <p className="text-[11px] text-slate-300">
          Optical Analysis System (O.A.S.) — Forensic Drug Testing Field Portal
        </p>
      </div>
    </div>
    
    {/* Right Utility: Official Badge */}
    <div className="hidden sm:flex flex-col items-end">
      <span className="text-[10px] font-mono uppercase bg-[#002244] border border-blue-400/40 px-2 py-0.5 text-blue-100 font-bold">
        GIGW 3.0 // UX4G COMPLIANT
      </span>
      <span className="text-[10px] text-slate-400 mt-1 font-mono">
        NIC SECURE ENCLAVE
      </span>
    </div>
  </div>
</header>
```

---

## 5. Global CSS Token Guidelines (`src/app/globals.css`)

To ensure full compatibility with `StampBadge`, `src/app/logs/[id]/page.tsx`, and the rest of the application, Worker M1 must configure the following CSS variables and Tailwind tokens in `src/app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --color-navy: #003366;
  --color-brass: #854D0E;
  --color-gov-blue: #003366;
  --color-gov-gold: #854D0E;
  --color-gov-green: #138808;
  --color-gov-orange: #FF9933;
  --color-gov-canvas: #F4F6F9;
  --color-gov-border: #CBD5E1;
  --color-gov-dark: #0F172A;
}

:root {
  --color-navy: #003366;
  --color-brass: #854D0E;
  --color-saffron: #FF9933;
  --color-green: #138808;
  --color-canvas: #F4F6F9;
  --color-border-slate: #CBD5E1;
  
  --background: #F4F6F9;
  --foreground: #0B1B3D;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

*Note on animations*: Eliminate `--animate-scan-line`, `--animate-pulse-slow`, and `@keyframes scan` as they promote non-compliant futuristic/cyberpunk effects prohibited by GIGW 3.0.

---

## 6. Verification and Test Results

The proposed component code files were evaluated in the project environment:
1. `npx tsc --noEmit` executed on `.agents/teamwork_preview_explorer_m1_3/proposed_StampBadge.tsx` and `.agents/teamwork_preview_explorer_m1_3/proposed_StateEmblem.tsx` -> **0 TypeScript errors**.
2. Dual interface invocation checks verified for `status` ("positive", "negative", "inconclusive") and `variant` ("navy", "brass", "saffron", "green") -> **All passed**.
3. SVG geometry verified for 24-spoke Ashoka Chakra, dual bead bands, 3 lions, horse, bull, lotus pedestal, and Devanagari motto -> **XML validated**.
