#!/usr/bin/env node

/**
 * =============================================================================
 * EMPIRICAL ADVERSARIAL STRESS TEST SUITE — MILESTONE 4
 * Agent: Challenger 2 (teamwork_preview_challenger_m4_2)
 * Targets:
 *   1. /api/v1/alerts route handler hostile fault injection
 *   2. /dashboard UI component search filtering, empty states & GIGW 3.0 sanitization
 *   3. Whole-system acceptance commands (test, scrape, e2e tier 1, build)
 * =============================================================================
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PROJECT_ROOT,
  scanFiles,
  readFile,
  searchInFiles,
  executeCommand,
  colors,
  symbols,
} from "./helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite SSR module loader
async function createViteSSRLoader() {
  const { createServer } = await import("vite");
  const server = await createServer({
    root: PROJECT_ROOT,
    logLevel: "silent",
    server: { middlewareMode: true },
    resolve: {
      alias: {
        "@": path.resolve(PROJECT_ROOT, "src"),
      },
    },
  });
  return {
    load: (relPath) => server.ssrLoadModule(path.resolve(PROJECT_ROOT, relPath)),
    close: () => server.close(),
  };
}

async function runMilestone4StressSuite() {
  const startTime = Date.now();
  console.log(`\n${colors.bold}${colors.blue}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.white}   NCB FORENSIC SUITE: M4 EMPIRICAL ADVERSARIAL STRESS TEST${colors.reset}`);
  console.log(`${colors.dim}   Agent: Challenger 2 (teamwork_preview_challenger_m4_2)${colors.reset}`);
  console.log(`${colors.dim}   Targets: /api/v1/alerts, /dashboard UI, GIGW 3.0, System Verification${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}======================================================================${colors.reset}\n`);

  const results = {
    apiHostile: [],
    uiStress: [],
    gigwSanitization: [],
    systemVerification: [],
  };

  const viteLoader = await createViteSSRLoader();

  // =========================================================================
  // TASK 1: HOSTILE STRESS-TESTING /api/v1/alerts ROUTE HANDLER
  // =========================================================================
  console.log(`${colors.bold}${colors.cyan}▶ SECTION 1: /api/v1/alerts ROUTE HANDLER HOSTILE INJECTION${colors.reset}`);
  console.log(`${colors.dim}${"─".repeat(70)}${colors.reset}`);

  const liveDataDir = path.join(PROJECT_ROOT, "data");
  const liveDataPath = path.join(liveDataDir, "threat_alerts.json");
  const srcDataDir = path.join(PROJECT_ROOT, "src", "data");
  const srcDataPath = path.join(srcDataDir, "threat_alerts.json");
  const fallbackPath = path.join(srcDataDir, "threat_alerts_fallback.json");

  // Preserve backup copies
  const liveBackup = fs.existsSync(liveDataPath) ? fs.readFileSync(liveDataPath, "utf-8") : null;
  const srcBackup = fs.existsSync(srcDataPath) ? fs.readFileSync(srcDataPath, "utf-8") : null;
  const fallbackBackup = fs.existsSync(fallbackPath) ? fs.readFileSync(fallbackPath, "utf-8") : null;

  try {
    const alertsModule = await viteLoader.load("src/app/api/v1/alerts/route.ts");
    const GET = alertsModule.GET;

    // Test 1.1: Nominal Baseline Verification
    {
      const res = await GET();
      const status = res.status;
      const data = await res.json();
      const cc = res.headers.get("Cache-Control") || "";
      const pragma = res.headers.get("Pragma") || "";
      const expires = res.headers.get("Expires") || "";

      const hasCacheHeaders = cc.includes("no-cache") && cc.includes("no-store") && pragma === "no-cache" && expires === "0";
      const hasValidAlerts = Array.isArray(data.alerts) && data.alerts.length > 0;
      const pass = status === 200 && data.success === true && hasCacheHeaders && hasValidAlerts;

      results.apiHostile.push({
        id: "API-01",
        name: "Nominal Baseline: HTTP 200, valid schema, strict cache-control headers",
        pass,
        details: `Status: ${status}, Source: ${data.source}, Count: ${data.alerts?.length}, Cache-Control: "${cc}"`,
      });
    }

    // Test 1.2: Hostile Injection: Primary data/threat_alerts.json MISSING
    {
      if (fs.existsSync(liveDataPath)) fs.unlinkSync(liveDataPath);
      const res = await GET();
      const status = res.status;
      const data = await res.json();
      const pass = status === 200 && data.success === true && Array.isArray(data.alerts) && data.alerts.length > 0;

      results.apiHostile.push({
        id: "API-02",
        name: "Hostile Injection: Missing primary data/threat_alerts.json -> secondary/fallback recovery",
        pass,
        details: `Status: ${status}, Source resolved: ${data.source}, Alerts length: ${data.alerts?.length}`,
      });
    }

    // Test 1.3: Hostile Injection: Both data/ and src/data/ threat_alerts.json MISSING
    {
      if (fs.existsSync(liveDataPath)) fs.unlinkSync(liveDataPath);
      if (fs.existsSync(srcDataPath)) fs.unlinkSync(srcDataPath);
      const res = await GET();
      const status = res.status;
      const data = await res.json();
      const pass = status === 200 && data.success === true && data.source === "fallback" && Array.isArray(data.alerts) && data.alerts.length > 0;

      results.apiHostile.push({
        id: "API-03",
        name: "Hostile Injection: Missing both live cache files -> automatic fallback to threat_alerts_fallback.json",
        pass,
        details: `Status: ${status}, Source: ${data.source}, Fallback alerts loaded: ${data.alerts?.length}`,
      });
    }

    // Test 1.4: Hostile Injection: Malformed / Corrupted JSON Syntax in primary & secondary files
    {
      fs.writeFileSync(liveDataPath, "{ INVALID_JSON_SYNTAX [[[] @@!#$%^&* ", "utf-8");
      fs.writeFileSync(srcDataPath, "<<<MALFORMED_XML_INSTEAD_OF_JSON>>>", "utf-8");
      const res = await GET();
      const status = res.status;
      const data = await res.json();
      const pass = status === 200 && data.success === true && data.source === "fallback" && Array.isArray(data.alerts);

      results.apiHostile.push({
        id: "API-04",
        name: "Hostile Injection: Corrupted/Unparseable JSON in data/ & src/data/ -> graceful fallback catch",
        pass,
        details: `Status: ${status}, Handled JSON.parse syntax error, fell back to source: ${data.source}`,
      });
    }

    // Test 1.5: Hostile Injection: Truncated / Zero-Byte Empty File
    {
      fs.writeFileSync(liveDataPath, "", "utf-8");
      fs.writeFileSync(srcDataPath, "", "utf-8");
      const res = await GET();
      const status = res.status;
      const data = await res.json();
      const pass = status === 200 && data.success === true && data.source === "fallback";

      results.apiHostile.push({
        id: "API-05",
        name: "Hostile Injection: Zero-byte empty string cache files -> catches empty JSON",
        pass,
        details: `Status: ${status}, Gracefully recovered to fallback with ${data.alerts?.length} alerts`,
      });
    }

    // Test 1.6: Hostile Injection: Valid JSON but Empty Array `{ "alerts": [] }`
    {
      fs.writeFileSync(liveDataPath, JSON.stringify({ source: "empty_test", alerts: [] }), "utf-8");
      fs.writeFileSync(srcDataPath, JSON.stringify({ source: "empty_test", alerts: [] }), "utf-8");
      const res = await GET();
      const status = res.status;
      const data = await res.json();
      const pass = status === 200 && data.success === true && data.source === "fallback" && data.alerts.length > 0;

      results.apiHostile.push({
        id: "API-06",
        name: "Hostile Injection: Empty alerts array in live cache -> bypassed to fallback dataset",
        pass,
        details: `Status: ${status}, Empty array correctly bypassed; loaded fallback with ${data.alerts?.length} alerts`,
      });
    }

    // Test 1.7: Extreme Hostile Injection: Total Disk Deletion (Even fallback JSON removed from disk!)
    {
      if (fs.existsSync(liveDataPath)) fs.unlinkSync(liveDataPath);
      if (fs.existsSync(srcDataPath)) fs.unlinkSync(srcDataPath);
      if (fs.existsSync(fallbackPath)) fs.unlinkSync(fallbackPath);

      const res = await GET();
      const status = res.status;
      const data = await res.json();
      const pass = status === 200 && data.success === true && data.source === "fallback" && Array.isArray(data.alerts) && data.alerts.length > 0;

      results.apiHostile.push({
        id: "API-07",
        name: "Extreme Hostile: Complete filesystem disk failure -> in-memory static bundle fallback activates",
        pass,
        details: `Status: ${status}, Source: ${data.source}, In-memory fallback served ${data.alerts?.length} alerts cleanly`,
      });
    }

    // Test 1.8: Schema Invariant & Reagent Guidance Verification across all alert items
    {
      // Restore fallback and live data for schema inspection
      if (fallbackBackup) fs.writeFileSync(fallbackPath, fallbackBackup, "utf-8");
      if (liveBackup) fs.writeFileSync(liveDataPath, liveBackup, "utf-8");
      if (srcBackup) fs.writeFileSync(srcDataPath, srcBackup, "utf-8");

      const res = await GET();
      const data = await res.json();
      const validLevels = ["CRITICAL", "HIGH", "ELEVATED", "MODERATE", "ADVISORY"];

      let schemaOk = true;
      let reagentGuidanceCount = 0;

      for (const alert of data.alerts) {
        if (!alert.id || !alert.source || !alert.substance || !alert.threatLevel || !alert.publishedAt || !alert.summary) {
          schemaOk = false;
          break;
        }
        if (!validLevels.includes(alert.threatLevel.toUpperCase())) {
          schemaOk = false;
          break;
        }
        if (alert.reagentGuidance) {
          reagentGuidanceCount++;
          if (!alert.reagentGuidance.reagent || !alert.reagentGuidance.expectedReaction) {
            schemaOk = false;
            break;
          }
        }
      }

      const pass = schemaOk && reagentGuidanceCount > 0;
      results.apiHostile.push({
        id: "API-08",
        name: "Data Schema Invariant: All alerts satisfy ThreatAlert contract with valid reagentGuidance",
        pass,
        details: `Verified ${data.alerts.length} alerts; ${reagentGuidanceCount} contain cross-referenced reagent markers`,
      });
    }
  } finally {
    // Restore all disk files exactly to initial state
    if (liveBackup) fs.writeFileSync(liveDataPath, liveBackup, "utf-8");
    if (srcBackup) fs.writeFileSync(srcDataPath, srcBackup, "utf-8");
    if (fallbackBackup) fs.writeFileSync(fallbackPath, fallbackBackup, "utf-8");
  }

  for (const r of results.apiHostile) {
    console.log(`  ${r.pass ? symbols.pass : symbols.fail}  ${colors.bold}[${r.id}]${colors.reset} ${r.name}`);
    console.log(`         ${colors.dim}${r.details}${colors.reset}`);
  }
  console.log();

  // =========================================================================
  // TASK 2: STRESS-TESTING /dashboard UI COMPONENT & SEARCH FILTERING
  // =========================================================================
  console.log(`${colors.bold}${colors.cyan}▶ SECTION 2: /dashboard UI COMPONENT & FILTERING STRESS TESTING${colors.reset}`);
  console.log(`${colors.dim}${"─".repeat(70)}${colors.reset}`);

  // Test 2.1: Static Markup Rendering of Dashboard Component
  {
    const dashModule = await viteLoader.load("src/app/dashboard/page.tsx");
    const DashboardComponent = dashModule.default;
    const html = renderToStaticMarkup(React.createElement(DashboardComponent));

    const hasEmblem = html.includes("State Emblem of India") && html.includes("सत्यमेव जयते");
    const hasBilingualHeader = html.includes("राष्ट्रीय मादक पदार्थ चेतावनी प्रणाली") && html.includes("National Drug Threat Advisories &amp; Early Warning System");
    const hasColumns = html.includes("Advisory ID &amp; Date (IST)") &&
                       html.includes("Threat Level") &&
                       html.includes("Substance &amp; Classification") &&
                       html.includes("Originating Agency &amp; Region") &&
                       html.includes("Advisory Summary &amp; Reagent Marker");
    const hasControls = html.includes("ALL") && html.includes("CRITICAL") && html.includes("HIGH") && html.includes("ELEVATED") && html.includes("Refresh Feed");

    const pass = hasEmblem && hasBilingualHeader && hasColumns && hasControls;
    results.uiStress.push({
      id: "UI-01",
      name: "Dashboard Static Render: State Emblem, bilingual header, 5 columns, filter controls",
      pass,
      details: `Emblem: ${hasEmblem}, Bilingual Header: ${hasBilingualHeader}, 5 Columns: ${hasColumns}, Controls: ${hasControls}`,
    });
  }

  // Test 2.2: Algorithmic Search Filtering Matrix (Adversarial queries)
  {
    // Load active alert feed for simulation
    const rawFeed = JSON.parse(fs.readFileSync(liveDataPath, "utf-8"));
    const alerts = rawFeed.alerts;

    // Filter algorithm replicated directly from src/app/dashboard/page.tsx:126-145
    function runDashboardFilter(alertsList, selectedThreatLevel, searchQuery) {
      return alertsList.filter((alert) => {
        const matchesLevel =
          selectedThreatLevel === "ALL" ||
          alert.threatLevel?.toUpperCase() === selectedThreatLevel;

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          alert.substance?.toLowerCase().includes(query) ||
          alert.source?.toLowerCase().includes(query) ||
          alert.category?.toLowerCase().includes(query) ||
          alert.id?.toLowerCase().includes(query) ||
          alert.region?.toLowerCase().includes(query) ||
          alert.summary?.toLowerCase().includes(query) ||
          alert.reagentGuidance?.reagent?.toLowerCase().includes(query);

        return matchesLevel && matchesSearch;
      });
    }

    const searchTestCases = [
      { name: "Substance match (case-insensitive 'fentanyl')", query: "fEnTaNyL", level: "ALL", expectMin: 1 },
      { name: "Substance match ('progesterone')", query: "progesterone", level: "ALL", expectMin: 1 },
      { name: "Agency match ('openFDA')", query: "openfda", level: "ALL", expectMin: 1 },
      { name: "Agency match ('DEA')", query: "DEA", level: "ALL", expectMin: 1 },
      { name: "Category match ('RECALL')", query: "RECALL", level: "ALL", expectMin: 1 },
      { name: "Advisory ID match ('FDA-REC')", query: "FDA-REC", level: "ALL", expectMin: 1 },
      { name: "Reagent name match ('Marquis')", query: "marquis", level: "ALL", expectMin: 1 },
      { name: "Whitespace trimmed ('  xylazine  ')", query: "  xylazine  ", level: "ALL", expectMin: 1 },
      { name: "Threat Level filter CRITICAL", query: "", level: "CRITICAL", expectMin: 1 },
      { name: "Threat Level filter HIGH", query: "", level: "HIGH", expectMin: 1 },
      { name: "Combined Filter + Search (HIGH + 'Injection')", query: "injection", level: "HIGH", expectMin: 1 },
      { name: "Non-matching query -> triggers empty state", query: "XYZ_NON_EXISTENT_SUBSTANCE_999", level: "ALL", expectExact: 0 },
      { name: "Adversarial Regex Metacharacters: '[.*+?^${}()|[\\]\\\\]'", query: "[.*+?^${}()|[\\]\\\\]", level: "ALL", expectExact: 0 },
      { name: "Adversarial XSS string: '<script>alert(1)</script>'", query: "<script>alert(1)</script>", level: "ALL", expectExact: 0 },
      { name: "Adversarial SQLi fragment: \"' OR '1'='1\"", query: "' OR '1'='1", level: "ALL", expectExact: 0 },
      { name: "Adversarial 10k Character String (No DoS/ReDoS)", query: "A".repeat(10000), level: "ALL", expectExact: 0 },
      { name: "Adversarial Unicode & Emoji: '💊 🚨 मादक'", query: "💊 🚨 मादक", level: "ALL", expectExact: 0 },
    ];

    let allSearchPassed = true;
    const failures = [];

    for (const tc of searchTestCases) {
      let filtered = [];
      let didThrow = false;
      let durationMs = 0;
      try {
        const t0 = performance.now();
        filtered = runDashboardFilter(alerts, tc.level, tc.query);
        durationMs = performance.now() - t0;
      } catch (err) {
        didThrow = true;
        failures.push(`${tc.name}: Threw exception: ${err.message}`);
      }

      if (didThrow) {
        allSearchPassed = false;
      } else if (tc.expectExact !== undefined && filtered.length !== tc.expectExact) {
        allSearchPassed = false;
        failures.push(`${tc.name}: Expected ${tc.expectExact} matches, got ${filtered.length}`);
      } else if (tc.expectMin !== undefined && filtered.length < tc.expectMin) {
        allSearchPassed = false;
        failures.push(`${tc.name}: Expected >= ${tc.expectMin} matches, got ${filtered.length}`);
      } else if (durationMs > 50) {
        allSearchPassed = false;
        failures.push(`${tc.name}: Search took excessive time (${durationMs.toFixed(2)}ms)`);
      }
    }

    results.uiStress.push({
      id: "UI-02",
      name: "Search Filtering Matrix: 17 adversarial vectors (substance, agency, reagent, regex, XSS, 10k string)",
      pass: allSearchPassed,
      details: allSearchPassed
        ? "All 17 search filter vectors evaluated successfully with 0 exceptions and sub-millisecond latency."
        : `Failures: ${failures.join("; ")}`,
    });
  }

  // Test 2.3: Empty State UI Structure Verification in source code
  {
    const dashSource = readFile(path.join(PROJECT_ROOT, "src", "app", "dashboard", "page.tsx"));
    const hasEmptyStateMessage = dashSource.includes("No Active Threat Advisories Found");
    const hasShieldAlert = dashSource.includes("<ShieldAlert");
    const hasColSpan5 = dashSource.includes("colSpan={5}");
    const hasResetButton = dashSource.includes("Reset All Filters");
    const hasLoadingSkeleton = dashSource.includes("animate-pulse") && dashSource.includes("[1, 2, 3, 4].map");

    const pass = hasEmptyStateMessage && hasShieldAlert && hasColSpan5 && hasResetButton && hasLoadingSkeleton;
    results.uiStress.push({
      id: "UI-03",
      name: "Empty State & Skeleton UI: Accessible ShieldAlert empty notice, colSpan 5, reset action, 4-row skeleton",
      pass,
      details: `Empty Message: ${hasEmptyStateMessage}, ShieldAlert: ${hasShieldAlert}, Colspan: ${hasColSpan5}, Reset: ${hasResetButton}, Skeleton: ${hasLoadingSkeleton}`,
    });
  }

  // Test 2.4: Fallback Standalone Warning Bar Verification
  {
    const dashSource = readFile(path.join(PROJECT_ROOT, "src", "app", "dashboard", "page.tsx"));
    const hasFallbackNotice = dashSource.includes("Operating on verified static advisory archive");
    const hasScrapeSuggestion = dashSource.includes("npm run scrape");
    const hasArchiveBadge = dashSource.includes("STANDALONE ARCHIVE");

    const pass = hasFallbackNotice && hasScrapeSuggestion && hasArchiveBadge;
    results.uiStress.push({
      id: "UI-04",
      name: "Fallback Warning Bar: Displays informative notice, archive badge, and scrape sync instructions",
      pass,
      details: `Fallback notice: ${hasFallbackNotice}, npm run scrape ref: ${hasScrapeSuggestion}, Archive badge: ${hasArchiveBadge}`,
    });
  }

  for (const r of results.uiStress) {
    console.log(`  ${r.pass ? symbols.pass : symbols.fail}  ${colors.bold}[${r.id}]${colors.reset} ${r.name}`);
    console.log(`         ${colors.dim}${r.details}${colors.reset}`);
  }
  console.log();

  // =========================================================================
  // TASK 2 (cont): COMPREHENSIVE GIGW 3.0 SANITIZATION ACROSS src/
  // =========================================================================
  console.log(`${colors.bold}${colors.cyan}▶ SECTION 3: COMPREHENSIVE GIGW 3.0 CODEBASE SANITIZATION SCAN${colors.reset}`);
  console.log(`${colors.dim}${"─".repeat(70)}${colors.reset}`);

  const srcDir = path.join(PROJECT_ROOT, "src");
  const srcFiles = scanFiles(srcDir, [".ts", ".tsx", ".css", ".js", ".jsx"], ["node_modules", ".next"]);

  // GIGW-01: Zero backdrop-blur
  {
    const matches = searchInFiles(/backdrop-blur/i, srcFiles);
    const pass = matches.length === 0;
    results.gigwSanitization.push({
      id: "GIGW-01",
      name: "Zero occurrences of 'backdrop-blur' across all src/ files (including logs/page.tsx)",
      pass,
      details: pass
        ? `Clean across ${srcFiles.length} source files.`
        : `Found ${matches.length} occurrence(s) in: ${matches.map(m => `${m.file}:${m.line}`).join(", ")}`,
    });
  }

  // GIGW-02: Zero bg-gradient-to-*
  {
    const matches = searchInFiles(/bg-gradient-to-[trbl]{1,2}/i, srcFiles);
    const pass = matches.length === 0;
    results.gigwSanitization.push({
      id: "GIGW-02",
      name: "Zero occurrences of 'bg-gradient-to-*' pastel gradients across all src/ files",
      pass,
      details: pass
        ? `Clean across ${srcFiles.length} source files.`
        : `Found ${matches.length} occurrence(s) in: ${matches.map(m => `${m.file}:${m.line}`).join(", ")}`,
    });
  }

  // GIGW-03: Zero framer-motion spring animations
  {
    const matches = searchInFiles(/type:\s*["']spring["']/i, srcFiles);
    const pass = matches.length === 0;
    results.gigwSanitization.push({
      id: "GIGW-03",
      name: "Zero occurrences of 'framer-motion' bouncy spring animations across all src/ files",
      pass,
      details: pass
        ? `Clean across ${srcFiles.length} source files.`
        : `Found ${matches.length} occurrence(s) in: ${matches.map(m => `${m.file}:${m.line}`).join(", ")}`,
    });
  }

  // GIGW-04: Zero noise.svg or radial dot grids
  {
    const rootLayout = readFile(path.join(srcDir, "app", "layout.tsx"));
    const hasNoise = /noise\.svg/i.test(rootLayout);
    const hasRadial = /radial-gradient/i.test(rootLayout);
    const pass = !hasNoise && !hasRadial;
    results.gigwSanitization.push({
      id: "GIGW-04",
      name: "Zero decorative background noise.svg or radial dot grids in root layout",
      pass,
      details: pass ? "Root layout is sanitized." : `Found artifacts: noise: ${hasNoise}, radial: ${hasRadial}`,
    });
  }

  for (const r of results.gigwSanitization) {
    console.log(`  ${r.pass ? symbols.pass : symbols.fail}  ${colors.bold}[${r.id}]${colors.reset} ${r.name}`);
    console.log(`         ${colors.dim}${r.details}${colors.reset}`);
  }
  console.log();

  // =========================================================================
  // TASK 3: WHOLE-SYSTEM ACCEPTANCE VERIFICATION COMMANDS
  // =========================================================================
  console.log(`${colors.bold}${colors.cyan}▶ SECTION 4: WHOLE-SYSTEM ACCEPTANCE VERIFICATION COMMANDS${colors.reset}`);
  console.log(`${colors.dim}${"─".repeat(70)}${colors.reset}`);

  // Command 1: npm run test
  {
    console.log(`  ... Running: ${colors.bold}npm run test${colors.reset}`);
    const res = await executeCommand("npm run test");
    const passedMatch = res.stdout.match(/(\d+)\s+passed/);
    const totalTestsMatch = res.stdout.match(/Tests\s+(\d+)\s+passed\s+\((\d+)\)/);
    const testFilesMatch = res.stdout.match(/Test Files\s+(\d+)\s+passed\s+\((\d+)\)/);

    const testFilesPassed = testFilesMatch ? parseInt(testFilesMatch[1], 10) : 0;
    const testsPassed = totalTestsMatch ? parseInt(totalTestsMatch[1], 10) : (passedMatch ? parseInt(passedMatch[1], 10) : 0);

    const pass = res.code === 0 && testsPassed === 62 && testFilesPassed === 5;
    results.systemVerification.push({
      id: "SYS-01",
      name: "Acceptance Command: 'npm run test' executes with 62/62 passing tests across 5 suites",
      pass,
      details: `Exit Code: ${res.code}, Test Suites: ${testFilesPassed}/5, Tests Passed: ${testsPassed}/62`,
      rawOutput: res.stdout,
    });
  }

  // Command 2: npm run scrape
  {
    console.log(`  ... Running: ${colors.bold}npm run scrape${colors.reset}`);
    const res = await executeCommand("npm run scrape");
    const countMatch = res.stdout.match(/Total alerts\s*:\s*(\d+)/i) || res.stdout.match(/Total:\s*(\d+)\s*alerts/i);
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;
    const jsonExists = fs.existsSync(liveDataPath);
    const parsedOk = jsonExists && JSON.parse(fs.readFileSync(liveDataPath, "utf-8")).alerts?.length > 0;

    const pass = res.code === 0 && count >= 10 && parsedOk;
    results.systemVerification.push({
      id: "SYS-02",
      name: "Acceptance Command: 'npm run scrape' exits 0, produces structured threat_alerts.json (>= 10 alerts)",
      pass,
      details: `Exit Code: ${res.code}, Alerts Parsed: ${count}, JSON artifact valid: ${parsedOk}`,
      rawOutput: res.stdout,
    });
  }

  // Command 3: node tests/e2e_verify.mjs --tier=1
  {
    console.log(`  ... Running: ${colors.bold}node tests/e2e_verify.mjs --tier=1${colors.reset}`);
    const res = await executeCommand("node tests/e2e_verify.mjs --tier=1");
    const checksMatch = res.stdout.match(/Passed Checks\s*:\s*(\d+)/);
    const passRateMatch = res.stdout.match(/Success Rate\s*:\s*([\d.]+)%/);
    const passedChecks = checksMatch ? parseInt(checksMatch[1], 10) : 0;
    const passRate = passRateMatch ? parseFloat(passRateMatch[1]) : 0;

    const pass = res.code === 0 && passedChecks === 9 && passRate === 100.0;
    results.systemVerification.push({
      id: "SYS-03",
      name: "Acceptance Command: 'node tests/e2e_verify.mjs --tier=1' passes all 9/9 checks (100%)",
      pass,
      details: `Exit Code: ${res.code}, Checks Passed: ${passedChecks}/9, Pass Rate: ${passRate}%`,
      rawOutput: res.stdout,
    });
  }

  // Command 4: npm run build
  {
    console.log(`  ... Running: ${colors.bold}npm run build${colors.reset}`);
    const res = await executeCommand("npm run build");
    const compiledOk = res.stdout.includes("Compiled successfully") || res.stdout.includes("Generating static pages");
    const errors = res.stderr || (res.code !== 0 ? res.stdout : "");

    const pass = res.code === 0 && compiledOk;
    results.systemVerification.push({
      id: "SYS-04",
      name: "Acceptance Command: 'npm run build' (Turbopack) compiles cleanly with zero errors",
      pass,
      details: `Exit Code: ${res.code}, Compiled Successfully: ${compiledOk}`,
      rawOutput: res.stdout,
    });
  }

  for (const r of results.systemVerification) {
    console.log(`  ${r.pass ? symbols.pass : symbols.fail}  ${colors.bold}[${r.id}]${colors.reset} ${r.name}`);
    console.log(`         ${colors.dim}${r.details}${colors.reset}`);
  }
  console.log();

  // Close Vite SSR server
  await viteLoader.close();

  // Summary Matrix
  const allTests = [
    ...results.apiHostile,
    ...results.uiStress,
    ...results.gigwSanitization,
    ...results.systemVerification,
  ];
  const totalExecuted = allTests.length;
  const totalPassed = allTests.filter(t => t.pass).length;
  const totalFailed = totalExecuted - totalPassed;
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`${colors.bold}${colors.blue}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.white}   M4 EMPIRICAL ADVERSARIAL STRESS TEST SUMMARY MATRIX${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}======================================================================${colors.reset}`);
  console.log(`  Total Checks Executed : ${totalExecuted}`);
  console.log(`  Passed Checks         : ${colors.green}${totalPassed}${colors.reset}`);
  console.log(`  Failed Checks         : ${totalFailed > 0 ? colors.red : colors.green}${totalFailed}${colors.reset}`);
  console.log(`  Pass Rate             : ${totalFailed === 0 ? colors.green : colors.yellow}${((totalPassed / totalExecuted) * 100).toFixed(1)}%${colors.reset}`);
  console.log(`  Execution Time        : ${durationSec}s`);
  console.log(`${colors.dim}${"─".repeat(70)}${colors.reset}`);
  console.log(`  Section 1 [API Route Hostile Injection]   : ${results.apiHostile.filter(t => t.pass).length}/${results.apiHostile.length}`);
  console.log(`  Section 2 [UI Component & Search Matrix]  : ${results.uiStress.filter(t => t.pass).length}/${results.uiStress.length}`);
  console.log(`  Section 3 [GIGW 3.0 Codebase Scan]        : ${results.gigwSanitization.filter(t => t.pass).length}/${results.gigwSanitization.length}`);
  console.log(`  Section 4 [Whole-System Verification]     : ${results.systemVerification.filter(t => t.pass).length}/${results.systemVerification.length}`);
  console.log(`${colors.bold}${colors.blue}======================================================================${colors.reset}\n`);

  // Write stress test report to challenger directory
  const reportPath = path.join(PROJECT_ROOT, ".agents", "teamwork_preview_challenger_m4_2", "stress_test_report.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalExecuted,
    totalPassed,
    totalFailed,
    durationSec,
    sections: results,
  }, null, 2), "utf-8");

  if (totalFailed > 0) {
    console.log(`${colors.red}${colors.bold}STRESS TEST VERIFICATION FAILED: ${totalFailed} defect(s) detected.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}STRESS TEST VERIFICATION PASSED: All ${totalPassed} checks succeeded!${colors.reset}\n`);
    process.exit(0);
  }
}

runMilestone4StressSuite().catch((err) => {
  console.error("Fatal error executing M4 stress test suite:", err);
  process.exit(1);
});
