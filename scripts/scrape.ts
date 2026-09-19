#!/usr/bin/env node
/**
 * CLI Entrypoint for NCB O.A.S. Threat Data Scraper Pipeline.
 * Executed via `npm run scrape` (node --experimental-strip-types scripts/scrape.ts).
 * Aggregates live drug enforcement recalls and synthetic threat advisories,
 * outputs structured JSON to data/threat_alerts.json and src/data/threat_alerts.json,
 * guarantees zero-crash exit code 0 under all network conditions.
 */

import { runScraper, loadFallbackAlerts } from "../src/lib/scraper/index.ts";

async function main(): Promise<void> {
  console.log("================================================================");
  console.log("  NCB OPTICAL ANALYSIS SYSTEM — LIVE THREAT SURVEILLANCE FEED  ");
  console.log("================================================================");
  console.log(`[INIT] Execution started at: ${new Date().toISOString()}`);

  try {
    const payload = await runScraper();

    console.log("----------------------------------------------------------------");
    console.log(`[STATUS] Ingestion completed successfully.`);
    console.log(`[FEED]   Source mode   : ${payload.source}`);
    console.log(`[COUNT]  Total alerts  : ${payload.count}`);
    console.log(`[CHANNELS] Sources     : ${payload.sourcesScraped.join(", ")}`);
    console.log(`[TIMESTAMP] Last update: ${payload.lastUpdated}`);
    console.log("----------------------------------------------------------------");

    if (payload.alerts.length > 0) {
      console.log("[SUMMARY OF TOP ADVISORIES]");
      payload.alerts.slice(0, 3).forEach((alert, idx) => {
        console.log(`  ${idx + 1}. [${alert.threatLevel}] ${alert.substance} (${alert.category})`);
        console.log(`     Agency: ${alert.source} | ID: ${alert.id}`);
        console.log(`     Summary: ${alert.summary}`);
        if (alert.reagentGuidance) {
          console.log(`     Reagent: ${alert.reagentGuidance.reagent} -> ${alert.reagentGuidance.expectedReaction}`);
        }
      });
    }

    console.log("================================================================");
    console.log("  SUCCESS: Artifacts persisted to data/ and src/data/          ");
    console.log("================================================================");
    process.exit(0);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[ERROR] Unexpected exception during live scraping run:", errorMsg);
    console.log("[FALLBACK] Attempting emergency offline dataset activation...");

    try {
      const fallbackPayload = await loadFallbackAlerts();
      console.log(`[FALLBACK] Loaded ${fallbackPayload.count} offline fallback alerts.`);
    } catch (fallbackError: unknown) {
      const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      console.error("[FATAL] Emergency fallback error:", fallbackMsg);
    }

    // Always exit with code 0 per safe infrastructure requirements
    console.log("[SAFE-EXIT] Exiting cleanly with code 0.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("[UNCAUGHT] Top-level handler:", err);
  process.exit(0);
});
