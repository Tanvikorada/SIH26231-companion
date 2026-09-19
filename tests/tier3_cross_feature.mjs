import path from "node:path";
import fs from "node:fs";
import { PROJECT_ROOT, readFile } from "./helpers.mjs";

/**
 * Run Tier 3 - Cross-Feature Combinations Tests
 * @returns {Promise<Array<{ id: string, name: string, pass: boolean, details: string, failureReason?: string }>>}
 */
export async function runTier3() {
  const results = [];
  const srcDir = path.join(PROJECT_ROOT, "src");

  // =========================================================================
  // 3.1 Consistency of navigation across all application routes
  // =========================================================================
  {
    const requiredRoutes = [
      { name: "Root/Login", file: path.join(srcDir, "app", "page.tsx") },
      { name: "Dashboard", file: path.join(srcDir, "app", "dashboard", "page.tsx") },
      { name: "Capture", file: path.join(srcDir, "app", "capture", "page.tsx") },
      { name: "Ledger", file: path.join(srcDir, "app", "ledger", "page.tsx") },
      { name: "Logs", file: path.join(srcDir, "app", "logs", "page.tsx") },
      { name: "Result Detail", file: path.join(srcDir, "app", "result", "[id]", "page.tsx") },
      { name: "Log Detail", file: path.join(srcDir, "app", "logs", "[id]", "page.tsx") },
    ];

    const missingFiles = requiredRoutes.filter(r => !fs.existsSync(r.file));

    // Navigational link continuity verification
    const dashboardContent = readFile(path.join(srcDir, "app", "dashboard", "page.tsx"));
    const captureContent = readFile(path.join(srcDir, "app", "capture", "page.tsx"));
    const ledgerContent = readFile(path.join(srcDir, "app", "ledger", "page.tsx"));
    const logsContent = readFile(path.join(srcDir, "app", "logs", "page.tsx"));
    const resultContent = readFile(path.join(srcDir, "app", "result", "[id]", "page.tsx"));
    const logDetailContent = readFile(path.join(srcDir, "app", "logs", "[id]", "page.tsx"));

    const dashboardHasCapture = /href=["']\/capture["']/i.test(dashboardContent);
    const dashboardHasLedger = /href=["']\/ledger["']/i.test(dashboardContent);
    const captureHasBack = /href=["']\/(dashboard)?["']/i.test(captureContent);
    const ledgerHasBack = /href=["']\/(dashboard)?["']/i.test(ledgerContent);
    const ledgerHasResult = /href=\{`\/result\/\$\{test\.id\}`\}/i.test(ledgerContent) || /href=["']\/result\//i.test(ledgerContent);
    const logsHasBack = /href=["']\/["']/i.test(logsContent) || /href=["']\/dashboard["']/i.test(logsContent);
    const resultHasBack = /router\.push\(['"]\/ledger['"]\)|href=["']\/ledger["']/i.test(resultContent);
    const logDetailHasBack = /href=["']\/logs["']/i.test(logDetailContent);

    const hasAllRoutes = missingFiles.length === 0;
    const hasNavContinuity = dashboardHasCapture && dashboardHasLedger && captureHasBack &&
                             ledgerHasBack && ledgerHasResult && logsHasBack && resultHasBack && logDetailHasBack;

    const pass = hasAllRoutes && hasNavContinuity;

    results.push({
      id: "T3.1",
      name: "Consistency and bidirectional continuity of navigation across all application routes",
      pass,
      details: pass
        ? "All 7 application routes exist with verified bidirectional navigation links."
        : `Navigation continuity gaps: ${missingFiles.length > 0 ? `[Missing route files: ${missingFiles.map(m => m.name).join(", ")}] ` : ""}${!dashboardHasCapture ? "[Dashboard missing /capture link] " : ""}${!dashboardHasLedger ? "[Dashboard missing /ledger link] " : ""}${!captureHasBack ? "[Capture missing back link] " : ""}${!ledgerHasBack ? "[Ledger missing back link] " : ""}${!ledgerHasResult ? "[Ledger missing /result link] " : ""}${!resultHasBack ? "[Result missing back link] " : ""}${!logDetailHasBack ? "[Log detail missing back link] " : ""}`,
      failureReason: pass ? undefined : "All application routes must provide accessible and consistent navigational paths.",
    });
  }

  // =========================================================================
  // 3.2 Preservation of forensic sync schema payload format
  // =========================================================================
  {
    const captureContent = readFile(path.join(srcDir, "app", "capture", "page.tsx"));
    const syncRouteContent = readFile(path.join(srcDir, "app", "api", "v1", "tests", "sync", "route.ts"));

    // Expected client payload keys
    const expectedKeys = [
      "operator_id",
      "reagent",
      "notes",
      "gps_lat",
      "gps_lng",
      "captured_at",
      "image_hash",
      "base64Image",
      "result",
      "confidence",
    ];

    const clientPayloadMatches = expectedKeys.every(k => new RegExp(`\\b${k}\\b`, "i").test(captureContent));

    // Expected server ingestion mapping
    const serverMapsImageHash = /data\.image_hash/i.test(syncRouteContent);
    const serverMapsBase64 = /data\.base64Image/i.test(syncRouteContent);
    const serverMapsResult = /data\.result/i.test(syncRouteContent);
    const serverMapsOperator = /data\.operator_id/i.test(syncRouteContent);
    const serverReturnsId = /success:\s*true.*id:\s*testRecord\.id/i.test(syncRouteContent);

    const pass = clientPayloadMatches && serverMapsImageHash && serverMapsBase64 && serverMapsResult && serverMapsOperator && serverReturnsId;

    results.push({
      id: "T3.2",
      name: "Preservation of forensic sync schema payload format and API contract",
      pass,
      details: pass
        ? "Client payload serialization and server ingestion contracts match all 10 forensic fields."
        : `Forensic sync schema contract discrepancy: ${!clientPayloadMatches ? "[Client missing payload fields] " : ""}${!serverMapsImageHash ? "[Server missing image_hash mapping] " : ""}${!serverMapsBase64 ? "[Server missing base64Image mapping] " : ""}${!serverReturnsId ? "[Server not returning created record ID] " : ""}`,
      failureReason: pass ? undefined : "Interface Contract 2 invariant: Capture client and sync endpoint must strictly maintain the forensic sync schema.",
    });
  }

  return results;
}
