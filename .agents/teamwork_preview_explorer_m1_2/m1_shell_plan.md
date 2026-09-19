# Milestone 1: Global Shell & Navigation Architecture Plan
**Digital India UX4G & GIGW 3.0 Government Portal Transformation**
**Author**: Explorer Subagent (teamwork_preview_explorer_m1_2)  
**Target Milestone**: M1 (UX4G Design System & Global Shell)  
**Target Worker**: Worker M1  
**Date**: 2026-09-19  

---

## 1. Executive Summary & Baseline Audit

### 1.1 Current `src/app/layout.tsx` Code Inspection
The current root layout (`src/app/layout.tsx`) reflects a startup/glassmorphic web aesthetic that violates GIGW 3.0 (Guidelines for Indian Government Websites) and Digital India UX4G design principles in multiple areas:

1. **Pastel Blended Gradient Strip (Line 35)**:
   ```tsx
   <div className="h-1.5 w-full bg-gradient-to-r from-gov-orange via-white to-gov-green opacity-90 shadow-sm z-50 fixed top-0" />
   ```
   *Issue*: Uses a fuzzy CSS gradient (`bg-gradient-to-r`) and transparency (`opacity-90`), violating the GIGW standard of crisp, high-contrast, non-blurred national tricolor bands.
2. **Noise Overlay Texture (Line 39)**:
   ```tsx
   <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
   ```
   *Issue*: Startup visual flourish using an external noise SVG and CSS blend modes (`mix-blend-overlay`), degrading readability and contrast.
3. **Radial Gradient Dot Matrix (Line 40)**:
   ```tsx
   <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
   ```
   *Issue*: Cyberpunk / tech-startup background dot matrix, strictly non-compliant with official government design.
4. **Absence of GIGW 3.0 3-Tier Header**:
   - No Top Accessibility Bar (No Skip to Main Content, font-resizing controls A-/A/A+, high-contrast toggle, or language switch).
   - No Ministry & Portal Identity Tier (No Ashoka Lion Capital / State Emblem of India, no bilingual Hindi/English typography).
   - No Main Navigation Bar (Pages currently duplicate local ad-hoc headers with glassmorphic styles).
5. **Absence of GIGW 3.0 Government Footer**:
   - No National Informatics Centre (NIC) hosting attribution.
   - No mandatory website policy links (Terms, Privacy, Hyperlinking, Accessibility Statement).
   - No last reviewed/updated timestamp or STQC compliance declaration.

---

## 2. GIGW 3.0 & UX4G 3-Tier Government Header Specification

The official Indian Government web standard (GIGW 3.0 and UX4G) prescribes a 3-tier header structure:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: Top Accessibility Bar (White / Light Slate #F8FAFC, 1px solid border #CBD5E1) │
│ [Skip to Main Content] [भारत सरकार | Government of India]  [A- A A+] [🌓 Contrast] [हिन्दी/Eng]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: Ministry & Portal Identity Header (Stark White #FFFFFF, border-b #CBD5E1)     │
│ [State Emblem of India]  राष्ट्रीय फोरेंसिक औषधि परीक्षण पोर्टल                       │
│ [Ashoka Lion Capital]    National Forensic Drug Testing Laboratory Portal              │
│ [सत्यमेव जयते]           Narcotics Control Bureau | Ministry of Home Affairs           │
│                          [Official Regulatory Seal: NDPS Act 1985 & Sec 65B]           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: Main Navigation Bar (Authoritative Navy Blue #003366, h-12)                    │
│ [डैशबोर्ड / Dashboard]  [फोरेंसिक साक्ष्य कक्ष / Evidence]  [नमूना बहीखाता / Ledger]  [ऑडिट लॉग] │
│ (Active Tab Highlight: #002244 background + 4px solid Saffron #FF9933 bottom border)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Tier 1: Top Accessibility Bar
- **Accessibility Anchor**: Hidden link that becomes visible on keyboard focus:
  `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute ...">मुख्य सामग्री पर जाएं | Skip to Main Content</a>`
- **National Affiliation**:
  - `भारत सरकार | Government of India`
  - `गृह मंत्रालय | Ministry of Home Affairs`
- **Font Resizing Engine**:
  - Three distinct controls: `A-` (Small - 90%), `A` (Normal - 100%), `A+` (Large - 110%).
  - Sets root `document.documentElement.style.fontSize` dynamically, automatically scaling all Tailwind `rem` typography without layout breakage.
- **High-Contrast Mode Toggle**:
  - Toggles `.high-contrast` class on `<html>`, applying high-contrast CSS filters and solid outlines.
- **Bilingual Language Switcher**:
  - Toggle between `English` and `हिन्दी`.

### 2.2 Tier 2: Ministry & Portal Identity Header
- **State Emblem of India (Ashoka Lion Capital)**:
  - Vector SVG placeholder with the four lions, Ashoka Chakra on abacus, and Devanagari motto "सत्यमेव जयते" (Satyameva Jayate).
  - Placed prominently on the left with authoritative dimensions (50px height).
- **Dual-Language Typography Hierarchy**:
  - Devanagari (Hindi) Primary: `राष्ट्रीय फोरेंसिक औषधि परीक्षण पोर्टल` (Bold, 18px, `#003366`).
  - Devanagari Subtitle: `मादक पदार्थ नियंत्रण ब्यूरो | भारत सरकार` (12px, Slate-700).
  - English Primary: `National Forensic Drug Testing Laboratory Portal` (Semibold, 14px, `#003366`).
  - English Subtitle: `Narcotics Control Bureau | Ministry of Home Affairs, Government of India` (11px, Slate-600).
- **Official Forensic Mandate Seal**:
  - High-contrast rectangular badge on the right:
    `NDPS ACT 1985 | SEC 65B EVIDENCE ACT` and `OFFICIAL USE ONLY`.

### 2.3 Tier 3: Main Navigation Bar
- **Authoritative Navy Blue Bar**: `bg-[#003366]` with `h-12` (48px height).
- **Core Government Workflow Tabs**:
  1. `/dashboard`: **डैशबोर्ड / Dashboard**
  2. `/capture`: **फोरेंसिक साक्ष्य कक्ष / Forensic Capture**
  3. `/ledger`: **नमूना बहीखाता / Sample Ledger**
  4. `/logs`: **ऑडिट लॉग / Audit Trail**
- **Active State Indicator**:
  - Highlighted tab background: `#002244` (Deep Navy).
  - Bottom indicator: 4px solid Saffron (`border-b-4 border-[#FF9933]`).
  - Typography: Crisp white, bold font weight (`font-bold text-[#FF9933]`).
  - Accessibility: `aria-current="page"`.
- **Mobile Responsive Drawer**:
  - Utilitarian hamburger toggle with high-contrast touch zones for mobile/tablet screens.

---

## 3. GIGW 3.0 Government Footer Specification

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TRICOLOR SOLID BAND: Saffron #FF9933 | White #FFFFFF | Green #138808 (4px solid line)  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ MAIN FOOTER (Deep Navy #002244, text-slate-100, 4-column informational grid)           │
│                                                                                        │
│ [Column 1: Legal & Forensic Mandate]     [Column 2: Mandatory Website Policies]        │
│ • NDPS Act 1985 Statutory Laboratory     • Website Policies                            │
│ • Indian Evidence Act Sec 65B Compliance • Terms of Use & Privacy Policy              │
│ • Chain-of-Custody Cryptographic Ledger  • Copyright & Hyperlinking Policy             │
│                                          • Accessibility Statement                     │
│                                                                                        │
│ [Column 3: Technical & Compliance]       [Column 4: Support & Nodal Authority]         │
│ • GIGW 3.0 Compliant                     • Narcotics Control Bureau HQ                 │
│ • Digital India UX4G Framework           • Technical Host: NIC                         │
│ • STQC Certified Security                • National Emergency Helpline: 1933           │
│ • WCAG 2.1 Level AA Conformant           • 24x7 Forensic Control Room                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ BOTTOM ATTRIBUTION BAR (Dark Navy #001830, text-xs text-slate-400, py-3 px-6)          │
│ • © 2026 National Forensic Drug Testing Laboratory Portal, Government of India.        │
│ • Designed, Developed and Hosted by National Informatics Centre (NIC).                 │
│ • Last Reviewed and Updated: 19 September 2026 | Version: 3.4.1-UX4G                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Elimination Plan for Glassmorphism, Gradients, and Noise

| File | Existing Non-Compliant Pattern | Elimination & Replacement Strategy |
|---|---|---|
| `src/app/layout.tsx:35` | `bg-gradient-to-r from-gov-orange via-white to-gov-green opacity-90` | Replaced by solid 3-color flex band: 33.3% `#FF9933`, 33.3% `#FFFFFF`, 33.3% `#138808`. Zero blur, zero gradient. |
| `src/app/layout.tsx:39` | `bg-[url('/noise.svg')] opacity-20 mix-blend-overlay` | Completely removed. |
| `src/app/layout.tsx:40` | `bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]` | Completely removed. |
| `src/app/layout.tsx:33` | `bg-slate-50` with glassmorphic children | Replaced with solid government canvas `bg-[#F4F6F9]`. |
| `src/app/globals.css` | Inconsistent `--color-gov-blue: #0F2862` & missing `--color-navy`, `--color-brass` | Defined exact UX4G tokens: `--color-navy: #003366`, `--color-brass: #B45309`, `--color-gov-canvas: #F4F6F9`, `--color-gov-border: #CBD5E1`. |
| `src/app/globals.css` | Animations `@keyframes scan`, `animate-pulse-slow` | Removed in favor of static, high-contrast, WCAG 2.1 AA compliant states. |
| `src/components/ui/StampBadge.tsx` | `rotate-[-5deg]` playful stamp angle, missing variant props | Replaced with strict rectangular official seal conforming to `{ variant?: "navy" | "brass" | "saffron" | "green", text?: string, status?: string }`. |

---

## 5. Ready-to-Implement Code for Worker M1

Worker M1 has exclusive write permissions over:
1. `src/app/layout.tsx`
2. `src/components/ui/GovernmentHeader.tsx` (New component for 3-tier header)
3. `src/components/ui/GovernmentFooter.tsx` (New component for GIGW 3.0 footer)
4. `src/app/globals.css`
5. `src/components/ui/StampBadge.tsx`

### 5.1 File: `src/app/layout.tsx`
```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import { GovernmentHeader } from "@/components/ui/GovernmentHeader";
import { GovernmentFooter } from "@/components/ui/GovernmentFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "राष्ट्रीय फोरेंसिक औषधि परीक्षण पोर्टल | National Forensic Drug Testing Laboratory Portal",
  description: "Government of India - Narcotics Control Bureau, Ministry of Home Affairs - Digital India UX4G & GIGW 3.0 Forensic Evidence System",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#003366",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} font-sans bg-[#F4F6F9] text-slate-900 min-h-screen flex flex-col selection:bg-[#003366] selection:text-white`}>
        {/* National Tricolor Accent Strip - Sharp GIGW 3.0 Solid Color Band */}
        <div className="h-1.5 w-full flex flex-row shrink-0" aria-hidden="true">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-[#FFFFFF] border-y border-slate-200" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* GIGW 3.0 Standard 3-Tier Government Header */}
        <GovernmentHeader />

        {/* Main Application Container */}
        <main id="main-content" className="flex-1 flex flex-col relative w-full" tabIndex={-1}>
          {children}
        </main>

        {/* GIGW 3.0 Official Government Footer */}
        <GovernmentFooter />

        <Toaster position="top-right" richColors theme="light" />

        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
```

---

### 5.2 File: `src/components/ui/GovernmentHeader.tsx`
```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, FileText, Database, Menu, X, ShieldAlert } from "lucide-react";

export function GovernmentHeader() {
  const pathname = usePathname();
  const [fontScale, setFontScale] = useState<"sm" | "normal" | "lg">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFontResize = (scale: "sm" | "normal" | "lg") => {
    setFontScale(scale);
    if (typeof document !== "undefined") {
      if (scale === "sm") document.documentElement.style.fontSize = "90%";
      else if (scale === "lg") document.documentElement.style.fontSize = "110%";
      else document.documentElement.style.fontSize = "100%";
    }
  };

  const handleContrastToggle = () => {
    setHighContrast((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        if (next) {
          document.documentElement.classList.add("high-contrast");
        } else {
          document.documentElement.classList.remove("high-contrast");
        }
      }
      return next;
    });
  };

  const navLinks = [
    {
      href: "/dashboard",
      labelEn: "Dashboard",
      labelHi: "डैशबोर्ड",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard" || pathname === "/",
    },
    {
      href: "/capture",
      labelEn: "Forensic Capture",
      labelHi: "साक्ष्य कक्ष",
      icon: Camera,
      isActive: pathname === "/capture",
    },
    {
      href: "/ledger",
      labelEn: "Sample Ledger",
      labelHi: "नमूना बहीखाता",
      icon: FileText,
      isActive: pathname.startsWith("/ledger"),
    },
    {
      href: "/logs",
      labelEn: "Audit Trail",
      labelHi: "ऑडिट लॉग",
      icon: Database,
      isActive: pathname.startsWith("/logs"),
    },
  ];

  return (
    <header className="w-full bg-white shadow-xs shrink-0 select-none">
      {/* ========================================================================= */}
      {/* TIER 1: Top Accessibility Bar (UX4G / GIGW 3.0 Standard)                 */}
      {/* ========================================================================= */}
      <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[11px] font-medium text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1 flex items-center justify-between gap-2">
          {/* Left: Skip to Main Content & National Affiliation */}
          <div className="flex items-center gap-3">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:bg-[#003366] focus:text-white focus:px-3 focus:py-1.5 focus:font-bold focus:border-2 focus:border-[#FF9933] focus:shadow-md"
            >
              Skip to Main Content / मुख्य सामग्री पर जाएं
            </a>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#003366]">भारत सरकार</span>
              <span className="text-slate-400">|</span>
              <span className="font-bold text-slate-800">Government of India</span>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="text-slate-600 hidden sm:inline">गृह मंत्रालय / Ministry of Home Affairs</span>
            </div>
          </div>

          {/* Right: Accessibility Controls */}
          <div className="flex items-center gap-2">
            {/* Font Resize Controls */}
            <div className="flex items-center border border-[#CBD5E1] bg-white divide-x divide-[#CBD5E1]">
              <button
                type="button"
                onClick={() => handleFontResize("sm")}
                aria-label="Decrease Font Size"
                className={`px-1.5 py-0.5 hover:bg-slate-100 ${fontScale === "sm" ? "bg-slate-200 font-bold text-[#003366]" : ""}`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleFontResize("normal")}
                aria-label="Normal Font Size"
                className={`px-1.5 py-0.5 hover:bg-slate-100 ${fontScale === "normal" ? "bg-slate-200 font-bold text-[#003366]" : ""}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleFontResize("lg")}
                aria-label="Increase Font Size"
                className={`px-1.5 py-0.5 hover:bg-slate-100 ${fontScale === "lg" ? "bg-slate-200 font-bold text-[#003366]" : ""}`}
              >
                A+
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={handleContrastToggle}
              aria-pressed={highContrast}
              aria-label="Toggle High Contrast Mode"
              className={`px-2 py-0.5 border border-[#CBD5E1] bg-white hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 ${
                highContrast ? "bg-[#003366] text-white border-[#003366]" : "text-slate-700"
              }`}
            >
              <span>🌓</span>
              <span className="hidden md:inline">{highContrast ? "Normal" : "High Contrast"}</span>
            </button>

            {/* Language Selector */}
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === "en" ? "hi" : "en"))}
              aria-label="Change Language"
              className="px-2 py-0.5 border border-[#CBD5E1] bg-white hover:bg-slate-100 text-[11px] font-bold text-[#003366]"
            >
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: Ministry & Portal Identity Header                                 */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          {/* Identity Left: Ashoka Lion Capital Emblem + Bilingual Titles */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* State Emblem of India SVG Placeholder */}
            <div className="flex flex-col items-center justify-center shrink-0 w-12 sm:w-14" aria-label="State Emblem of India">
              <svg viewBox="0 0 100 120" className="w-10 h-12 sm:w-12 sm:h-14 text-[#003366]" fill="currentColor">
                {/* Ashoka Lion Capital Simplified Silhouette */}
                <path d="M 50 10 C 45 10 38 15 38 24 C 38 29 41 33 44 35 C 38 35 32 38 30 45 C 28 52 32 60 36 64 C 34 68 35 73 38 77 C 40 79 43 80 46 80 L 54 80 C 57 80 60 79 62 77 C 65 73 66 68 64 64 C 68 60 72 52 70 45 C 68 38 62 35 56 35 C 59 33 62 29 62 24 C 62 15 55 10 50 10 Z" />
                <path d="M 28 82 L 72 82 L 68 90 L 32 90 Z" />
                {/* Ashoka Chakra Base Motif */}
                <circle cx="50" cy="86" r="3.5" fill="#FFFFFF" />
                <circle cx="50" cy="86" r="1" fill="#003366" />
                {/* Abacus platform */}
                <rect x="22" y="92" width="56" height="4" rx="1" />
                {/* Bell-shaped inverted lotus representation */}
                <path d="M 26 97 C 32 104 42 107 50 107 C 58 107 68 104 74 97 Z" />
                <text x="50" y="116" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#003366" fontFamily="sans-serif">
                  सत्यमेव जयते
                </text>
              </svg>
            </div>

            <div className="h-10 w-px bg-slate-300 hidden sm:block" aria-hidden="true" />

            {/* Portal Title & Ministry */}
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-lg font-bold text-[#003366] leading-tight">
                राष्ट्रीय फोरेंसिक औषधि परीक्षण पोर्टल
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                National Forensic Drug Testing Laboratory Portal
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-slate-600 mt-0.5">
                मादक पदार्थ नियंत्रण ब्यूरो (NCB) | Ministry of Home Affairs, Government of India
              </span>
            </div>
          </div>

          {/* Identity Right: Official Statutory Authority Seal */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 rounded-none text-right">
              <div className="flex items-center gap-1.5 justify-end text-[#003366] font-bold text-xs">
                <ShieldAlert size={14} className="text-[#003366]" />
                <span>OFFICIAL PORTAL</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">NDPS ACT 1985 | SEC 65B EVIDENCE ACT</p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-slate-300 text-[#003366] hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 3: Main Navigation Bar (Authoritative Navy Blue #003366)             */}
      {/* ========================================================================= */}
      <nav className="bg-[#003366] text-white border-b-2 border-[#002244]" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between h-12">
            <div className="flex items-center h-full space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={item.isActive ? "page" : undefined}
                    className={`h-full px-4 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold border-b-4 transition-colors ${
                      item.isActive
                        ? "bg-[#002244] text-[#FF9933] border-[#FF9933] font-bold"
                        : "text-white/90 border-transparent hover:bg-[#002B55] hover:text-white"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{lang === "hi" ? item.labelHi : item.labelEn}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: Security Classification Indicator */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <span className="inline-block w-2 h-2 bg-[#138808]" aria-hidden="true" />
              <span>STQC SECURED | RESTRICTED ACCESS</span>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 border-t border-[#002B55] space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={item.isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-l-4 ${
                      item.isActive
                        ? "bg-[#002244] text-[#FF9933] border-[#FF9933]"
                        : "text-white/90 border-transparent hover:bg-[#002B55]"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{lang === "hi" ? item.labelHi : item.labelEn}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
```

---

### 5.3 File: `src/components/ui/GovernmentFooter.tsx`
```tsx
import React from "react";
import Link from "next/link";

export function GovernmentFooter() {
  return (
    <footer className="w-full mt-auto shrink-0 select-none bg-[#002244] text-white border-t border-[#CBD5E1]" aria-label="Portal Footer">
      {/* Tricolor Solid Band Separator */}
      <div className="h-1 w-full flex flex-row shrink-0" aria-hidden="true">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#FFFFFF]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Main Informational 4-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs leading-relaxed text-slate-200">
          {/* Column 1: Portal Mandate */}
          <div>
            <h3 className="font-bold text-sm text-white mb-2 pb-1 border-b border-[#003366] uppercase tracking-wider">
              Legal Mandate
            </h3>
            <p className="text-slate-300 text-justify mb-2">
              National Forensic Drug Testing Laboratory operates under the statutory authority of the Narcotics Control Bureau (NCB), Ministry of Home Affairs.
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Statutory Basis: NDPS Act 1985 & Section 65B of Indian Evidence Act.
            </p>
          </div>

          {/* Column 2: Mandatory GIGW 3.0 Policies */}
          <div>
            <h3 className="font-bold text-sm text-white mb-2 pb-1 border-b border-[#003366] uppercase tracking-wider">
              Website Policies
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <Link href="#" className="hover:text-[#FF9933] hover:underline">
                  Website Policies & Terms of Use
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#FF9933] hover:underline">
                  Privacy Policy & Data Protection
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#FF9933] hover:underline">
                  Copyright & Hyperlinking Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#FF9933] hover:underline">
                  Accessibility Statement (WCAG 2.1 AA)
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#FF9933] hover:underline">
                  Disclaimer & Official Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Standards & Architecture */}
          <div>
            <h3 className="font-bold text-sm text-white mb-2 pb-1 border-b border-[#003366] uppercase tracking-wider">
              Compliance & Standards
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#FF9933]" />
                <span>Guidelines for Indian Govt. Websites (GIGW 3.0)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white" />
                <span>Digital India UX4G Design System</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#138808]" />
                <span>STQC Certified Cyber Architecture</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#FF9933]" />
                <span>FIPS 180-4 Cryptographic Hash Validation</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Nodal Contact & Emergency */}
          <div>
            <h3 className="font-bold text-sm text-white mb-2 pb-1 border-b border-[#003366] uppercase tracking-wider">
              Helpdesk & Nodal Desk
            </h3>
            <p className="text-slate-300 mb-1">Narcotics Control Bureau Headquarters</p>
            <p className="text-slate-300 mb-2">West Block-1, Wing-5, R.K. Puram, New Delhi - 110066</p>
            <p className="text-slate-300">
              <strong className="text-white">Emergency Helpline:</strong> 1933 (Toll Free)
            </p>
            <p className="text-slate-300">
              <strong className="text-white">NIC Support Desk:</strong> support-forensic@nic.in
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Footer: Attribution & Last Updated */}
      <div className="bg-[#001830] border-t border-[#002244] py-3 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <div>
            <p>© 2026 National Forensic Drug Testing Laboratory Portal, Government of India. All Rights Reserved.</p>
            <p className="text-[10px] text-slate-500">
              Designed, Developed and Hosted by <strong className="text-slate-300">National Informatics Centre (NIC)</strong>.
            </p>
          </div>
          <div className="text-right">
            <p>
              Last Reviewed & Updated: <strong className="text-slate-300">19 September 2026</strong>
            </p>
            <p className="text-[10px] text-slate-500">Application Version: 3.4.1-UX4G | Server Node: IN-DEL-01</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

### 5.4 File: `src/app/globals.css`
```css
@import "tailwindcss";

@theme inline {
  --color-navy: #003366;
  --color-brass: #B45309;
  --color-gov-blue: #003366;
  --color-gov-navy: #003366;
  --color-gov-dark: #002244;
  --color-gov-saffron: #FF9933;
  --color-gov-orange: #FF9933;
  --color-gov-green: #138808;
  --color-gov-canvas: #F4F6F9;
  --color-gov-border: #CBD5E1;
}

:root {
  --color-navy: #003366;
  --color-brass: #B45309;
  --background: #F4F6F9;
  --foreground: #0F172A;
}

/* High Contrast Mode Toggle for GIGW 3.0 Accessibility */
html.high-contrast {
  filter: contrast(125%);
}

html.high-contrast body {
  background-color: #FFFFFF !important;
  color: #000000 !important;
}

html.high-contrast a,
html.high-contrast button {
  outline: 2px solid #000000 !important;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

---

### 5.5 File: `src/components/ui/StampBadge.tsx`
```tsx
import React from "react";

export interface StampBadgeProps {
  status?: "positive" | "negative" | "inconclusive";
  variant?: "navy" | "brass" | "saffron" | "green";
  text?: string;
}

export function StampBadge({ status, variant, text }: StampBadgeProps) {
  let colorClass = "text-[#003366] border-[#003366] bg-blue-50";
  const displayText = text || status || "INCONCLUSIVE";
  const effectiveVariant =
    variant ||
    (status === "positive" ? "green" : status === "negative" ? "navy" : "brass");

  if (effectiveVariant === "green" || status === "positive") {
    colorClass = "text-[#138808] border-[#138808] bg-green-50";
  } else if (effectiveVariant === "saffron") {
    colorClass = "text-[#FF9933] border-[#FF9933] bg-amber-50";
  } else if (effectiveVariant === "brass" || status === "inconclusive") {
    colorClass = "text-[#B45309] border-[#B45309] bg-amber-50";
  } else {
    colorClass = "text-[#003366] border-[#003366] bg-blue-50";
  }

  return (
    <div
      className={`inline-block border-2 px-3 py-1 uppercase font-bold text-xs sm:text-sm tracking-widest ${colorClass} font-mono shadow-xs select-none`}
    >
      {displayText}
    </div>
  );
}
```

---

## 6. Worker Execution Checklist for Milestone 1

1. **Step 1: Write Components**:
   - Create `src/components/ui/GovernmentHeader.tsx` with the complete 3-tier header code.
   - Create `src/components/ui/GovernmentFooter.tsx` with the GIGW 3.0 footer code.
2. **Step 2: Update Layout**:
   - Overwrite `src/app/layout.tsx` to import and render `GovernmentHeader` and `GovernmentFooter`.
   - Ensure `noise.svg`, `radial-gradient`, and pastel gradients are completely deleted.
3. **Step 3: Update Globals & Theme**:
   - Overwrite `src/app/globals.css` with the UX4G color tokens, high-contrast mode, and remove startup keyframe animations.
4. **Step 4: Update StampBadge**:
   - Overwrite `src/components/ui/StampBadge.tsx` to support `{ variant, text, status }` and remove rotation/opacity blur.
5. **Step 5: Verify Build & Types**:
   - Run `npx tsc --noEmit` to verify 100% typecheck cleanly.
   - Run `npm run build` to verify clean Next.js build without warnings.
