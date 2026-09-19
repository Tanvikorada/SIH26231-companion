/**
 * Master Threat Scraping Pipeline Orchestrator.
 * Aggregates alerts from openFDA and emerging synthetic threat channels,
 * cross-references colorimetric reagent profiles, and saves structured JSON.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { scrapeOpenFda } from "./sources/openfda.ts";
import { scrapeSyntheticThreats } from "./sources/syntheticThreats.ts";
import type {
  ThreatAlert,
  ThreatAlertsPayload,
  ScraperConfig,
  ScraperSourceResult,
} from "./types.ts";

export * from "./types.ts";
export * from "./robots.ts";
export * from "./rateLimiter.ts";
export * from "./fetcher.ts";
export * from "./sources/reagentMatcher.ts";
export * from "./sources/openfda.ts";
export * from "./sources/syntheticThreats.ts";

const DEFAULT_OUTPUT_PATHS = [
  path.resolve(process.cwd(), "data/threat_alerts.json"),
  path.resolve(process.cwd(), "src/data/threat_alerts.json"),
];

const FALLBACK_PATH = path.resolve(process.cwd(), "src/data/threat_alerts_fallback.json");

/**
 * Loads the offline verified fallback alerts dataset.
 */
export async function loadFallbackAlerts(): Promise<ThreatAlertsPayload> {
  try {
    const raw = await fs.readFile(FALLBACK_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.alerts)) {
      return {
        success: true,
        source: "fallback",
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        count: parsed.alerts.length,
        sourcesScraped: parsed.sourcesScraped || ["NCB Offline Archive"],
        alerts: parsed.alerts,
      };
    }
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.warn(`[loadFallbackAlerts] Failed to load ${FALLBACK_PATH}: ${errMessage}`);
  }

  // Emergency hard-wired fallback in case fallback file itself is missing
  return {
    success: true,
    source: "fallback",
    lastUpdated: new Date().toISOString(),
    count: 1,
    sourcesScraped: ["NCB National Fallback Registry"],
    alerts: [
      {
        id: "NCB-EMERGENCY-001",
        source: "Narcotics Control Bureau (NCB)",
        substance: "Synthetic Opioids & Adulterants",
        category: "ADULTERANT",
        threatLevel: "CRITICAL",
        publishedAt: new Date().toISOString(),
        region: "National (India)",
        summary: "Emergency Fallback Surveillance Advisory",
        details: "Offline operational mode active. Reagent testing recommended for all suspected contraband.",
        status: "ACTIVE",
        url: "https://narcoticsindia.nic.in/",
      },
    ],
  };
}

/**
 * Runs the complete multi-source web scraping pipeline.
 * Features per-source error isolation, automatic fallback on complete network failure,
 * and dual output serialization to data/threat_alerts.json and src/data/threat_alerts.json.
 */
export async function runScraper(config: ScraperConfig = {}): Promise<ThreatAlertsPayload> {
  console.log("=== NCB O.A.S. Safe Web Scraping Data Pipeline ===");
  const startTime = Date.now();

  const allAlerts: ThreatAlert[] = [];
  const successfulSources: string[] = [];
  const results: ScraperSourceResult[] = [];

  // Source 1: openFDA Drug Enforcement / Recalls
  try {
    console.log("[1/2] Fetching live alerts from openFDA Drug Enforcement endpoint...");
    const fdaResult = await scrapeOpenFda();
    results.push(fdaResult);
    if (fdaResult.success && fdaResult.alerts.length > 0) {
      console.log(`      ✓ openFDA returned ${fdaResult.alerts.length} structured alerts.`);
      allAlerts.push(...fdaResult.alerts);
      successfulSources.push(fdaResult.sourceName);
    } else {
      console.warn(`      ⚠ openFDA query unfulfilled: ${fdaResult.error || "empty response"}`);
    }
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.warn(`      ⚠ openFDA scraper exception: ${errMessage}`);
  }

  // Source 2: DEA / UNODC / NCB Emerging Synthetic Threat Bulletins
  try {
    console.log("[2/2] Ingesting emerging synthetic threat advisories (Nitazenes / Xylazine)...");
    const syntheticResult = await scrapeSyntheticThreats();
    results.push(syntheticResult);
    if (syntheticResult.success && syntheticResult.alerts.length > 0) {
      console.log(`      ✓ Synthetic threat bulletins: ${syntheticResult.alerts.length} alerts loaded.`);
      allAlerts.push(...syntheticResult.alerts);
      successfulSources.push(syntheticResult.sourceName);
    }
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.warn(`      ⚠ Synthetic threats scraper exception: ${errMessage}`);
  }

  // Determine payload status and populate alerts
  let isFallback = false;
  let finalAlerts = allAlerts;
  let finalSources = successfulSources;

  if (finalAlerts.length === 0) {
    console.warn("[WARN] All live sources yielded 0 alerts. Activating offline fallback dataset...");
    const fallback = await loadFallbackAlerts();
    finalAlerts = fallback.alerts;
    finalSources = fallback.sourcesScraped;
    isFallback = true;
  }

  // Deduplicate alerts by ID
  const seenIds = new Set<string>();
  const dedupedAlerts: ThreatAlert[] = [];
  for (const alert of finalAlerts) {
    if (!seenIds.has(alert.id)) {
      seenIds.add(alert.id);
      dedupedAlerts.push(alert);
    }
  }

  const payload: ThreatAlertsPayload = {
    success: true,
    source: isFallback ? "fallback" : "live_cache",
    lastUpdated: new Date().toISOString(),
    count: dedupedAlerts.length,
    sourcesScraped: finalSources,
    alerts: dedupedAlerts,
  };

  // Determine output destinations
  const targetPaths = config.outDirs && config.outDirs.length > 0
    ? config.outDirs
    : DEFAULT_OUTPUT_PATHS;

  // Persist to each target path
  for (const targetPath of targetPaths) {
    try {
      const dir = path.dirname(targetPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(targetPath, JSON.stringify(payload, null, 2), "utf-8");
      console.log(`[OUTPUT] Wrote ${payload.count} structured alerts to ${targetPath}`);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[WARN] Failed writing output to ${targetPath}: ${errMessage}`);
    }
  }

  const elapsedMs = Date.now() - startTime;
  console.log(`=== Ingestion Finished in ${elapsedMs}ms. Total: ${payload.count} alerts. Status: ${payload.source} ===`);

  return payload;
}

/**
 * Retrieves the current threat alerts, reading from data/threat_alerts.json
 * or falling back gracefully to src/data/threat_alerts_fallback.json.
 */
export async function getThreatAlerts(): Promise<ThreatAlertsPayload> {
  for (const p of DEFAULT_OUTPUT_PATHS) {
    try {
      const raw = await fs.readFile(p, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.alerts)) {
        return parsed as ThreatAlertsPayload;
      }
    } catch {
      // Try next candidate
    }
  }
  return await loadFallbackAlerts();
}
