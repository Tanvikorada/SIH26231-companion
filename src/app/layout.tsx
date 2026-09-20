import { SignOutButton } from "@/components/ui/SignOutButton";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { StateEmblem } from "@/components/ui/StateEmblem";
import {
  LayoutDashboard,
  Camera,
  FileText,
  Database,
  ShieldAlert,
  Menu,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title:
    "राष्ट्रीय फोरेंसिक औषधि परीक्षण पोर्टल | National Forensic Drug Testing Laboratory Portal",
  description:
    "Government of India - Narcotics Control Bureau, Ministry of Home Affairs - Digital India UX4G & GIGW 3.0 Forensic Evidence System",
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
      <body
        className={`${inter.variable} font-sans bg-[#F4F6F9] text-[#0B1B3D] min-h-screen flex flex-col selection:bg-[#003366] selection:text-white`}
      >
        {/* ========================================================================= */}
        {/* National Tricolor Accent Strip - Sharp GIGW 3.0 Solid Color Band          */}
        {/* ========================================================================= */}
        <div className="h-1.5 w-full flex flex-row shrink-0" aria-hidden="true">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-[#FFFFFF] border-y border-slate-200" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* ========================================================================= */}
        {/* GIGW 3.0 Standard 3-Tier Government Header                                */}
        {/* ========================================================================= */}
        <header className="w-full bg-white shadow-xs shrink-0 select-none">
          {/* ----------------------------------------------------------------------- */}
          {/* TIER 1: Top Accessibility Bar (UX4G / GIGW 3.0 Standard)               */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[11px] font-medium text-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1 flex items-center justify-between gap-2">
              {/* Left: Skip to Main Content & National Affiliation */}
              <div className="flex items-center gap-3">
                <a href="#main-content" className="skip-to-content">
                  मुख्य सामग्री पर जाएं / Skip to Main Content
                </a>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#003366]">भारत सरकार</span>
                  <span className="text-slate-400">|</span>
                  <span className="font-bold text-slate-800">Government of India</span>
                  <span className="text-slate-400 hidden sm:inline">|</span>
                  <span className="text-slate-600 hidden sm:inline">
                    गृह मंत्रालय / Ministry of Home Affairs
                  </span>
                </div>
              </div>

              {/* Right: Accessibility Controls */}
              <div className="flex items-center gap-2">
                {/* Font Resize Controls */}
                <div
                  className="flex items-center border border-[#CBD5E1] bg-white divide-x divide-[#CBD5E1]"
                  role="group"
                  aria-label="Font Size Controls"
                >
                  <button
                    type="button"
                    id="font-decrease"
                    aria-label="Decrease Font Size (A-)"
                    className="px-1.5 py-0.5 hover:bg-slate-100 text-xs text-slate-700"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    id="font-normal"
                    aria-label="Normal Font Size (A)"
                    className="px-1.5 py-0.5 hover:bg-slate-100 text-xs font-semibold text-[#003366] bg-slate-100"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    id="font-increase"
                    aria-label="Increase Font Size (A+)"
                    className="px-1.5 py-0.5 hover:bg-slate-100 text-xs text-slate-700"
                  >
                    A+
                  </button>
                </div>

                {/* High Contrast Mode Toggle */}
                <button
                  type="button"
                  id="contrast-toggle"
                  aria-label="Toggle High Contrast Mode"
                  aria-pressed="false"
                  className="px-2 py-0.5 border border-[#CBD5E1] bg-white hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 text-slate-700"
                >
                  <span>🌓</span>
                  <span className="hidden md:inline" id="contrast-label">
                    High Contrast
                  </span>
                </button>

                {/* Language Switcher */}
                <button
                  type="button"
                  id="lang-toggle"
                  aria-label="Change Language / भाषा बदलें"
                  className="px-2 py-0.5 border border-[#CBD5E1] bg-white hover:bg-slate-100 text-[11px] font-bold text-[#003366]"
                >
                  <span id="lang-label">हिन्दी</span>
                </button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* TIER 2: Ministry & Portal Identity Header                               */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white border-b border-[#CBD5E1]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
              {/* Identity Left: Ashoka Lion Capital Emblem + Bilingual Titles */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="flex flex-col items-center justify-center shrink-0 w-11 sm:w-14"
                  aria-label="State Emblem of India"
                >
                  <StateEmblem size={44} variant="navy" />
                </div>

                <div
                  className="h-10 w-px bg-slate-300 hidden sm:block"
                  aria-hidden="true"
                />

                {/* Portal Title & Ministry */}
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-[#003366] leading-tight">
                    राष्ट्रीय फोरेंसिक औषधि परीक्षण पोर्टल
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                    National Forensic Drug Testing Laboratory Portal
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-600 mt-0.5">
                    मादक पदार्थ नियंत्रण ब्यूरो (NCB) | Ministry of Home Affairs, Government
                    of India
                  </span>
                </div>
              </div>

              {/* Identity Right: Official Statutory Authority Seal */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-right">
                  <div className="flex items-center gap-1.5 justify-end text-[#003366] font-bold text-xs">
                    <ShieldAlert size={14} className="text-[#003366]" />
                    <span>OFFICIAL PORTAL</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    NDPS ACT 1985 | SEC 65B EVIDENCE ACT
                  </p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  type="button"
                  id="mobile-menu-toggle"
                  aria-label="Toggle Navigation Menu"
                  aria-expanded="false"
                  className="p-2 border border-slate-300 text-[#003366] hover:bg-slate-100"
                >
                  <Menu size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* TIER 3: Main Navigation Bar (Authoritative Navy Blue #003366)           */}
          {/* ----------------------------------------------------------------------- */}
          <nav
            className="bg-[#003366] text-white border-b-2 border-[#002244]"
            aria-label="Main Navigation"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-between h-12">
                <div className="flex items-center h-full space-x-1" id="desktop-nav-links">
                  <Link
                    href="/dashboard"
                    data-href="/dashboard"
                    className="gov-nav-link h-full px-4 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold border-b-4 border-transparent text-white/90 hover:bg-[#002B55] hover:text-white transition-colors"
                  >
                    <LayoutDashboard size={15} />
                    <span>
                      <span className="lang-text-hi hidden">डैशबोर्ड</span>
                      <span className="lang-text-en">Dashboard</span>
                    </span>
                  </Link>
                  <Link
                    href="/capture"
                    data-href="/capture"
                    className="gov-nav-link h-full px-4 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold border-b-4 border-transparent text-white/90 hover:bg-[#002B55] hover:text-white transition-colors"
                  >
                    <Camera size={15} />
                    <span>
                      <span className="lang-text-hi hidden">साक्ष्य कक्ष</span>
                      <span className="lang-text-en">Forensic Capture</span>
                    </span>
                  </Link>
                  <Link
                    href="/ledger"
                    data-href="/ledger"
                    className="gov-nav-link h-full px-4 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold border-b-4 border-transparent text-white/90 hover:bg-[#002B55] hover:text-white transition-colors"
                  >
                    <FileText size={15} />
                    <span>
                      <span className="lang-text-hi hidden">नमूना बहीखाता</span>
                      <span className="lang-text-en">Sample Ledger</span>
                    </span>
                  </Link>
                  <Link
                    href="/logs"
                    data-href="/logs"
                    className="gov-nav-link h-full px-4 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold border-b-4 border-transparent text-white/90 hover:bg-[#002B55] hover:text-white transition-colors"
                  >
                    <Database size={15} />
                    <span>
                      <span className="lang-text-hi hidden">ऑडिट लॉग</span>
                      <span className="lang-text-en">Audit Trail</span>
                    </span>
                  </Link>
                </div>

                {/* Right: Security Classification Indicator */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                  <span
                    className="inline-block w-2 h-2 bg-[#138808]"
                    aria-hidden="true"
                  />
                  <span>RESTRICTED ACCESS | SIGNED RECORDS</span>
                  <SignOutButton />
                </div>
              </div>

              {/* Mobile Navigation Drawer */}
              <div
                id="mobile-menu"
                className="hidden md:hidden py-2 border-t border-[#002B55] space-y-1"
              >
                <Link
                  href="/dashboard"
                  data-href="/dashboard"
                  className="gov-mobile-nav-link flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-l-4 border-transparent text-white/90 hover:bg-[#002B55]"
                >
                  <LayoutDashboard size={16} />
                  <span>
                    <span className="lang-text-hi hidden">डैशबोर्ड</span>
                    <span className="lang-text-en">Dashboard</span>
                  </span>
                </Link>
                <Link
                  href="/capture"
                  data-href="/capture"
                  className="gov-mobile-nav-link flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-l-4 border-transparent text-white/90 hover:bg-[#002B55]"
                >
                  <Camera size={16} />
                  <span>
                    <span className="lang-text-hi hidden">साक्ष्य कक्ष</span>
                    <span className="lang-text-en">Forensic Capture</span>
                  </span>
                </Link>
                <Link
                  href="/ledger"
                  data-href="/ledger"
                  className="gov-mobile-nav-link flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-l-4 border-transparent text-white/90 hover:bg-[#002B55]"
                >
                  <FileText size={16} />
                  <span>
                    <span className="lang-text-hi hidden">नमूना बहीखाता</span>
                    <span className="lang-text-en">Sample Ledger</span>
                  </span>
                </Link>
                <Link
                  href="/logs"
                  data-href="/logs"
                  className="gov-mobile-nav-link flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-l-4 border-transparent text-white/90 hover:bg-[#002B55]"
                >
                  <Database size={16} />
                  <span>
                    <span className="lang-text-hi hidden">ऑडिट लॉग</span>
                    <span className="lang-text-en">Audit Trail</span>
                  </span>
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* ========================================================================= */}
        {/* Main Application Container                                                */}
        {/* ========================================================================= */}
        <main
          id="main-content"
          className="flex-1 flex flex-col relative w-full bg-[#F4F6F9]"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* ========================================================================= */}
        {/* GIGW 3.0 Official Government Footer                                       */}
        {/* ========================================================================= */}
        <footer
          className="w-full mt-auto shrink-0 select-none bg-[#002244] text-white border-t border-[#CBD5E1]"
          aria-label="Portal Footer"
        >
          {/* Tricolor Solid Band Separator */}
          <div className="h-1 w-full flex flex-row shrink-0" aria-hidden="true">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-[#FFFFFF]" />
            <div className="flex-1 bg-[#138808]" />
          </div>

          {/* Main Informational 4-Column Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs leading-relaxed text-slate-200">
              {/* Column 1: Legal & Forensic Mandate */}
              <div>
                <h3 className="font-bold text-sm text-white mb-2 pb-1 border-b border-[#003366] uppercase tracking-wider">
                  Legal Mandate
                </h3>
                <p className="text-slate-300 text-justify mb-2">
                  National Forensic Drug Testing Laboratory operates under the statutory
                  authority of the Narcotics Control Bureau (NCB), Ministry of Home
                  Affairs.
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
                    <span className="w-1.5 h-1.5 bg-[#FF9933]" aria-hidden="true" />
                    <span>Guidelines for Indian Govt. Websites (GIGW 3.0)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white" aria-hidden="true" />
                    <span>Digital India UX4G Design System</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#138808]" aria-hidden="true" />
                    <span>Ed25519 signed, hash-chained records</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#FF9933]" aria-hidden="true" />
                    <span>SHA-256 (FIPS 180-4) evidence hashing</span>
                  </li>
                </ul>
              </div>

              {/* Column 4: Nodal Contact & Emergency */}
              <div>
                <h3 className="font-bold text-sm text-white mb-2 pb-1 border-b border-[#003366] uppercase tracking-wider">
                  Helpdesk & Nodal Desk
                </h3>
                <p className="text-slate-300 mb-1">
                  Narcotics Control Bureau Headquarters
                </p>
                <p className="text-slate-300 mb-2">
                  West Block-1, Wing-5, R.K. Puram, New Delhi - 110066
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">Emergency Helpline:</strong> 1933 (Toll
                  Free)
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">Prototype:</strong>{" "}
                  Smart India Hackathon 2026, PS 26231
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Footer: Attribution & Last Updated */}
          <div className="bg-[#001830] border-t border-[#002244] py-3 text-[11px] text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
              <div>
                <p>
                  © 2026 National Forensic Drug Testing Laboratory Portal, Government of
                  India. All Rights Reserved.
                </p>
                <p className="text-[10px] text-slate-500">
                  Prototype developed for Smart India Hackathon 2026 (Problem Statement 26231).
                  Not an official Government of India service.
                </p>
              </div>
              <div className="text-right">
                <p>
                  Last Reviewed & Updated:{" "}
                  <strong className="text-slate-300">19 September 2026</strong>
                </p>
                <p className="text-[10px] text-slate-500">
                  Application Version: 3.4.1-UX4G | Server Node: IN-DEL-01
                </p>
              </div>
            </div>
          </div>
        </footer>

        <Toaster position="top-right" richColors theme="light" />

        {/* Client Accessibility and Navigation Interactivity Script */}
        <Script id="gigw-shell-script" strategy="afterInteractive">
          {`
            (function() {
              // 1. Accessibility: Font Resizer
              const btnDec = document.getElementById('font-decrease');
              const btnNormal = document.getElementById('font-normal');
              const btnInc = document.getElementById('font-increase');
              const fontButtons = [btnDec, btnNormal, btnInc];

              function setFontScale(scale, activeBtn) {
                document.documentElement.style.fontSize = scale;
                fontButtons.forEach(btn => {
                  if (btn) {
                    btn.classList.remove('bg-slate-100', 'font-semibold', 'text-[#003366]');
                    btn.classList.add('text-slate-700');
                  }
                });
                if (activeBtn) {
                  activeBtn.classList.add('bg-slate-100', 'font-semibold', 'text-[#003366]');
                  activeBtn.classList.remove('text-slate-700');
                }
              }

              btnDec?.addEventListener('click', function() { setFontScale('90%', btnDec); });
              btnNormal?.addEventListener('click', function() { setFontScale('100%', btnNormal); });
              btnInc?.addEventListener('click', function() { setFontScale('110%', btnInc); });

              // 2. Accessibility: High Contrast Mode
              const contrastToggle = document.getElementById('contrast-toggle');
              const contrastLabel = document.getElementById('contrast-label');
              
              function updateContrast(isHigh) {
                if (isHigh) {
                  document.documentElement.classList.add('high-contrast');
                  contrastToggle?.setAttribute('aria-pressed', 'true');
                  contrastToggle?.classList.add('bg-[#003366]', 'text-white', 'border-[#003366]');
                  contrastToggle?.classList.remove('bg-white', 'text-slate-700');
                  if (contrastLabel) contrastLabel.textContent = 'Normal';
                } else {
                  document.documentElement.classList.remove('high-contrast');
                  contrastToggle?.setAttribute('aria-pressed', 'false');
                  contrastToggle?.classList.remove('bg-[#003366]', 'text-white', 'border-[#003366]');
                  contrastToggle?.classList.add('bg-white', 'text-slate-700');
                  if (contrastLabel) contrastLabel.textContent = 'High Contrast';
                }
              }

              contrastToggle?.addEventListener('click', function() {
                const current = document.documentElement.classList.contains('high-contrast');
                const next = !current;
                updateContrast(next);
                try { localStorage.setItem('portal-contrast', next ? 'high' : 'normal'); } catch (e) {}
              });

              try {
                if (localStorage.getItem('portal-contrast') === 'high') {
                  updateContrast(true);
                }
              } catch (e) {}

              // 3. Language Toggle (Hindi / English)
              const langToggle = document.getElementById('lang-toggle');
              const langLabel = document.getElementById('lang-label');
              let currentLang = 'en';

              langToggle?.addEventListener('click', function() {
                currentLang = currentLang === 'en' ? 'hi' : 'en';
                if (langLabel) {
                  langLabel.textContent = currentLang === 'en' ? 'हिन्दी' : 'English';
                }
                const hiSpans = document.querySelectorAll('.lang-text-hi');
                const enSpans = document.querySelectorAll('.lang-text-en');
                if (currentLang === 'hi') {
                  hiSpans.forEach(el => el.classList.remove('hidden'));
                  enSpans.forEach(el => el.classList.add('hidden'));
                } else {
                  hiSpans.forEach(el => el.classList.add('hidden'));
                  enSpans.forEach(el => el.classList.remove('hidden'));
                }
              });

              // 4. Mobile Menu Drawer Toggle
              const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
              const mobileMenu = document.getElementById('mobile-menu');

              mobileMenuToggle?.addEventListener('click', function() {
                if (!mobileMenu) return;
                const isHidden = mobileMenu.classList.contains('hidden');
                if (isHidden) {
                  mobileMenu.classList.remove('hidden');
                  mobileMenuToggle.setAttribute('aria-expanded', 'true');
                } else {
                  mobileMenu.classList.add('hidden');
                  mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
              });

              // 5. Active Navigation Link Highlighting
              function updateActiveNavigation() {
                const path = window.location.pathname;
                const desktopLinks = document.querySelectorAll('.gov-nav-link');
                const mobileLinks = document.querySelectorAll('.gov-mobile-nav-link');

                desktopLinks.forEach(link => {
                  const target = link.getAttribute('data-href') || link.getAttribute('href');
                  const isActive = target === '/' ? path === '/' : path === target || path.startsWith(target + '/');
                  if (isActive) {
                    link.classList.add('bg-[#002244]', 'text-[#FF9933]', 'border-[#FF9933]', 'font-bold');
                    link.classList.remove('border-transparent', 'text-white/90');
                    link.setAttribute('aria-current', 'page');
                  } else {
                    link.classList.remove('bg-[#002244]', 'text-[#FF9933]', 'border-[#FF9933]', 'font-bold');
                    link.classList.add('border-transparent', 'text-white/90');
                    link.removeAttribute('aria-current');
                  }
                });

                mobileLinks.forEach(link => {
                  const target = link.getAttribute('data-href') || link.getAttribute('href');
                  const isActive = target === '/' ? path === '/' : path === target || path.startsWith(target + '/');
                  if (isActive) {
                    link.classList.add('bg-[#002244]', 'text-[#FF9933]', 'border-[#FF9933]', 'font-bold');
                    link.classList.remove('border-transparent', 'text-white/90');
                    link.setAttribute('aria-current', 'page');
                  } else {
                    link.classList.remove('bg-[#002244]', 'text-[#FF9933]', 'border-[#FF9933]', 'font-bold');
                    link.classList.add('border-transparent', 'text-white/90');
                    link.removeAttribute('aria-current');
                  }
                });
              }

              updateActiveNavigation();
              window.addEventListener('popstate', updateActiveNavigation);

              // Intercept Next.js client navigations
              document.addEventListener('click', function(e) {
                const target = e.target.closest('a');
                if (target && (target.classList.contains('gov-nav-link') || target.classList.contains('gov-mobile-nav-link'))) {
                  setTimeout(updateActiveNavigation, 50);
                  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuToggle?.setAttribute('aria-expanded', 'false');
                  }
                }
              });

              // 6. Service Worker Registration
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
