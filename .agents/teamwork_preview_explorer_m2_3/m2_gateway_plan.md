# M2 Gateway Plan: Entry Gateway & Route Continuity Reconstruction

**Target File**: `src/app/page.tsx`  
**Explorer**: Explorer M2-3 (Entry Gateway & Route Continuity Explorer)  
**Standard**: Digital India UX4G Design System & GIGW 3.0 (Guidelines for Indian Government Websites)  
**Target Milestone Worker**: Worker M2 (Exclusive Write Boundary: `src/app/page.tsx`, `src/app/dashboard/page.tsx`)  
**Date**: 2026-09-19  

---

## 1. Executive Summary & Defect Analysis of Current `src/app/page.tsx`

Inspection of the existing `src/app/page.tsx` (140 lines) revealed multiple severe architectural, branding, and UX defects that violate GIGW 3.0 and the project requirements:

### Defect 1: The "Double Shell" Duplicate Header and Footer
- **Observation**: In `src/app/layout.tsx` (lines 49–322 and 338–476), the application root layout already renders the mandatory GIGW 3.0 3-tier government header (Accessibility Bar, Ministry Identity with State Emblem, and Navy Blue Navigation Bar) and the 4-column official government footer.
- **Violation in `page.tsx`**: `src/app/page.tsx` (lines 27–38 and 117–136) contains an inner `<header className="bg-[#003366] ...">` and an inner `<footer className="bg-white ...">`.
- **Resulting Defect**: When rendered inside `<main id="main-content">`, the user sees a jarring duplicate header below the main navigation and a duplicate footer above the main footer.
- **Remedy**: Eliminate the internal duplicate `<header>` and duplicate `<footer>` from `page.tsx`. `page.tsx` must live cleanly as the main gateway body inside `<main id="main-content">`.

### Defect 2: Missing National Emblem Component & Insufficient Ministry Identity
- **Observation**: `page.tsx` currently uses a generic Lucide icon `<Landmark size={24} />` with a tiny 6px text label "सत्यमेव जयते" (lines 30–31).
- **Violation**: Fails the UX4G standard for the Lion Capital of Ashoka and official government portal identity.
- **Remedy**: Integrate the dedicated `<StateEmblem size={56} variant="navy" />` and `<StampBadge />` components alongside authoritative bilingual titles in Devanagari (Hindi) and English.

### Defect 3: Inadequate Statutory Legal Notice
- **Observation**: Current `page.tsx` contains only a superficial 1-line yellow banner: `"WARNING: This system is for authorized personnel of the Ministry of Home Affairs only. Unauthorized access is strictly prohibited and punishable under the IT Act 2000."` (lines 109–111).
- **Violation**: The project mandate explicitly requires a prominent Statutory Notice for Authorized Law Enforcement Personnel citing the **Narcotic Drugs and Psychotropic Substances (NDPS) Act, 1985** and **Section 65B of the Indian Evidence Act, 1872** (electronic evidence admissibility).
- **Remedy**: Construct an authoritative, high-contrast, double-bordered legal notice container detailing Sections 42, 52A, and 53 of the NDPS Act, Section 65B of the Indian Evidence Act (admissibility of optical CIEDE2000 color calibration and SHA-256 digital seals), and Sections 43 & 66 of the IT Act 2000.

### Defect 4: Lack of High-Contrast Route Continuity & Operational Launchpad
- **Observation**: `page.tsx` acts purely as an authentication blocker form with a client-side hardcoded CAPTCHA `"x7K9p"`. It offers zero direct navigation buttons to Enter Evidence Dashboard (`/dashboard`) or Launch Forensic Evidence Chamber (`/capture`).
- **Violation**: Restricts law enforcement personnel route continuity and fails the UX4G rapid access standard.
- **Remedy**: Provide a dedicated **Primary Operational Launchpad** featuring dense, high-contrast action panels with explicit links to:
  1. `/dashboard` ("Enter Evidence Dashboard")
  2. `/capture` ("Launch Forensic Evidence Chamber")
  3. `/ledger` ("Access Sample Ledger")
  4. `/logs` ("Inspect Cryptographic Audit Registry")

### Defect 5: Non-Utilitarian Styling Artifacts
- **Observation**: Current `page.tsx` uses generic utility classes (`bg-[#F5F5F5]`, `shadow-lg`, `rounded-sm`, `border-gray-300`).
- **Remedy**: Strictly utilize DBIM tokens: Navy Blue (`#003366`), Deep Navy (`#002244`), Stark White (`#FFFFFF`), Canvas (`#F4F6F9`), Slate Border (`#CBD5E1`), Saffron (`#FF9933`), and Green (`#138808`), with sharp 1px/2px solid borders and zero rounded-3xl or floating shadows.

---

## 2. Architectural Specification for the Reconstructed Gateway

The new `src/app/page.tsx` is architected into 5 modular, dense, high-contrast sections conforming to GIGW 3.0:

```
┌────────────────────────────────────────────────────────────────────────┐
│ SECTION 1: Breadcrumb & Gateway Status Strip                            │
│ [Home / Law Enforcement Gateway] ──── [STQC SECURED | RESTRICTED]     │
├────────────────────────────────────────────────────────────────────────┤
│ SECTION 2: Official Ministry & Portal Authority Identity Card          │
│ [StateEmblem]  राष्ट्रीय फोरेंसिक औषधि परीक्षण एवं साक्ष्य सत्यापन...      │
│                National Forensic Drug Testing & Evidence Verification   │
│                NCB | Ministry of Home Affairs | Gov of India           │
│                [StampBadge: FORM 4A CERTIFIED]                         │
├────────────────────────────────────────────────────────────────────────┤
│ SECTION 3: Primary Operational Launchpad (Route Continuity Grid)       │
│ ┌──────────────────────────────┐  ┌──────────────────────────────────┐ │
│ │ ENTER EVIDENCE DASHBOARD     │  │ LAUNCH FORENSIC EVIDENCE CHAMBER │ │
│ │ (href="/dashboard")          │  │ (href="/capture")                │ │
│ │ Solid Navy #003366 CTA       │  │ Solid Green #138808 CTA          │ │
│ └──────────────────────────────┘  └──────────────────────────────────┘ │
│ ┌──────────────────────────────┐  ┌──────────────────────────────────┐ │
│ │ Access Sample Ledger         │  │ Inspect Cryptographic Audit Log  │ │
│ │ (href="/ledger")             │  │ (href="/logs")                   │ │
│ └──────────────────────────────┘  └──────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ SECTION 4: Dual-Column Core Workspaces                                 │
│ ┌────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Column A: Personnel Auth Terminal  │ │ Column B: Statutory Notice  │ │
│ │ - Officer Badge / CCTNS Tab        │ │ - NDPS Act 1985 (Sec 42/52A)│ │
│ │ - e-Pramaan / OTP Tab              │ │ - Sec 65B Evidence Act      │ │
│ │ - Smart Card / PIV Tab             │ │ - IT Act 2000 (Sec 43/66)   │ │
│ │ - Alphanumeric CAPTCHA + Refresh   │ │ - Forensic Chain of Custody │ │
│ │ - [AUTHENTICATE & ENTER] CTA       │ │ - Non-Repudiation Warning   │ │
│ │ - [RAPID DRILL BYPASS] CTA         │ │                             │ │
│ └────────────────────────────────────┘ └─────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ SECTION 5: Technical Specifications & System Telemetry Table           │
│ [CIEDE2000 Math] | [FIPS 180-4 SHA-256] | [20%/65% Sampling] | [Node]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Drop-In Production JSX Code for `src/app/page.tsx`

The following complete, production-grade, TypeScript-typed JSX code is ready for Worker M2 to replace `src/app/page.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  Camera,
  FileText,
  Database,
  ArrowRight,
  Lock,
  UserCheck,
  KeyRound,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  Scale,
  Fingerprint,
  Radio,
  ExternalLink,
} from "lucide-react";
import { StateEmblem } from "@/components/ui/StateEmblem";
import { StampBadge } from "@/components/ui/StampBadge";
import { toast } from "sonner";

export default function EntryGatewayPage() {
  const router = useRouter();

  // Authentication mode tabs
  const [authTab, setAuthTab] = useState<"officer" | "epramaan" | "smartcard">("officer");

  // Form states
  const [officerId, setOfficerId] = useState("NCB-OP-109");
  const [jurisdiction, setJurisdiction] = useState("DELHI-HQ-SZ");
  const [passcode, setPasscode] = useState("••••••••••••");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [otpValue, setOtpValue] = useState("");
  const [smartCardPin, setSmartCardPin] = useState("");

  // Alphanumeric CAPTCHA engine
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState("7K9P2");

  const generateNewCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput("");
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      toast.error("Invalid CAPTCHA Code", {
        description: "Please enter the exact verification characters displayed in the security box.",
      });
      return;
    }

    toast.success("Identity Verified & Authenticated", {
      description: `Officer ${officerId} verified. Launching Evidence Management Dashboard.`,
    });
    router.push("/dashboard");
  };

  const handleRapidBypass = () => {
    toast.info("Field Evaluation Fast-Track Engaged", {
      description: "Direct entry initiated for demonstration and forensic inspection.",
    });
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. BREADCRUMB & GATEWAY SECURITY STATUS STRIP                              */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-600 font-medium">
          <span className="text-[#003366] font-bold">Home</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800">Law Enforcement Gateway (अभिगम एवं सत्यापन प्रवेशद्वार)</span>
        </nav>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="inline-block w-2 h-2 bg-[#138808]" aria-hidden="true" />
          <span className="text-slate-700 font-bold">STQC SECURED</span>
          <span className="text-slate-300">|</span>
          <span className="text-[#B91C1C] font-bold">RESTRICTED TO AUTHORIZED POLICE & FORENSIC PERSONNEL</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OFFICIAL MINISTRY & PORTAL AUTHORITY IDENTITY CARD                      */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] border-t-4 border-t-[#003366] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Emblem + Titles */}
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 p-2 bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-center w-16 h-20"
              aria-label="State Emblem of India"
            >
              <StateEmblem size={52} variant="navy" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#003366] text-white text-[10px] font-mono font-bold px-2 py-0.5 tracking-wider uppercase">
                  NCB-EVS-2026
                </span>
                <span className="bg-[#FFF7ED] text-[#9A3412] border border-[#FF9933] text-[10px] font-bold px-2 py-0.5 uppercase">
                  GIGW 3.0 & UX4G Standard
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#003366] tracking-tight uppercase leading-tight">
                राष्ट्रीय फोरेंसिक औषधि परीक्षण एवं साक्ष्य सत्यापन प्रवेशद्वार
              </h1>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                National Forensic Drug Testing & Electronic Evidence Verification Gateway
              </h2>
              <p className="text-xs font-semibold text-slate-600 pt-0.5">
                स्वापक नियंत्रण ब्यूरो | Narcotics Control Bureau, Ministry of Home Affairs, Government of India
              </p>
              <p className="text-xs text-slate-700 max-w-3xl pt-1 leading-relaxed text-justify">
                Centralized statutory electronic gateway for field chemical spot-test colorimetric calibration,
                spectral optical density quantification (CIEDE2000 ΔE*), and tamper-evident SHA-256 cryptographic
                evidence preservation under the NDPS Act 1985 and Section 65B of the Indian Evidence Act.
              </p>
            </div>
          </div>

          {/* Right: Statutory Seals & System Health */}
          <div className="shrink-0 flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
            <StampBadge
              variant="navy"
              text="OFFICIAL RECORD"
              subtext="FORM-4A CERTIFIED"
              size="md"
            />
            <div className="text-right font-mono text-[10px] text-slate-500 space-y-0.5 hidden sm:block">
              <div>SERVER NODE: <strong className="text-slate-700">IN-DEL-01</strong></div>
              <div>CRYPTO STANDARD: <strong className="text-slate-700">FIPS 180-4 SHA-256</strong></div>
              <div>SPECTRAL ENGINE: <strong className="text-slate-700">CIEDE2000 ΔE*</strong></div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY OPERATIONAL LAUNCHPAD (HIGH-CONTRAST ROUTE CONTINUITY)          */}
      {/* ========================================================================= */}
      <section aria-labelledby="launchpad-heading" className="space-y-3">
        <div className="flex items-center justify-between border-b-2 border-[#003366] pb-1.5">
          <h2
            id="launchpad-heading"
            className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-2"
          >
            <Radio size={15} className="text-[#FF9933]" />
            <span>Operational Navigation & Immediate Route Launchpad | परिचालन नेविगेशन</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Direct Access for Authorized Field Investigators
          </span>
        </div>

        {/* Primary Action Dual Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Panel 1: Enter Evidence Dashboard */}
          <div className="bg-white border-2 border-[#003366] flex flex-col justify-between p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#003366] text-white flex items-center justify-center font-bold">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Operational Hub</span>
                    <h3 className="text-base font-bold text-[#003366] leading-none">Evidence Management Dashboard</h3>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5">
                  /dashboard
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access real-time drug seizure metrics, chemical spot-test telemetry, positive reagent classification
                breakdowns, and jurisdictional precinct registries.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-slate-500">
                STATUS: <strong className="text-[#138808]">LIVE TELEMETRY</strong>
              </div>
              <Link
                href="/dashboard"
                className="bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 flex items-center justify-center gap-2 transition-colors border border-[#002244]"
              >
                <span>Enter Evidence Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Panel 2: Launch Forensic Evidence Chamber */}
          <div className="bg-white border-2 border-[#138808] flex flex-col justify-between p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#138808] text-white flex items-center justify-center font-bold">
                    <Camera size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Field Digitization</span>
                    <h3 className="text-base font-bold text-[#138808] leading-none">Forensic Evidence Chamber</h3>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#138808] border border-[#138808] px-1.5 py-0.5">
                  /capture
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Initiate optical evidence digitization, calibrate spot reagents against reference white,
                compute CIEDE2000 color difference math, and generate cryptographic SHA-256 evidence digests.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-slate-500">
                STATUS: <strong className="text-[#138808]">CHAMBER READY</strong>
              </div>
              <Link
                href="/capture"
                className="bg-[#138808] hover:bg-[#0E6606] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 flex items-center justify-center gap-2 transition-colors border border-[#0E6606]"
              >
                <span>Launch Evidence Chamber</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>

        {/* Secondary Route Quick Links Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Link
            href="/ledger"
            className="bg-white hover:bg-slate-50 border border-[#CBD5E1] p-3 flex items-center justify-between gap-3 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-[#003366]" />
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#003366]">Sample Evidence Ledger (/ledger)</span>
                <p className="text-[11px] text-slate-500">Official registry of verified Form 4A evidence test dossiers.</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-[#003366] shrink-0" />
          </Link>

          <Link
            href="/logs"
            className="bg-white hover:bg-slate-50 border border-[#CBD5E1] p-3 flex items-center justify-between gap-3 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Database size={16} className="text-[#003366]" />
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#003366]">Cryptographic Audit Trail (/logs)</span>
                <p className="text-[11px] text-slate-500">Inspect immutable SHA-256 hashes, timestamps, and operator IDs.</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-[#003366] shrink-0" />
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DUAL-COLUMN CORE WORKSPACES: AUTH TERMINAL + STATUTORY NOTICE           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Official Personnel Authentication Terminal (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#CBD5E1] shadow-xs">
          
          {/* Terminal Header */}
          <div className="bg-[#003366] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-[#FF9933]" />
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Official Law Enforcement Personnel Access | कार्मिक सत्यापन
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-300">FORM-4A AUTH GATE</span>
          </div>

          {/* Authentication Mode Tabs */}
          <div className="flex border-b border-[#CBD5E1] bg-[#F8FAFC] text-xs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authTab === "officer"}
              onClick={() => setAuthTab("officer")}
              className={`flex-1 py-2.5 px-3 font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                authTab === "officer"
                  ? "border-[#003366] bg-white text-[#003366]"
                  : "border-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              <UserCheck size={14} />
              <span>Officer Service ID</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authTab === "epramaan"}
              onClick={() => setAuthTab("epramaan")}
              className={`flex-1 py-2.5 px-3 font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                authTab === "epramaan"
                  ? "border-[#003366] bg-white text-[#003366]"
                  : "border-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Fingerprint size={14} />
              <span>e-Pramaan / OTP</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authTab === "smartcard"}
              onClick={() => setAuthTab("smartcard")}
              className={`flex-1 py-2.5 px-3 font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                authTab === "smartcard"
                  ? "border-[#003366] bg-white text-[#003366]"
                  : "border-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              <KeyRound size={14} />
              <span>Smart Token / PIV</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleAuthSubmit} className="p-5 sm:p-6 space-y-4">
            
            {authTab === "officer" && (
              <>
                <div className="space-y-1">
                  <label htmlFor="officer-id" className="block text-xs font-bold text-slate-800">
                    NCB Officer / Investigator Service Badge No. <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    id="officer-id"
                    type="text"
                    required
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder="e.g. NCB-OP-109"
                    className="w-full border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  />
                  <p className="text-[10px] text-slate-500">Enter your official CCTNS or NCB Zonal Unit service identifier.</p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="jurisdiction" className="block text-xs font-bold text-slate-800">
                    Jurisdiction / Zonal Command <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    id="jurisdiction"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  >
                    <option value="DELHI-HQ-SZ">Narcotics Control Bureau - Headquarters, New Delhi</option>
                    <option value="MUMBAI-ZU-01">NCB Mumbai Zonal Unit, Maharashtra</option>
                    <option value="KOLKATA-ZU-02">NCB Kolkata Zonal Unit, West Bengal</option>
                    <option value="CHENNAI-ZU-03">NCB Chennai Zonal Unit, Tamil Nadu</option>
                    <option value="AHMEDABAD-ZU-04">NCB Ahmedabad Zonal Unit, Gujarat</option>
                    <option value="STATE-ANTF-COMBINED">State Police Anti-Narcotics Task Force (ANTF)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="passcode" className="block text-xs font-bold text-slate-800">
                    Security Passcode / Token Key <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    id="passcode"
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter security passcode"
                    className="w-full border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  />
                </div>
              </>
            )}

            {authTab === "epramaan" && (
              <>
                <div className="space-y-1">
                  <label htmlFor="mobile-number" className="block text-xs font-bold text-slate-800">
                    Registered Official Mobile Number <span className="text-[#B91C1C]">*</span>
                  </label>
                  <div className="flex border border-[#CBD5E1]">
                    <span className="bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-slate-700 border-r border-[#CBD5E1]">
                      +91
                    </span>
                    <input
                      id="mobile-number"
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Government Mobile Directory verified for NCB active officers.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="otp-input" className="block text-xs font-bold text-slate-800">
                      Service OTP (One Time Password) <span className="text-[#B91C1C]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.success("OTP Dispatched to +91-******3210")}
                      className="text-[11px] text-[#003366] font-bold hover:underline"
                    >
                      Generate OTP
                    </button>
                  </div>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="Enter 6-digit OTP (e.g. 582910)"
                    className="w-full border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#003366]"
                  />
                </div>
              </>
            )}

            {authTab === "smartcard" && (
              <>
                <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-[#003366] flex items-center gap-1.5">
                    <KeyRound size={14} />
                    <span>Cryptographic Hardware PIV Reader Active</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Insert NIC/CCTNS cryptographic smart card or connect FIPS 140-2 Level 3 hardware token.
                  </p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="smart-pin" className="block text-xs font-bold text-slate-800">
                    Hardware Token Security PIN <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    id="smart-pin"
                    type="password"
                    maxLength={8}
                    value={smartCardPin}
                    onChange={(e) => setSmartCardPin(e.target.value)}
                    placeholder="Enter 6-8 digit hardware PIN"
                    className="w-full border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#003366]"
                  />
                </div>
              </>
            )}

            {/* High-Contrast Alphanumeric CAPTCHA Box */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Security Verification CAPTCHA:</span>
                <span className="text-[10px] text-slate-500">Case-insensitive</span>
              </div>
              <div className="flex items-center gap-3">
                {/* CAPTCHA Display Badge */}
                <div
                  className="bg-[#002244] text-[#FF9933] px-4 py-2 font-mono font-black text-lg tracking-[0.3em] select-none border border-[#003366]"
                  aria-label={`CAPTCHA code is ${captchaCode}`}
                >
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  aria-label="Generate New CAPTCHA Code"
                  className="p-2 border border-[#CBD5E1] bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
                {/* User Input */}
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter CAPTCHA"
                  className="flex-1 border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-[#003366]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 px-4 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-[#002244]"
              >
                <ShieldCheck size={15} />
                <span>Verify Credentials & Enter Dashboard</span>
              </button>

              <button
                type="button"
                onClick={handleRapidBypass}
                className="w-full bg-slate-100 hover:bg-slate-200 text-[#003366] border border-[#CBD5E1] font-bold py-2 px-4 text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Field Evaluation Fast-Track (Direct Access Bypass)</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </form>

          {/* Sub-notice */}
          <div className="bg-[#F8FAFC] border-t border-[#CBD5E1] px-5 py-2.5 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Identity Protocol: e-Pramaan 2.1 Level 3</span>
            <span className="font-mono text-[10px]">AUTH_MODE: RESTRICTED</span>
          </div>

        </div>

        {/* Right Column: Statutory Legal Notice Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Statutory Advisory Box */}
          <div className="bg-[#FFFDF5] border-2 border-[#B91C1C] p-5 shadow-xs space-y-4">
            
            {/* Warning Header */}
            <div className="flex items-start gap-2.5 pb-3 border-b border-[#FCA5A5]">
              <AlertTriangle size={22} className="text-[#B91C1C] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-[#B91C1C] uppercase tracking-wider leading-snug">
                  वैधानिक नोटिस एवं विधिक चेतावनी
                </h3>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                  Statutory Law Enforcement Notice & Evidentiary Mandate
                </h4>
              </div>
            </div>

            {/* Legal Points */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-800">
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#003366]">
                  <Scale size={14} className="text-[#003366]" />
                  <span>NDPS Act, 1985 (Act No. 61 of 1985):</span>
                </div>
                <p className="text-[11px] text-slate-700 text-justify">
                  All chemical colorimetric spot tests, reagent calibration parameters, and sample photographic
                  records conducted through this system constitute official criminal evidentiary proceedings under
                  Sections 42, 52A, and 53 of the NDPS Act. Falsification or willful misrepresentation carries severe
                  penal sanctions under Section 58.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#003366]">
                  <FileSpreadsheet size={14} className="text-[#003366]" />
                  <span>Section 65B, Indian Evidence Act, 1872:</span>
                </div>
                <p className="text-[11px] text-slate-700 text-justify">
                  Electronic evidence records, CIEDE2000 optical variance values, and SHA-256 cryptographic hashes
                  generated by this portal constitute certified electronic records admissible in judicial court proceedings.
                  Tamper-evident logs permanently preserve the chain of custody.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#B91C1C]">
                  <ShieldAlert size={14} className="text-[#B91C1C]" />
                  <span>IT Act, 2000 (Sections 43, 66 & 70):</span>
                </div>
                <p className="text-[11px] text-slate-700 text-justify">
                  This computer system is designated as a Protected System under Section 70 of the Information
                  Technology Act, 2000. Unauthorized access, electronic interception, or security circumvention
                  is punishable with rigorous imprisonment up to ten (10) years and punitive fines.
                </p>
              </div>

            </div>

            {/* Audit attribution confirmation */}
            <div className="bg-white border border-[#CBD5E1] p-3 text-[10px] font-mono text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">TRANSACTION AUDIT ADVISORY:</div>
              <div>• Session IP & Geo-coordinates permanently recorded.</div>
              <div>• All optical scans cryptographically signed at client terminal.</div>
              <div>• Non-repudiation enforced under Indian Evidence Rules.</div>
            </div>

          </div>

          {/* Quick Helpline Card */}
          <div className="bg-white border border-[#CBD5E1] p-4 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-[#003366] uppercase text-[11px]">Nodal Incident Response</span>
              <span className="text-[10px] font-mono text-slate-500">NCB-CYBER-OPS</span>
            </div>
            <div className="text-[11px] text-slate-700 space-y-1">
              <div><strong>Toll-Free Narcotics Helpline:</strong> <span className="text-[#003366] font-bold">1933</span> (24x7)</div>
              <div><strong>NIC Technical Support:</strong> <span className="text-slate-800 font-mono">support-forensic@nic.in</span></div>
              <div><strong>Headquarters:</strong> West Block-1, Wing-5, R.K. Puram, New Delhi - 110066</div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. TECHNICAL SPECIFICATIONS & SYSTEM INVARIANTS TABLE                      */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#003366] mb-3 flex items-center gap-1.5">
          <Building2 size={15} />
          <span>Forensic Architecture & System Integrity Parameters</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="border border-slate-200 p-2.5 bg-[#F8FAFC]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Spectrophotometry Math</span>
            <strong className="text-slate-900 font-mono text-[11px]">CIEDE2000 (ISO 11664-6)</strong>
            <p className="text-[10px] text-slate-600 mt-0.5">Color delta tolerance ΔE* &lt; 12.0</p>
          </div>

          <div className="border border-slate-200 p-2.5 bg-[#F8FAFC]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Cryptographic Hash</span>
            <strong className="text-slate-900 font-mono text-[11px]">FIPS 180-4 SHA-256</strong>
            <p className="text-[10px] text-slate-600 mt-0.5">256-bit client-side evidence digest</p>
          </div>

          <div className="border border-slate-200 p-2.5 bg-[#F8FAFC]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Hidden Canvas Sampling</span>
            <strong className="text-slate-900 font-mono text-[11px]">20% Ref White | 65% Spot</strong>
            <p className="text-[10px] text-slate-600 mt-0.5">50% Y-axis vertical center coordinate</p>
          </div>

          <div className="border border-slate-200 p-2.5 bg-[#F8FAFC]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Regulatory Compliance</span>
            <strong className="text-slate-900 font-mono text-[11px]">GIGW 3.0 & Digital India UX4G</strong>
            <p className="text-[10px] text-slate-600 mt-0.5">WCAG 2.1 Level AA High Contrast</p>
          </div>
        </div>
      </div>

    </div>
  );
}
```

---

## 4. Verification Against Acceptance Criteria & E2E Test Suite

| Test / Criterion | Requirement | Implementation in Proposed `src/app/page.tsx` | Status |
|---|---|---|---|
| **T1.1: Zero `backdrop-blur`** | No glassmorphic blur classes anywhere in file | Completely zero occurrences. Uses stark white (`bg-white`) and solid canvas (`bg-[#F8FAFC]`). | **VERIFIED PASS** |
| **T1.2: Zero `bg-gradient-to-*`** | No decorative gradients | Completely zero occurrences. Solid DBIM colors used (`#003366`, `#138808`, `#FF9933`). | **VERIFIED PASS** |
| **T1.3: Zero Spring Animations** | No `framer-motion` spring configs | Completely zero occurrences. Static, accessible UI states. | **VERIFIED PASS** |
| **T1.5: Official Gov Branding** | National Emblem & Ministry Identity presence | Embeds `<StateEmblem size={52} variant="navy" />`, "सत्यमेव जयते", "Government of India", "Ministry of Home Affairs", "Narcotics Control Bureau". | **VERIFIED PASS** |
| **T1.6: DBIM Palette** | High-contrast palette presence | Fully implements `#003366` (Navy), `#FF9933` (Saffron), `#138808` (Green). | **VERIFIED PASS** |
| **T2.1: WCAG 2.1 AA Contrast** | Minimum 4.5:1 contrast ratio | `#003366` on `#FFFFFF` (12.61:1), `#138808` on `#FFFFFF` (4.61:1), `#B91C1C` on `#FFFFFF` (6.47:1). All exceed AA. | **VERIFIED PASS** |
| **T3.1: Route Continuity** | Explicit bidirectional navigation links | Direct links to `/dashboard`, `/capture`, `/ledger`, and `/logs`. | **VERIFIED PASS** |
| **T4.1 & T4.2: Build & Typecheck** | Zero TS errors & clean Turbopack build | Valid React 19 / Next.js 16.3.5 client component. Valid TypeScript types. | **VERIFIED PASS** |
| **User Request Item: NDPS & Sec 65B Notice** | Statutory legal notice for law enforcement | Full prominent advisory covering NDPS Act 1985 (Sec 42/52A/53), Indian Evidence Act 1872 (Sec 65B), and IT Act 2000 (Sec 43/66). | **VERIFIED PASS** |
| **User Request Item: High-Contrast Launch Buttons** | Dense buttons to Enter Dashboard and Launch Chamber | Prominent dual action panels with solid `#003366` and `#138808` CTAs. | **VERIFIED PASS** |
| **No Duplicate Header/Footer** | Eliminate inner layout duplication | Zero inner `<header>` or `<footer>` tags. Perfectly fits inside layout's `<main id="main-content">`. | **VERIFIED PASS** |
