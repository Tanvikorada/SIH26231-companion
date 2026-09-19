import path from "node:path";
import {
  PROJECT_ROOT,
  readFile,
  hexToRgb,
  getContrastRatio,
  loadEngineModule,
} from "./helpers.mjs";

/**
 * Run Tier 2 - Boundary & Corner Cases Tests
 * @returns {Promise<Array<{ id: string, name: string, pass: boolean, details: string, failureReason?: string }>>}
 */
export async function runTier2() {
  const results = [];
  const srcDir = path.join(PROJECT_ROOT, "src");

  // =========================================================================
  // 2.1 WCAG 2.1 AA High Contrast Accessibility Compliance
  // =========================================================================
  {
    const navyRgb = hexToRgb("#003366");
    const whiteRgb = hexToRgb("#FFFFFF");
    const greenRgb = hexToRgb("#138808");
    const redRgb = hexToRgb("#B91C1C");

    const crNavyOnWhite = getContrastRatio(navyRgb, whiteRgb);
    const crGreenOnWhite = getContrastRatio(greenRgb, whiteRgb);
    const crRedOnWhite = getContrastRatio(redRgb, whiteRgb);
    const crWhiteOnNavy = getContrastRatio(whiteRgb, navyRgb);

    const isNavyOk = crNavyOnWhite >= 4.5;
    const isGreenOk = crGreenOnWhite >= 4.5;
    const isRedOk = crRedOnWhite >= 4.5;
    const isWhiteOnNavyOk = crWhiteOnNavy >= 4.5;

    const pass = isNavyOk && isGreenOk && isRedOk && isWhiteOnNavyOk;

    results.push({
      id: "T2.1",
      name: "High contrast accessibility compliance (WCAG 2.1 Level AA color contrast ratios)",
      pass,
      details: pass
        ? `All core colors meet WCAG 2.1 AA (Navy: ${crNavyOnWhite.toFixed(2)}:1, Green: ${crGreenOnWhite.toFixed(2)}:1, Red: ${crRedOnWhite.toFixed(2)}:1, White-on-Navy: ${crWhiteOnNavy.toFixed(2)}:1).`
        : `Contrast ratios failed WCAG AA (>= 4.5:1): ${!isNavyOk ? `[Navy: ${crNavyOnWhite.toFixed(2)}:1] ` : ""}${!isGreenOk ? `[Green: ${crGreenOnWhite.toFixed(2)}:1] ` : ""}${!isRedOk ? `[Red: ${crRedOnWhite.toFixed(2)}:1] ` : ""}`,
      failureReason: pass ? undefined : "Text and interactive elements must satisfy WCAG 2.1 Level AA contrast ratio (min 4.5:1).",
    });
  }

  // =========================================================================
  // 2.2 Clean handling of missing or empty state records
  // =========================================================================
  {
    const ledgerContent = readFile(path.join(srcDir, "app", "ledger", "page.tsx"));
    const logsContent = readFile(path.join(srcDir, "app", "logs", "page.tsx"));
    const logDetailContent = readFile(path.join(srcDir, "app", "logs", "[id]", "page.tsx"));
    const resultDetailContent = readFile(path.join(srcDir, "app", "result", "[id]", "page.tsx"));

    const hasLedgerEmptyState = /tests\.length\s*===\s*0|No (issued )?certificates/i.test(ledgerContent);
    const hasLogsEmptyState = /tests\.length\s*===\s*0|NO RECORDS FOUND/i.test(logsContent);
    const hasLogDetailNullCheck = /if\s*\(!test\)/i.test(logDetailContent);
    const hasResultDetailNullCheck = /if\s*\(!data\)/i.test(resultDetailContent);

    const pass = hasLedgerEmptyState && hasLogsEmptyState && hasLogDetailNullCheck && hasResultDetailNullCheck;

    results.push({
      id: "T2.2",
      name: "Clean handling of missing, empty, or uninitialized records across UI routes",
      pass,
      details: pass
        ? "All views implement graceful empty state displays and null-checks for missing records."
        : `Empty state or null-check missing: ${!hasLedgerEmptyState ? "[Ledger empty state] " : ""}${!hasLogsEmptyState ? "[Logs empty state] " : ""}${!hasLogDetailNullCheck ? "[Log detail missing test check] " : ""}${!hasResultDetailNullCheck ? "[Result detail missing data check] " : ""}`,
      failureReason: pass ? undefined : "Application routes must cleanly handle empty datasets and non-existent IDs without unhandled exceptions.",
    });
  }

  // =========================================================================
  // 2.3 Mathematical boundary & zero-value handling in forensic calibration
  // =========================================================================
  {
    let engine;
    let closeServer;
    try {
      const loader = await loadEngineModule();
      engine = loader.mod;
      closeServer = loader.close;

      // Pitch black white reference (zero luma)
      const blackCal = engine.calibrateColor([120, 80, 40], [0, 0, 0]);
      const blackOk = blackCal[0] === 120 && blackCal[1] === 80 && blackCal[2] === 40;

      // Extreme edge white reference [1, 1, 1]
      const nearBlackCal = engine.calibrateColor([120, 80, 40], [1, 1, 1]);
      const nearBlackOk = nearBlackCal[0] === 120 && nearBlackCal[1] === 80 && nearBlackCal[2] === 40;

      // Maximum clipping boundary [255, 255, 255] with overscale
      const overscale = engine.calibrateColor([200, 200, 200], [100, 100, 100]);
      const overscaleOk = overscale[0] <= 255 && overscale[1] <= 255 && overscale[2] <= 255 && overscale[0] >= 0;

      await closeServer();

      const pass = blackOk && nearBlackOk && overscaleOk;
      results.push({
        id: "T2.3",
        name: "Boundary & zero-value tolerance in color calibration engine (zero division & clipping)",
        pass,
        details: pass
          ? "Calibration engine gracefully handles zero luminance, extreme dark lighting, and channel clipping."
          : `Calibration boundary tests failed: ${!blackOk ? "[Zero luma did not fallback] " : ""}${!nearBlackOk ? "[Near-zero luma did not fallback] " : ""}${!overscaleOk ? "[Channel clipping exceeded 255] " : ""}`,
        failureReason: pass ? undefined : "Calibration must prevent division by zero and channel overflow under edge lighting conditions.",
      });
    } catch (err) {
      if (closeServer) await closeServer();
      results.push({
        id: "T2.3",
        name: "Boundary & zero-value tolerance in color calibration engine (zero division & clipping)",
        pass: false,
        details: `Error executing calibration boundary tests: ${err.message}`,
        failureReason: "Calibration engine failed on boundary inputs.",
      });
    }
  }

  // =========================================================================
  // 2.4 CSS variables `--color-navy` and `--color-brass` resolution
  // =========================================================================
  {
    const globalsCss = readFile(path.join(srcDir, "app", "globals.css"));

    const hasColorNavyDef = /--color-navy:\s*#[0-9a-fA-F]{3,6}/i.test(globalsCss);
    const hasColorBrassDef = /--color-brass:\s*#[0-9a-fA-F]{3,6}/i.test(globalsCss);

    const pass = hasColorNavyDef && hasColorBrassDef;
    results.push({
      id: "T2.4",
      name: "CSS variables '--color-navy' and '--color-brass' properly defined in globals.css",
      pass,
      details: pass
        ? "CSS variables --color-navy and --color-brass are defined and resolve to hex values."
        : `Missing required CSS variables in globals.css: ${!hasColorNavyDef ? "[--color-navy] " : ""}${!hasColorBrassDef ? "[--color-brass] " : ""}`,
      failureReason: pass ? undefined : "F1 requirement: CSS variables --color-navy (#003366) and --color-brass must be defined for design system tokens.",
    });
  }

  return results;
}
