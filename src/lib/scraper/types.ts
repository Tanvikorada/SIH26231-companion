/**
 * Type definitions for the NCB Safe Web Scraping Data Pipeline.
 * Conforms to GIGW 3.0 / Digital India UX4G Live Alerts specifications.
 */

export type ThreatLevel = "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE" | "ADVISORY";

export type ThreatCategory =
  | "ADULTERANT"
  | "NOVEL_OPIOID"
  | "COUNTERFEIT"
  | "CONTAMINATION"
  | "RECALL"
  | "SYNTHETIC_CANNABINOID"
  | "BENZODIAZEPINE"
  | "STIMULANT";

export type ThreatStatus = "ACTIVE" | "MONITORING" | "RESOLVED";

export interface ReagentGuidance {
  reagent: string;
  expectedReaction: string;
  rgbTarget?: [number, number, number];
  cautionNote?: string;
}

export interface ThreatAlert {
  id: string;
  source: string;
  substance: string;
  category: ThreatCategory;
  threatLevel: ThreatLevel;
  publishedAt: string; // ISO 8601 string, e.g. "2026-09-18T10:00:00.000Z"
  region: string; // e.g. "National (India)", "International", "United States", "Europe"
  summary: string;
  details?: string;
  reagentGuidance?: ReagentGuidance;
  status: ThreatStatus;
  url: string;
}

export interface ThreatAlertsPayload {
  success: boolean;
  source: "live_cache" | "fallback" | "live_sync";
  lastUpdated: string;
  count: number;
  sourcesScraped: string[];
  alerts: ThreatAlert[];
}

export interface ScraperSourceResult {
  sourceName: string;
  alerts: ThreatAlert[];
  success: boolean;
  error?: string;
}

export interface ScraperConfig {
  timeoutMs?: number;
  minRateLimitMs?: number;
  userAgent?: string;
  outDirs?: string[];
  enableFallbackOnFailure?: boolean;
}

export interface RobotsRules {
  allow: string[];
  disallow: string[];
  crawlDelayMs: number;
  cachedAt: number;
}
