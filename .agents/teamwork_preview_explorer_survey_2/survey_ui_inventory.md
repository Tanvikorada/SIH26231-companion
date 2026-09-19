# Comprehensive UI Component & Layout Survey
**Digital India UX4G and GIGW 3.0 Compliance Inventory**
*Investigated by: `teamwork_preview_explorer_survey_2` (UI Component & Layout Explorer)*
*Date: 2026-09-19*

---

## 1. Executive Summary & Problem Scope

The application is a Next.js (App Router v16) field drug-testing forensic companion app designed for the Narcotics Control Bureau (NCB), Ministry of Home Affairs, Government of India.

Currently, the frontend suffers from severe aesthetic misalignment: it utilizes a trendy "Silicon Valley startup / Web3 / cyberpunk" design language characterized by:
- Glassmorphism (`backdrop-blur-xl`, semi-transparent frosted panels, blurred background blobs)
- Colorful gradient backgrounds (`bg-gradient-to-br from-indigo-500 to-purple-600`)
- Sci-fi / video-game laser scan-lines and radar pulses (`animate-scan-line`, `animate-ping`, glow shadows)
- Low-density "Bento-Box" floating rounded cards (`rounded-3xl`, `rounded-2xl`, scale transitions on hover)
- Framer Motion physics-based spring animations (`type: "spring", stiffness: 300, damping: 24`)
- Background noise texture overlays (`/noise.svg`) and dot grids

To satisfy **Digital India UX4G** and **GIGW 3.0 (Guidelines for Indian Government Websites)**, the UI must be completely transformed into an authoritative, utilitarian, high-contrast, information-dense government portal adhering to the Digital Brand Identity Manual (DBIM):
- Deep Navy Blue (`#0F2862` / `#003366`), Stark White backgrounds (`#FFFFFF`), Ashoka Saffron (`#FF9933`), and India Green (`#138808`)
- High-contrast, tabular, border-and-table data density
- Official 3-tier Government of India header (Top utility/accessibility bar + Ministry & National Emblem header + Main navigation)
- Formal government breadcrumbs, fieldsets, and standard forms
- Complete removal of glassmorphism, gradients, spring animations, and sci-fi glowing effects
- 100% preservation of forensic CIEDE2000 math, SHA-256 hashing, canvas sampling, and Prisma database connections.

---

## 2. Complete File Inventory

### 2.1 UI Pages & Layouts (`src/app/`)
| File Path | Type | Role | Component Nature |
|---|---|---|---|
| `src/app/layout.tsx` | Server Layout | Root application layout, font loader, metadata, global styles, SW registration | Presentational Shell |
| `src/app/page.tsx` | Client Page (`"use client"`) | Official Personnel Login / Authentication Gateway | Stateful UI (Officer ID vs Mobile OTP tabs, CAPTCHA validation) |
| `src/app/dashboard/page.tsx` | Client Page (`"use client"`) | Operator Command Dashboard & Quick Navigation | Stateful & Backend-Connected (fetches `/api/v1/dashboard/stats`) |
| `src/app/capture/page.tsx` | Client Page (`"use client"`) | Forensic Evidence Capture, Camera Scanner & Analysis Workflow | Stateful & Core Forensic Engine (Canvas extraction, CIEDE2000, SHA-256, POSTs to `/api/v1/tests/sync`) |
| `src/app/ledger/page.tsx` | Client Page (`"use client"`) | Central Evidence Register & Cryptographic Record Table | Stateful & Backend-Connected (fetches `/api/v1/tests?limit=100`) |
| `src/app/result/[id]/page.tsx` | Client Page (`"use client"`) | Certificate of Analysis (Form 4A) Printable A4 Document | Stateful & Backend-Connected (fetches `/api/v1/tests/[id]`) |
| `src/app/logs/page.tsx` | Client Page (`"use client"`) | Forensic Logs (Dark Cyberpunk Console) | Stateful & Backend-Connected (fetches `/api/v1/tests?limit=50`) |
| `src/app/logs/[id]/page.tsx` | Server Page | Case Dossier / Detailed Evidence Record | Backend-Connected (direct Prisma DB query `prisma.test.findUnique`) |

### 2.2 Reusable UI Components (`src/components/`)
| File Path | Role | Component Nature |
|---|---|---|
| `src/components/ui/StampBadge.tsx` | Visual verdict badge (`positive` / `negative` / `inconclusive`) | Purely Presentational (Props: `{ status }`) |

### 2.3 Backend API Routes (`src/app/api/v1/`)
| File Path | Method | Purpose |
|---|---|---|
| `src/app/api/v1/dashboard/stats/route.ts` | `GET` | Returns aggregate counts: `total_tests`, `by_result`, `failed_calibration_count` |
| `src/app/api/v1/tests/route.ts` | `GET` | Paginated query of test records from Prisma |
| `src/app/api/v1/tests/[id]/route.ts` | `GET` | Single test record retrieval by UUID |
| `src/app/api/v1/tests/sync/route.ts` | `POST` | Ingests new test with base64 image, hash, GPS, reagent, and verdict |

### 2.4 Core Logic & Utilities (`src/lib/`)
| File Path | Purpose |
|---|---|
| `src/lib/engine.ts` | **CRITICAL FORENSIC CORE**: `rgb2lab()`, `deltaE00()`, `calibrateColor()`, `classifySpotTest()`, `generateSHA256()` |
| `src/lib/prisma.ts` | Global PrismaClient singleton instance |
| `src/lib/utils.ts` | Tailwind `cn()` helper function |
| `src/lib/color_library.json` | Reagent chemical reaction color profile database |

### 2.5 Styling & Public Assets
| File Path | Purpose | GIGW Compliance Issue |
|---|---|---|
| `src/app/globals.css` | Global Tailwind CSS configuration | Contains custom sci-fi animations (`scan-line`, `pulse-slow`, `fadeInUp`) |
| `tailwind.config.ts` | Tailwind theme configuration | Defines custom gov colors and keyframe animations |
| `public/noise.svg` | SVG noise grain texture | Used in `layout.tsx` background overlay (Must be removed) |

---

## 3. Exhaustive Catalog of GIGW 3.0 / UX4G Violations

### 3.1 `backdrop-blur` & Glassmorphism Artifacts
| Location | Line | Exact Code Snippet | Violation Description |
|---|---|---|---|
| `src/app/capture/page.tsx` | 114 | `<header className="sticky top-1.5 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">` | Glassmorphic floating translucent top header with heavy blur |
| `src/app/capture/page.tsx` | 151 | `<button type="button" ... className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-black/70 transition-colors">` | Floating frosted glass circular retake button |
| `src/app/dashboard/page.tsx` | 28 | `<header className="sticky top-1.5 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">` | Translucent blurred sticky header bar |
| `src/app/logs/page.tsx` | 20 | `<div className="p-4 bg-[#1E3E62]/50 border-b border-[#1E3E62] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">` | Frosted dark glass header bar |
| `src/app/result/[id]/page.tsx` | 38 | `<button ... className="... bg-white/10 px-2 py-1 rounded-sm border border-white/20">` | Frosted glassmorphic action button |
| `src/app/dashboard/page.tsx` | 72 | `<div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>` | Glassmorphic glowing blur blob inside action card |
| `src/app/dashboard/page.tsx` | 82 | `<div className="absolute -right-4 -bottom-4 bg-slate-100 w-32 h-32 rounded-full blur-2xl group-hover:bg-slate-200 transition-all"></div>` | Soft blurred background circle inside bento card |
| `src/app/capture/page.tsx` | 197 | `<div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>` | Semi-transparent glass hover overlay on submit button |

### 3.2 Gradients & Background Textures (`bg-gradient-to-*`, `radial-gradient`, `noise.svg`)
| Location | Line | Exact Code Snippet | Violation Description |
|---|---|---|---|
| `src/app/layout.tsx` | 35 | `<div className="h-1.5 w-full bg-gradient-to-r from-gov-orange via-white to-gov-green opacity-90 shadow-sm z-50 fixed top-0" />` | Floating pastel tricolor gradient bar |
| `src/app/layout.tsx` | 39 | `<div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>` | SVG noise grain overlay texture |
| `src/app/layout.tsx` | 40 | `<div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>` | Radial dot matrix pattern overlay |
| `src/app/dashboard/page.tsx` | 31 | `<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-blue to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20">` | Gradient icon tile with colored glow shadow |
| `src/app/dashboard/page.tsx` | 71 | `<Link href="/capture" className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white ...">` | Startup-style vibrant indigo-to-purple gradient bento card |
| `src/app/capture/page.tsx` | 196 | `... bg-gradient-to-r from-gov-blue to-blue-700 hover:shadow-blue-900/30 active:scale-[0.98] text-white` | Gradient submit button with colored drop shadow |

### 3.3 Framer Motion, Spring Physics, and Sci-Fi Animations
| Location | Line | Exact Code Snippet | Violation Description |
|---|---|---|---|
| `src/app/dashboard/page.tsx` | 6 | `import { motion } from "framer-motion";` | Import of Framer Motion |
| `src/app/dashboard/page.tsx` | 15-23 | `const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }; const item: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };` | Physics-based spring animation configuration |
| `src/app/dashboard/page.tsx` | 41 | `<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>` | Infinite pulsing radar ping animation |
| `src/app/dashboard/page.tsx` | 50, 53, 70, 93 | `<motion.div variants={container} ...>`, `<motion.div variants={item} ...>` | Framer Motion wrappers across the dashboard |
| `src/app/capture/page.tsx` | 9 | `import { motion, AnimatePresence } from "framer-motion";` | Framer Motion and AnimatePresence imports |
| `src/app/capture/page.tsx` | 122 | `<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Edge Active` | Glowing pulsating dot indicator |
| `src/app/capture/page.tsx` | 129 | `<motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} ...>` | Unnecessary entrance animation on form |
| `src/app/capture/page.tsx` | 146 | `<div className="w-full h-1 bg-emerald-400 animate-scan-line shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>` | Sci-fi neon laser scanning line with heavy glow shadow |
| `src/app/capture/page.tsx` | 147, 148 | `<div className="... border-2 border-emerald-400 rounded-full animate-ping"></div>`, `<div className="... border-2 border-indigo-400 rounded-full animate-ping delay-150"></div>` | Radar target ping animations over captured image |
| `src/app/capture/page.tsx` | 198-204 | `<AnimatePresence mode="popLayout"><motion.div key={processingState} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>` | Spring physics text popping animation inside submit button |
| `src/app/logs/page.tsx` | 6, 42-46 | `import { motion } from "framer-motion";`, `<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>` | Staggered fade/slide animation on log rows |
| `src/components/ui/StampBadge.tsx` | 15 | `rotate-[-5deg] opacity-90` | Skewed/tilted rubber stamp animation/style effect |
| `src/app/globals.css` | 11-23 | `--animate-scan-line`, `--animate-pulse-slow`, `--animate-fade-in-up`, `@keyframes scan`, `@keyframes fadeInUp` | Keyframe definitions for sci-fi animations |

### 3.4 Bento-Box Layout Patterns & Excessive Rounded Geometry
| Location | Line | Exact Code Snippet | Violation Description |
|---|---|---|---|
| `src/app/dashboard/page.tsx` | 53 | `<motion.div variants={item} className="bg-gov-blue rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-gov-blue/20">` | Oversized hero banner with `rounded-3xl` and huge fingerprint watermark |
| `src/app/dashboard/page.tsx` | 71, 81 | `rounded-3xl p-6 ... hover:scale-[1.02] active:scale-[0.98]` | Bento quick action cards with excessive rounded corners and scale-up hover animations |
| `src/app/dashboard/page.tsx` | 98, 102, 108, 112 | `rounded-2xl p-5 shadow-sm` | Floating stats bento cards with low information density |
| `src/app/capture/page.tsx` | 132 | `<div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200/60 overflow-hidden relative group">` | Rounded-3xl container for evidence preview |
| `src/app/capture/page.tsx` | 134, 135 | `rounded-2xl border-2 border-dashed border-slate-300`, `w-14 h-14 bg-white shadow-sm rounded-2xl` | Nested rounded-2xl upload box and icon bubble |
| `src/app/capture/page.tsx` | 142 | `rounded-2xl overflow-hidden bg-black` | Rounded image display |
| `src/app/capture/page.tsx` | 162 | `<div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/60 space-y-5">` | Rounded-3xl form container |
| `src/app/capture/page.tsx` | 166, 182, 188, 189 | `rounded-xl` select and input elements, `rounded-xl` GPS button | Low-density rounded inputs |
| `src/app/capture/page.tsx` | 196 | `rounded-2xl font-bold py-4 text-sm` | Rounded pill-like submit button |
| `src/app/logs/page.tsx` | 36, 49, 55 | `rounded-xl py-3`, `rounded-xl p-4`, `rounded-full text-xs` | Cyberpunk pill cards and pills |
| `src/app/logs/[id]/page.tsx` | 25, 61, 70, 80 | `rounded-3xl`, `rounded-2xl`, `rounded-xl` | Floating rounded dossier cards |

---

## 4. Screen-by-Screen Detailed Analysis & UX4G / GIGW 3.0 Transformations

### 4.1 Global Layout & Shell (`src/app/layout.tsx`)

#### Current State:
- Minimal wrapper with Latin-only Inter font.
- Floating tricolor gradient strip (`fixed top-0 h-1.5 bg-gradient-to-r from-gov-orange via-white to-gov-green`).
- Fixed SVG noise texture and dot grid background.
- Completely missing global GIGW header, navigation bar, breadcrumbs, and footer.

#### Required GIGW 3.0 / UX4G Transformation:
1. **Remove Prohibited Visuals**:
   - Strip `public/noise.svg` and radial dot-grid background elements entirely.
   - Remove floating fixed gradient strip.
2. **Implement Standard 3-Tier GOI Header**:
   - **Tier 1: Accessibility & Government Top Bar**:
     - Dark Navy (`#0F2862`) or clean Slate-100 top utility strip.
     - Left: "भारत सरकार | Government of India" (bilingual), "गृह मंत्रालय | Ministry of Home Affairs".
     - Right: Accessibility controls:
       - Skip to Main Content (`#main-content` anchor)
       - Font size adjuster buttons: `[ A- | A | A+ ]`
       - Contrast toggle / High Contrast mode indicator
       - Language switcher: `English | हिन्दी`
   - **Tier 2: Official Identity & Branding Header**:
     - Crisp white background (`#FFFFFF`) with bottom border (`border-b border-gray-300`).
     - Left: National Emblem of India (Lion Capital of Ashoka with "सत्यमेव जयते" motto).
     - Center/Left Title:
       - Hindi: स्वापक नियंत्रण ब्यूरो (गृह मंत्रालय, भारत सरकार)
       - English: Narcotics Control Bureau (Ministry of Home Affairs, Government of India)
       - Subtitle: राष्ट्रीय फॉरेन्सिक ड्रग परीक्षण एवं साक्ष्य सत्यापन पोर्टल / National Forensic Drug Testing & Evidence Verification Portal
     - Right: Digital India / Azadi Ka Amrit Mahotsav / e-Governance logo placeholder.
   - **Tier 3: Primary Government Navigation Menu**:
     - Deep Navy Blue bar (`bg-[#0F2862] text-white`).
     - Navigation items with solid, high-contrast active state (solid Saffron underline: `border-b-4 border-[#FF9933]`):
       - [ मुख्य पृष्ठ / Dashboard ] (`/dashboard`)
       - [ नया परीक्षण / Field Spot Test ] (`/capture`)
       - [ साक्ष्य रजिस्टर / Evidence Ledger ] (`/ledger`)
       - [ रिपोर्ट एवं विश्लेषण / Reports ] (`/ledger`)
       - [ दिशानिर्देश / SOP & NDPS Guidelines ]
       - Right-aligned: Officer Profile Badge (`NCB-OP-109`) and [ Logout ]
3. **Implement Standard GIGW 3.0 Government Footer**:
   - Multi-column structured footer with high-contrast text:
     - Column 1: Important Portals & Links (MHA, NCB India, NDPS Portal, Digital India, National Portal of India india.gov.in).
     - Column 2: Legal & Statutory Provisions (Section 65B Indian Evidence Act, NDPS Act 1985, IT Act 2000).
     - Column 3: Website Policies (Privacy Policy, Hyperlinking Policy, Copyright Policy, Terms & Conditions, Disclaimer).
     - Column 4: Technical & Helpdesk Contact (NIC Narcotics Informatics Division, 24x7 Control Room).
   - Bottom Bar:
     - Copyright notice: "Content Owned and Maintained by Narcotics Control Bureau, Ministry of Home Affairs, Government of India."
     - NIC attribution: "Designed, Developed and Hosted by National Informatics Centre (NIC), Ministry of Electronics & Information Technology, Government of India."
     - Security certification: "Website / Application Security Audited by CERT-In Empanelled Auditor."
     - Last Updated / Version metadata: "Last Reviewed and Updated on: [Current Date] | v3.0-GIGW".

---

### 4.2 Official Gateway / Login Page (`src/app/page.tsx`)

#### Current State:
- Centered card on gray background with `shadow-lg rounded-sm`.
- Generic `Landmark` icon used in place of the Ashoka Lion Capital.
- Tabbed interface between Officer ID and Mobile OTP.
- Hardcoded CAPTCHA with line-through styling.
- IT Act 2000 warning banner and NIC/Digital India logos.

#### Required GIGW 3.0 / UX4G Transformation:
1. **Aesthetic & Structural Refinements**:
   - Replace generic `Landmark` icon with official Ashoka Lion Capital Emblem placeholder with correct bilingual typography.
   - Remove `shadow-lg` and `shadow-md`; use stark, clean borders (`border-2 border-[#0F2862]`, `rounded-none`).
   - Button styling: Utilitarian high-contrast solid button `bg-[#0F2862] hover:bg-[#081B44] text-white font-bold py-2.5 px-6 rounded-none uppercase text-sm tracking-wider`.
2. **Accessibility & Form Standards**:
   - Ensure all input fields have visible, high-contrast labels with `id` and `htmlFor` associations.
   - Add accessible CAPTCHA refresh icon button with `aria-label="Generate new CAPTCHA"` and audio alternative placeholder.
   - Bilingual form labels: "अधिकारी पहचान संख्या / Officer ID", "पासवर्ड / Password", "कैप्चा कोड / Security Code".
   - Official Ministry Notice box with high-contrast warning icon and border.

---

### 4.3 Operator Dashboard (`src/app/dashboard/page.tsx`)

#### Current State:
- Bento-Box layout with 3 oversized floating cards and 4 floating metric tiles.
- Glassmorphic top bar with `backdrop-blur-xl`.
- Glowing `animate-ping` dot and sci-fi "Sys_Online" status.
- Framer-motion spring physics transitions on page load.
- Violet-to-purple gradient quick-action card (`from-indigo-500 to-purple-600`) with blurred glow blob.

#### Required GIGW 3.0 / UX4G Transformation:
1. **Eliminate All Non-Compliant Elements**:
   - Strip all `motion.*` tags, `variants`, and Framer Motion imports.
   - Strip `backdrop-blur-xl`, `bg-white/70`, `bg-gradient-to-br`, `blur-2xl`, and `animate-ping`.
   - Remove `rounded-3xl` and `rounded-2xl` floating cards.
2. **Convert to Traditional, Dense Government Portal Grid**:
   - **Breadcrumbs**: `मुख्य पृष्ठ / Home > अधिकारी डैशबोर्ड / Operator Dashboard`.
   - **Section 1: Active Duty Session & Officer Credential Strip**:
     - Compact table or two-column metadata banner:
       - Officer Name & Rank: Inspector R. K. Sharma (Badge: NCB-OP-109)
       - Zone / Field Unit: Delhi Zonal Unit (DZU), Northern Range
       - Field Device Status: Cryptographic Engine Ready (CIEDE2000 Local Mode)
       - Server Synchronization: Online / Direct Database Connected
   - **Section 2: High-Density Statistical Summary Table (Replacing Bento Metric Cards)**:
     - Replace sparse floating metric cards with an authoritative high-contrast tabular data block:
       ```
       +------------------------------------+---------------+----------------------------+-----------------------+
       | परीक्षण श्रेणी / Test Category     | गणना / Count  | कानूनी स्थिति / Legal Status | त्वरित कार्रवाई / Action |
       +------------------------------------+---------------+----------------------------+-----------------------+
       | कुल पंजीकृत परीक्षण (Total Tests)  | {stats.total} | सर्वर पर रिकॉर्डेड         | [ रजिस्टर देखें ]      |
       | संदिग्ध धनात्मक (Presumptive Pos) | {positive}    | जब्ती प्रोटोकॉल लागू       | [ धनात्मक सूची ]      |
       | ऋणात्मक (Presumptive Negative)     | {negative}    | अप्रतिबंधित पदार्थ         | [ ऋणात्मक सूची ]      |
       | अनिर्णायक (Inconclusive / Failed) | {inconclusive}| प्रयोगशाला परीक्षण अपेक्षित | [ लैब रिफरल सूची ]    |
       +------------------------------------+---------------+----------------------------+-----------------------+
       ```
     - Headers: Deep Navy Blue (`#0F2862`) with white bold text.
     - Zebra striping: `bg-white` and `bg-slate-100` with solid `border border-slate-300`.
   - **Section 3: Primary Operational Task Panel (Utility Buttons)**:
     - Dense, utilitarian grid of standard government action buttons:
       - `[ + नया फील्ड स्पॉट टेस्ट शुरू करें / Begin New Field Spot Test ]` (`bg-[#138808] hover:bg-[#0e6306] text-white font-bold py-3 px-4 rounded-none text-sm`)
       - `[ केंद्रीय साक्ष्य रजिस्टर देखें / View Central Evidence Register ]` (`bg-[#0F2862] hover:bg-[#081B44] text-white font-bold py-3 px-4 rounded-none text-sm`)
       - `[ दैनिक परीक्षण रिपोर्ट (PDF/Excel) / Export Daily Activity ]` (`bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-none text-sm`)
       - `[ मानक संचालन प्रक्रिया (SOP) डाउनलोड करें / Download SOP ]` (`bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-none text-sm`)
   - **Section 4: Recent Submissions Register**:
     - Quick-access table displaying the last 5 registered tests directly on the dashboard to eliminate wasted space.
3. **Data Mapping Fix**:
   - Map `/api/v1/dashboard/stats` response correctly:
     - `total = res.total_tests`
     - `positive = res.by_result?.positive ?? 0`
     - `negative = res.by_result?.negative ?? 0`
     - `inconclusive = res.by_result?.inconclusive ?? 0`

---

### 4.4 Forensic Evidence Capture / Scanner (`src/app/capture/page.tsx`)

#### Current State:
- Styled like a mobile gadget app with `rounded-3xl` glass cards, sci-fi scanning laser line (`animate-scan-line shadow-[0_0_15px_rgba(52,211,153,0.8)]`), pulsing radar targets (`animate-ping`), frosted retake button, and spring-animated submit button with gradient.
- Contains the **Core Forensic Workflow**:
  1. `fetchGPS()`: Geolocation lock.
  2. `extractColor()`: Hidden canvas pixel neighborhood sampling.
  3. `calibrateColor()`: White reference card normalization.
  4. `classifySpotTest()`: CIEDE2000 deltaE algorithm against color library.
  5. `generateSHA256()`: Cryptographic hashing of raw evidence image bytes.
  6. Backend sync via POST `/api/v1/tests/sync`.

#### Required GIGW 3.0 / UX4G Transformation:
1. **Preserve 100% of Core Forensic Logic**:
   - Keep all math functions (`classifySpotTest`, `calibrateColor`, `generateSHA256`), hidden canvas extraction geometry (20% width for rawWhite, 65% width for rawSpot, 10x10 neighborhood), arrayBuffer hashing, and API payload structure completely unchanged.
2. **Convert UI to Official Government Inspection Form**:
   - **Title & Breadcrumbs**: `Home > Field Spot Tests > New Evidence Examination (Form-II)`.
   - **Section Legend 1: Photographic Evidence Capture (फोटोग्राफिक साक्ष्य)**:
     - Replace `rounded-3xl` card with clean rectangular bordered panel (`border-2 border-slate-400 bg-white p-4 rounded-none`).
     - Replace dashed dropzone with official government file attachment / camera feed box (`border border-slate-300 bg-slate-50 p-4`).
     - Remove laser line and radar pings over preview image. Replace with clean evidence frame border with corner crosshairs or simple static watermark overlay: `OFFICIAL EVIDENCE - CONFIDENTIAL`.
     - Retake button: Solid utilitarian gray button (`bg-slate-800 text-white font-bold text-xs py-1.5 px-3 rounded-none hover:bg-black`).
   - **Section Legend 2: Test Parameters & Chain of Custody (परीक्षण पैरामीटर एवं केस विवरण)**:
     - Reagent Selection: Standard accessible `<select>` element (`border border-slate-400 bg-white text-slate-900 rounded-none p-2.5 text-sm focus:outline-none focus:border-[#0F2862] focus:ring-1 focus:ring-[#0F2862]`).
     - Case / Seizure Reference: Standard `<input type="text">` with clear label, helper text "उदा. NDPS/DZU/2026/042".
     - Geolocation Acquisition: Official GPS Coordinates block with standard tabular display (Latitude, Longitude, Accuracy) and solid button `[ जीपीएस स्थान प्राप्त करें / Acquire GPS Lock ]`.
   - **Section Legend 3: Algorithmic Execution Status**:
     - When processing (`EXTRACTING` -> `MATH` -> `HASHING` -> `SYNCING`):
       - Replace spring popping animations with an authoritative step progress bar or high-contrast status alert:
         - `[ 1. पिक्सेल निष्कर्षण / Pixel Extraction ] -> [ 2. CIEDE2000 कलरीमेट्रिक गणना / Delta-E Math ] -> [ 3. SHA-256 हैश जनरेशन / Hash Generation ] -> [ 4. केंद्रीय लेजर सिंक / Ledger Synchronization ]`.
       - Standard accessible loading spinner (`Loader2` with accessible `role="status"` and `aria-live="polite"`).
   - **Section Legend 4: Form Actions**:
     - Primary Submit Button: Solid high-contrast India Green or Navy Blue button (`bg-[#138808] hover:bg-[#0e6306] text-white font-bold py-3 px-8 rounded-none uppercase text-sm tracking-wider`).
     - Reset / Cancel Button: `bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-none text-sm`.

---

### 4.5 Central Evidence Register / Ledger (`src/app/ledger/page.tsx`)

#### Current State:
- Shows a list of test records in a basic table with a dark blue header (`#003366`).
- Section 65B Indian Evidence Act notice.
- Lacks pagination, search/filtering, export tools (CSV/PDF/Print), and accessible table headers.

#### Required GIGW 3.0 / UX4G Transformation:
1. **Convert to Comprehensive Central Evidence Register**:
   - **Breadcrumbs**: `Home > Evidence Management > Central Cryptographic Register`.
   - **Official Government Header**: Standard GOI 3-tier header.
   - **Filter & Search Toolbar (कार्रवाई एवं खोज पट्टी)**:
     - Search input: Filter by Case/Dossier ID, Operator ID, or SHA-256 Hash.
     - Filter dropdown: Filter by Verdict (All Results, Positive, Negative, Inconclusive).
     - Date Range inputs: From Date to To Date (IST).
     - Export action buttons: `[ CSV निर्यात / Export CSV ]`, `[ प्रिंट रजिस्टर / Print Register ]`.
   - **Authoritative GIGW Data Table**:
     - Accessible `<caption>केंद्रीय साक्ष्य एवं परीक्षण पंजीयन रजिस्टर (अधिनियम 1985 के अंतर्गत) / Central Evidence Register under NDPS Act</caption>`.
     - High-contrast table headers: `bg-[#0F2862] text-white font-bold uppercase text-xs tracking-wider py-3 px-4 border border-[#0F2862]`.
     - Columns:
       1. क्र. सं. / S.No.
       2. प्रमाण पत्र सं. / Certificate ID (UUID)
       3. दिनांक एवं समय / Date & Time (IST)
       4. जांच अधिकारी / Operator ID
       5. अभिकर्मक / Reagent Tested
       6. परिणाम / Chemical Verdict (High-contrast rectangular badge)
       7. साक्ष्य हैश / Evidence SHA-256 (Mono font, truncated with copy button)
       8. कार्रवाई / Action (`[ विस्तृत डॉसियर देखें / View Dossier ]`, `[ फॉर्म 4A / Form 4A ]`)
     - Zebra striping: `bg-white` and `bg-slate-50` with high-contrast cell borders (`border border-slate-300`).
     - Pagination controls at table footer: Showing X of Y records, Previous, Page numbers, Next, Rows per page selector.

---

### 4.6 Certificate of Analysis / Form 4A (`src/app/result/[id]/page.tsx`)

#### Current State:
- A4 printable sheet layout.
- Non-printable top action bar with glassmorphic print button (`bg-white/10 border-white/20`).
- Saffron download PDF button with `shadow-sm`.
- Fake random QR code generated using 64 divs with `Math.random()`.
- Generic `Landmark` icon for National Emblem.
- Electronic signature block.

#### Required GIGW 3.0 / UX4G Transformation:
1. **Fix Non-Compliant Elements**:
   - Remove glassmorphic button in top bar; replace with solid high-contrast white button with dark navy text (`bg-white text-[#0F2862] hover:bg-slate-100 font-bold px-3 py-1.5 rounded-none text-xs border border-white`).
   - Remove `shadow-lg` and `shadow-sm`.
   - Replace fake `Math.random()` QR code with a deterministic SVG representation or structured QR placeholder tied to the test ID and SHA-256 hash.
   - Replace generic `Landmark` icon with official Ashoka Lion Capital Emblem placeholder with "सत्यमेव जयते".
2. **Enhance Official Document Typography & Legal Formatting**:
   - Header: "भारत सरकार / GOVERNMENT OF INDIA", "गृह मंत्रालय / MINISTRY OF HOME AFFAIRS", "स्वापक नियंत्रण ब्यूरो / NARCOTICS CONTROL BUREAU".
   - Form Number: "प्रपत्र ४-क / FORM 4-A [See Rule 22(1) NDPS Rules]".
   - Document Title: "रासायनिक विश्लेषण एवं साक्ष्य प्रमाण पत्र / CERTIFICATE OF CHEMICAL ANALYSIS".
   - High-contrast structured table with crisp black borders (`border border-black`).
   - Algorithmic Verdict Section: Formal rectangular stamp box with official seal layout:
     - Clear distinction between Presumptive Positive (Red), Negative (Green), and Inconclusive (Amber).
     - Statement on Section 65B Indian Evidence Act certification.
   - Digital Signature Block: Standard NIC / e-Mudhra compliant digital signature badge.

---

### 4.7 Case Logs & Dossier (`src/app/logs/page.tsx` & `src/app/logs/[id]/page.tsx`)

#### Current State:
- `src/app/logs/page.tsx`: Full cyberpunk / hacker terminal aesthetic with `#0B192C` dark background, `#1E3E62` borders, `#FF6500` orange accents, neon pills, and Framer Motion staggered animations.
- `src/app/logs/[id]/page.tsx`: Server component using `prisma.test.findUnique`. Contains `rounded-3xl` card, dark code box with watermark, and tilted `StampBadge`.

#### Required GIGW 3.0 / UX4G Transformation:
1. **`src/app/logs/page.tsx`**:
   - Completely eradicate dark mode cyberpunk styling.
   - Replace with stark white background, high-contrast Navy headers, and standard GIGW tabular layout consistent with `/ledger`.
   - Alternatively, consolidate or redirect `/logs` to `/ledger` to provide a single, authoritative evidence register.
2. **`src/app/logs/[id]/page.tsx` (Official Case Dossier)**:
   - Breadcrumbs: `Home > Central Evidence Register > Case Dossier #{test.id}`.
   - Replace `rounded-3xl` container with an official two-column **"केस साक्ष्य डॉसियर / Case Evidence Dossier"** document (`border border-slate-300 bg-white rounded-none`).
   - Case Metadata Table: Officer ID, Timestamps (Device capture & Server record), GPS Coordinates with link to official Bhuvan / Google Maps, Case Notes.
   - Evidence Image: High-contrast rectangular frame (`border-2 border-slate-300 p-2 bg-slate-50 rounded-none`).
   - Cryptographic Integrity Panel: Light gray background (`bg-slate-100 border border-slate-300 p-3 font-mono text-xs text-slate-800`), verified under Section 65B Indian Evidence Act.
   - Replace tilted StampBadge with official rectangular verdict seal.

---

### 4.8 Stamp Badge Component (`src/components/ui/StampBadge.tsx`)

#### Current State:
- `inline-block border-4 p-4 uppercase font-bold text-3xl tracking-widest rotate-[-5deg] opacity-90 font-mono`.
- Casual skewed rubber stamp appearance.

#### Required GIGW 3.0 / UX4G Transformation:
- Convert into an authoritative official seal (`rotate-0`, `opacity-100`, `rounded-none`, `border-2` or `border-4`):
  - POSITIVE: `border-2 border-red-800 bg-red-50 text-red-900 font-bold text-lg px-4 py-2 uppercase tracking-wider`
  - NEGATIVE: `border-2 border-emerald-800 bg-emerald-50 text-emerald-900 font-bold text-lg px-4 py-2 uppercase tracking-wider`
  - INCONCLUSIVE: `border-2 border-amber-800 bg-amber-50 text-amber-900 font-bold text-lg px-4 py-2 uppercase tracking-wider`
  - Include bilingual text: e.g., "धनात्मक / POSITIVE (PRESUMPTIVE)", "ऋणात्मक / NEGATIVE", "अनिर्णायक / INCONCLUSIVE".

---

## 5. Architectural Component Classification Matrix

| Component / File | Component Nature | State / Backend Connection | Presentational vs Stateful | Key Invariants to Protect |
|---|---|---|---|---|
| `src/app/layout.tsx` | Server Component | None (loads SW, Sonner toaster) | **Purely Presentational Shell** | Do NOT alter service worker registration script (`/sw.js`). |
| `src/app/page.tsx` | Client Component | `tab` state, `captcha` state | **Stateful UI** | Preserve login flow and validation logic. |
| `src/app/dashboard/page.tsx` | Client Component | Fetches `/api/v1/dashboard/stats`, manages `stats` state | **Stateful & Backend-Connected** | Preserve `fetch` endpoint call; fix response data mapping. |
| `src/app/capture/page.tsx` | Client Component | Manages `imageFile`, `previewUrl`, `processingState`, `location`, `reagent`, `notes` | **Core Forensic & Stateful** | **ABSOLUTE INVARIANT**: Do NOT alter `extractColor` canvas logic, `calibrateColor`, `classifySpotTest`, `generateSHA256`, or POST payload to `/api/v1/tests/sync`. |
| `src/app/ledger/page.tsx` | Client Component | Fetches `/api/v1/tests?limit=100`, manages `tests` list | **Stateful & Backend-Connected** | Preserve `fetch("/api/v1/tests?limit=100")` query. |
| `src/app/result/[id]/page.tsx` | Client Component | Fetches `/api/v1/tests/${id}`, manages `data` | **Stateful & Backend-Connected** | Preserve `fetch("/api/v1/tests/${id}")` and print dialog. |
| `src/app/logs/page.tsx` | Client Component | Fetches `/api/v1/tests?limit=50`, manages `tests` list | **Stateful & Backend-Connected** | Harmonize with `/ledger`. |
| `src/app/logs/[id]/page.tsx` | Server Component | Direct Prisma query `prisma.test.findUnique` | **Backend-Connected Server Page** | Preserve direct Prisma database connection and UUID parameter resolution. |
| `src/components/ui/StampBadge.tsx` | Presentational Component | None (props only) | **Purely Presentational** | Preserve `status` prop interface (`"positive" \| "negative" \| "inconclusive"`). |

---

## 6. GIGW 3.0 / UX4G Design System Standards Specification

### 6.1 Official Color Palette (Digital Brand Identity Manual)
| Color Role | CSS / Hex Code | Usage | Contrast with White |
|---|---|---|---|
| **Gov Navy Blue (Primary)** | `#0F2862` (or `#003366`) | Top header, main navigation bar, primary buttons, table header rows, key text accents | 11.5:1 (AAA Pass) |
| **National Ashoka Saffron** | `#FF9933` | Navigation active border indicator, alert badges, official accents | High visibility accent |
| **National India Green** | `#138808` | Primary CTA buttons, negative/clean verdicts, verified signatures | 5.2:1 (AA Pass) |
| **Stark White (Background)** | `#FFFFFF` | Page body background, card backgrounds, table cell backgrounds | Baseline |
| **Government Gray / Border** | `#E2E8F0` / `#CBD5E1` / `#94A3B8` | Clean structural borders, table grid lines, form inputs | Structural |
| **High-Contrast Dark Slate** | `#0F172A` / `#1E293B` | Primary body typography, high-contrast headings | 16.0:1 (AAA Pass) |
| **Verdict Red (Presumptive Positive)** | `#991B1B` (Text) / `#FEF2F2` (Bg) / `#B91C1C` (Border) | Confirmed presumptive narcotic detection | 7.8:1 (AAA Pass) |
| **Verdict Green (Presumptive Negative)** | `#166534` (Text) / `#F0FDF4` (Bg) / `#15803D` (Border) | Negative test result | 7.1:1 (AAA Pass) |
| **Verdict Amber (Inconclusive)** | `#92400E` (Text) / `#FFFBEB` (Bg) / `#B45309` (Border) | Inconclusive / requires laboratory GC-MS | 6.5:1 (AA Pass) |

### 6.2 Typography & Structure
- Primary Font: Standard clean system fonts / Inter (`sans-serif`).
- Monospace Font: Monospace for cryptographic hashes (SHA-256), UUIDs, and GPS coordinates.
- Layout Density: High density, compact padding (`p-2` to `p-4`), flat geometry (`rounded-none` or `rounded-sm`), solid 1px/2px borders (`border-slate-300` or `border-slate-400`).
- Tables: Full-width `w-full`, border-collapse, deep navy header with white text, alternating white and slate-50 rows, crisp solid borders.
- Form Inputs: Rectangular `rounded-none`, high-contrast border `border-slate-400`, bold labels with red asterisk `*` for required fields, clear error and helper text.

---

## 7. Recommended Implementation Milestones for Orchestrator

Based on this survey, the transformation should proceed through the following orderly milestones:

1. **Milestone 1: Core UX4G Shell, Header & Footer**
   - Clean `src/app/layout.tsx`: strip noise SVG, dot-grid, and top gradient strip.
   - Build reusable Government of India 3-tier Header component (Top utility/accessibility bar + Ministry & Emblem branding + Main navigation).
   - Build reusable GIGW 3.0 Government Footer component (Policies, Acts, NIC attribution, Security audit).
   - Standardize `globals.css` and `tailwind.config.ts`.
2. **Milestone 2: Dashboard Redesign (Dense Government Portal)**
   - Rewrite `src/app/dashboard/page.tsx`: eliminate Bento cards, spring animations, and glow effects.
   - Implement officer duty session bar, dense 4-row tabular summary table, utilitarian action buttons, and recent activity log.
   - Correct stats API response mapping.
3. **Milestone 3: Forensic Scanning Workflow & Capture Redesign**
   - Rewrite `src/app/capture/page.tsx`: eliminate sci-fi laser scan line, pinging rings, and spring button animations.
   - Implement Form-II Forensic Spot Test Inspection form with clean rectangular photo preview, standard reagent select, GPS acquisition, and step-by-step progress indicator.
   - Rigorously protect hidden canvas pixel sampling, CIEDE2000 math, SHA-256 generation, and backend sync.
4. **Milestone 4: Evidence Register & Certificate Documents**
   - Refactor `src/app/ledger/page.tsx` into an authoritative Central Evidence Register with search, filters, pagination, and high-contrast tables.
   - Refactor `src/app/result/[id]/page.tsx` Form 4A Certificate (replace glassmorphic button, deterministic QR placeholder, Ashoka Emblem).
   - Standardize `src/app/logs/[id]/page.tsx` and harmonize/redirect `src/app/logs/page.tsx`.
   - Update `src/components/ui/StampBadge.tsx` to rectangular official verdict seal.
5. **Milestone 5: Build & Verification**
   - Verify `npm run build` passes without errors.
   - Verify zero occurrences of `backdrop-blur`, `bg-gradient-to-*`, and `framer-motion` in production pages.
