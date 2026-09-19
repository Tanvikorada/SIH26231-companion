import path from "node:path";
import {
  PROJECT_ROOT,
  scanFiles,
  readFile,
  searchInFiles,
  loadEngineModule,
} from "./helpers.mjs";

/**
 * Run Tier 1 - Feature Coverage Tests
 * @returns {Promise<Array<{ id: string, name: string, pass: boolean, details: string, failureReason?: string }>>}
 */
export async function runTier1() {
  const results = [];
  const srcDir = path.join(PROJECT_ROOT, "src");
  const srcFiles = scanFiles(srcDir, [".ts", ".tsx", ".css", ".js", ".jsx"], ["node_modules", ".next"]);

  // =========================================================================
  // 1.1 Zero occurrences of `backdrop-blur`
  // =========================================================================
  {
    const matches = searchInFiles(/backdrop-blur/i, srcFiles);
    const pass = matches.length === 0;
    results.push({
      id: "T1.1",
      name: "Zero occurrences of 'backdrop-blur' across all files in src/",
      pass,
      details: pass
        ? "No backdrop-blur classes found across any source files."
        : `Found ${matches.length} occurrence(s) of backdrop-blur in: ${[...new Set(matches.map(m => `${m.file}:${m.line}`))].join(", ")}`,
      failureReason: pass ? undefined : "Glassmorphism styling ('backdrop-blur') violates GIGW 3.0 utilitarian government UI guidelines.",
    });
  }

  // =========================================================================
  // 1.2 Zero occurrences of `bg-gradient-to-*`
  // =========================================================================
  {
    const matches = searchInFiles(/bg-gradient-to-[trbl]{1,2}/i, srcFiles);
    const pass = matches.length === 0;
    results.push({
      id: "T1.2",
      name: "Zero occurrences of 'bg-gradient-to-*' across all files in src/",
      pass,
      details: pass
        ? "No pastel or decorative CSS gradients found across any source files."
        : `Found ${matches.length} occurrence(s) of bg-gradient-to-* in: ${[...new Set(matches.map(m => `${m.file}:${m.line}`))].join(", ")}`,
      failureReason: pass ? undefined : "Decorative gradients ('bg-gradient-to-*') violate DBIM solid high-contrast palette requirements.",
    });
  }

  // =========================================================================
  // 1.3 Zero occurrences of `framer-motion` spring animations
  // =========================================================================
  {
    const matches = searchInFiles(/type:\s*["']spring["']/i, srcFiles);
    const pass = matches.length === 0;
    results.push({
      id: "T1.3",
      name: "Zero occurrences of 'framer-motion' spring animations across all files in src/",
      pass,
      details: pass
        ? "No bouncy spring physics or playful motion animations found."
        : `Found ${matches.length} occurrence(s) of spring animation configuration in: ${[...new Set(matches.map(m => `${m.file}:${m.line}`))].join(", ")}`,
      failureReason: pass ? undefined : "Playful spring physics animations violate GIGW 3.0 formal government accessibility requirements.",
    });
  }

  // =========================================================================
  // 1.4 Elimination of decorative background noise SVG & radial dot grids
  // =========================================================================
  {
    const layoutPath = path.join(srcDir, "app", "layout.tsx");
    const layoutContent = readFile(layoutPath);
    const hasNoise = /noise\.svg/i.test(layoutContent);
    const hasRadialDots = /radial-gradient/i.test(layoutContent);
    const pass = !hasNoise && !hasRadialDots;
    results.push({
      id: "T1.4",
      name: "Sanitization of decorative background noise and radial dot grids in root layout",
      pass,
      details: pass
        ? "Root layout is clean of noise SVGs and radial dot grids."
        : `Found decorative background artifacts in layout.tsx: ${hasNoise ? "[noise.svg] " : ""}${hasRadialDots ? "[radial-gradient] " : ""}`,
      failureReason: pass ? undefined : "Background noise and dot grids must be removed in favor of clean stark white or canvas backgrounds.",
    });
  }

  // =========================================================================
  // 1.5 Presence of Government Branding: National Emblem & Standard Header
  // =========================================================================
  {
    const layoutContent = readFile(path.join(srcDir, "app", "layout.tsx"));
    const pageContent = readFile(path.join(srcDir, "app", "page.tsx"));
    const dashboardContent = readFile(path.join(srcDir, "app", "dashboard", "page.tsx"));
    const combined = layoutContent + "\n" + pageContent + "\n" + dashboardContent;

    const hasEmblem = /सत्यमेव\s*जयते|emblem|national-emblem|Landmark/i.test(combined);
    const hasGovHeader = /Government of India|Ministry of Home Affairs|Narcotics Control Bureau/i.test(combined);
    const pass = hasEmblem && hasGovHeader;
    results.push({
      id: "T1.5",
      name: "Presence of official Government branding (National Emblem placeholder & Ministry header)",
      pass,
      details: pass
        ? "Government branding elements verified (Emblem placeholder and official Ministry identity detected)."
        : `Missing required government branding elements: ${!hasEmblem ? "[National Emblem placeholder] " : ""}${!hasGovHeader ? "[Official Ministry Header] " : ""}`,
      failureReason: pass ? undefined : "GIGW 3.0 requires prominent government identity and National Emblem placeholder.",
    });
  }

  // =========================================================================
  // 1.6 High Contrast DBIM Palette tokens in design system
  // =========================================================================
  {
    const globalsCss = readFile(path.join(srcDir, "app", "globals.css"));
    const allCode = srcFiles.map(f => readFile(f)).join("\n");

    const hasNavy = /#003366|--color-navy/i.test(globalsCss) || /#003366/i.test(allCode);
    const hasSaffron = /#FF9933|--color-saffron|--color-gov-orange/i.test(globalsCss) || /#FF9933/i.test(allCode);
    const hasGreen = /#138808|--color-green|--color-gov-green/i.test(globalsCss) || /#138808/i.test(allCode);
    const pass = hasNavy && hasSaffron && hasGreen;

    results.push({
      id: "T1.6",
      name: "High contrast DBIM palette presence (Navy #003366, Saffron #FF9933, Green #138808)",
      pass,
      details: pass
        ? "DBIM palette tokens present and active in codebase."
        : `Missing DBIM palette tokens: ${!hasNavy ? "[Navy #003366] " : ""}${!hasSaffron ? "[Saffron #FF9933] " : ""}${!hasGreen ? "[Green #138808] " : ""}`,
      failureReason: pass ? undefined : "Application must adhere to the Digital Brand Identity Manual (DBIM) color palette.",
    });
  }

  // =========================================================================
  // 1.7 Traditional dense layout with tables/borders rather than floating bento cards
  // =========================================================================
  {
    const dashboardContent = readFile(path.join(srcDir, "app", "dashboard", "page.tsx"));
    const hasBentoRounded3xl = /rounded-3xl/i.test(dashboardContent);
    const hasFloatHoverScale = /hover:scale-\[1\.02\]/i.test(dashboardContent);
    const hasDenseStructure = /<table|border|divide-y/i.test(dashboardContent);
    const pass = !hasBentoRounded3xl && !hasFloatHoverScale && hasDenseStructure;

    results.push({
      id: "T1.7",
      name: "Traditional dense layout with tables/borders rather than floating bento cards",
      pass,
      details: pass
        ? "Dashboard utilizes traditional high-density bordered layout without floating bento cards."
        : `Dashboard layout retains bento card attributes: ${hasBentoRounded3xl ? "[rounded-3xl cards] " : ""}${hasFloatHoverScale ? "[floating hover:scale] " : ""}${!hasDenseStructure ? "[missing dense table/border structure] " : ""}`,
      failureReason: pass ? undefined : "R2 requires replacing Bento-Box floating cards with a dense, borders-and-tables government portal layout.",
    });
  }

  // =========================================================================
  // 1.8 Core Forensic Math Integrity (`src/lib/engine.ts`)
  // =========================================================================
  {
    let engine;
    let closeServer;
    try {
      const loader = await loadEngineModule();
      engine = loader.mod;
      closeServer = loader.close;

      const subResults = [];

      // 1.8a: rgb2lab accuracy
      const labWhite = engine.rgb2lab([255, 255, 255]);
      const labBlack = engine.rgb2lab([0, 0, 0]);
      const isLabWhiteOk = Math.abs(labWhite[0] - 100) < 0.5 && Math.abs(labWhite[1]) < 1 && Math.abs(labWhite[2]) < 1;
      const isLabBlackOk = Math.abs(labBlack[0]) < 0.1 && Math.abs(labBlack[1]) < 0.1 && Math.abs(labBlack[2]) < 0.1;
      subResults.push(isLabWhiteOk && isLabBlackOk);

      // 1.8b: deltaE00 accuracy and symmetry
      const dIdentity = engine.deltaE00([50, 10, 20], [50, 10, 20]);
      const d1 = engine.deltaE00([50, 10, 20], [60, -10, 30]);
      const d2 = engine.deltaE00([60, -10, 30], [50, 10, 20]);
      const isDeltaOk = dIdentity === 0 && Math.abs(d1 - d2) < 1e-9 && d1 > 20;
      subResults.push(isDeltaOk);

      // 1.8c: calibrateColor accuracy and underexposure fallback
      const calSame = engine.calibrateColor([100, 150, 200], [255, 255, 255]);
      const isCalSameOk = calSame[0] === 100 && calSame[1] === 150 && calSame[2] === 200;

      const calDark = engine.calibrateColor([50, 75, 100], [128, 128, 128]);
      const isCalDarkOk = Math.abs(calDark[0] - 100) <= 1 && Math.abs(calDark[1] - 149) <= 1;

      const calFallback = engine.calibrateColor([50, 75, 100], [10, 10, 10]); // Luma < 50
      const isCalFallbackOk = calFallback[0] === 50 && calFallback[1] === 75 && calFallback[2] === 100;
      subResults.push(isCalSameOk && isCalDarkOk && isCalFallbackOk);

      // 1.8d: classifySpotTest positive, negative, unknown, unrelated
      const classPos = engine.classifySpotTest([16, 6, 13], "Marquis");
      const isClassPosOk = classPos.result === "positive" && classPos.distance < 8.0;

      const classNeg = engine.classifySpotTest([215, 209, 199], "Marquis");
      const isClassNegOk = classNeg.result === "negative" && classNeg.distance < 12.0;

      const classUnknown = engine.classifySpotTest([100, 100, 100], "NonExistentReagent");
      const isClassUnknownOk = classUnknown.result === "inconclusive" && classUnknown.distance === 999;

      const classUnrelated = engine.classifySpotTest([0, 0, 255], "Marquis");
      const isClassUnrelatedOk = classUnrelated.result === "inconclusive";
      subResults.push(isClassPosOk && isClassNegOk && isClassUnknownOk && isClassUnrelatedOk);

      // 1.8e: generateSHA256 known test vector
      const testBuf = new TextEncoder().encode("NCB-EVIDENCE").buffer;
      const hash = await engine.generateSHA256(testBuf);
      const isHashOk = hash === "8aa06e253f8047776bfa4cfaa39e749c6088506012f5bb799bf907024494cce6";
      subResults.push(isHashOk);

      await closeServer();

      const pass = subResults.every(Boolean);
      results.push({
        id: "T1.8",
        name: "Core forensic math integrity (calibrateColor, classifySpotTest, deltaE00, generateSHA256)",
        pass,
        details: pass
          ? "All forensic math operations (CIEDE2000, color calibration, reagent classification, SHA-256) intact and verified."
          : `Forensic math integrity checks failed: ${subResults.map((s, i) => `Subtest ${i+1}: ${s ? "PASS" : "FAIL"}`).join(", ")}`,
        failureReason: pass ? undefined : "Core forensic engine math must remain 100% intact and strictly un-modified.",
      });
    } catch (err) {
      if (closeServer) await closeServer();
      results.push({
        id: "T1.8",
        name: "Core forensic math integrity (calibrateColor, classifySpotTest, deltaE00, generateSHA256)",
        pass: false,
        details: `Engine loading or execution threw error: ${err.message}`,
        failureReason: "Forensic engine module could not be executed.",
      });
    }
  }

  // =========================================================================
  // 1.9 Hidden canvas sampling coordinates invariant in `src/app/capture/page.tsx`
  // =========================================================================
  {
    const captureContent = readFile(path.join(srcDir, "app", "capture", "page.tsx"));

    const hasHiddenCanvas = /<canvas[^>]*ref=\{canvasRef\}[^>]*style=\{\{\s*display:\s*["']none["']\s*\}\}/i.test(captureContent) ||
                            /<canvas[^>]*style=\{\{\s*display:\s*["']none["']\s*\}\}[^>]*ref=\{canvasRef\}/i.test(captureContent);
    const hasWhiteCoords = /0\.20\s*\*\s*img\.width|img\.width\s*\*\s*0\.20/i.test(captureContent);
    const hasSpotCoords = /0\.65\s*\*\s*img\.width|img\.width\s*\*\s*0\.65/i.test(captureContent);
    const hasHeightCoords = /0\.50\s*\*\s*img\.height|img\.height\s*\*\s*0\.50/i.test(captureContent);

    const pass = hasHiddenCanvas && hasWhiteCoords && hasSpotCoords && hasHeightCoords;
    results.push({
      id: "T1.9",
      name: "Hidden canvas sampling coordinates invariant (20% ref white, 65% reagent spot, 50% height)",
      pass,
      details: pass
        ? "Hidden canvas sampling coordinates verified: 20% white reference patch, 65% sample spot, 50% vertical center."
        : `Hidden canvas extraction invariants violated: ${!hasHiddenCanvas ? "[Missing hidden canvas] " : ""}${!hasWhiteCoords ? "[Missing 20% white coordinate] " : ""}${!hasSpotCoords ? "[Missing 65% spot coordinate] " : ""}${!hasHeightCoords ? "[Missing 50% height coordinate] " : ""}`,
      failureReason: pass ? undefined : "R3 invariant: Hidden canvas sampling coordinates must remain exactly at 20% white and 65% sample spot.",
    });
  }

  return results;
}
