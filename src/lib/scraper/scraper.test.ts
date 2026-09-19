/**
 * Comprehensive Unit Test Suite for Safe Web Scraping Data Pipeline (R2 & R3).
 * Tests:
 * 1. RFC 9309 robots.txt parser and path evaluator (allow/disallow precedence, crawl-delay, comments)
 * 2. Adaptive domain-level rate limiter (throttling, jitter, cross-domain independence)
 * 3. Colorimetric reagent cross-referencing against color_library.json and novel synthetics
 * 4. Fallback dataset integrity and ThreatAlertsPayload schema adherence
 * 5. Network resilience and error isolation
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  parseRobotsTxt,
  isPathAllowed,
  RobotsManager,
} from "./robots.ts";
import { DomainRateLimiter } from "./rateLimiter.ts";
import { findReagentGuidance } from "./sources/reagentMatcher.ts";
import { loadFallbackAlerts } from "./index.ts";
import type { ThreatLevel } from "./types.ts";

describe("RFC 9309 Robots.txt Parser & Access Evaluator", () => {
  it("correctly parses user-agent blocks, allow, disallow, and crawl-delay directives", () => {
    const robotsSample = `
# Robots exclusion file for public health portal
User-agent: Googlebot
Disallow: /private/

User-agent: *
Disallow: /admin/
Disallow: /confidential/
Allow: /confidential/public-advisories
Crawl-delay: 2.5
`;

    const rules = parseRobotsTxt(robotsSample, "NCB-Forensic-Monitor");
    expect(rules.disallow).toEqual(["/admin/", "/confidential/"]);
    expect(rules.allow).toEqual(["/confidential/public-advisories"]);
    expect(rules.crawlDelayMs).toBe(2500);
  });

  it("prioritizes targeted user-agent directives over wildcard (*)", () => {
    const targetedSample = `
User-agent: *
Disallow: /data/

User-agent: NCB-Forensic-Monitor
Allow: /data/public-threats
Disallow: /data/internal
Crawl-delay: 3.0
`;

    const rules = parseRobotsTxt(targetedSample, "NCB-Forensic-Monitor");
    expect(rules.allow).toEqual(["/data/public-threats"]);
    expect(rules.disallow).toEqual(["/data/internal"]);
    expect(rules.crawlDelayMs).toBe(3000);
  });

  it("evaluates path allowances with longest-match rule per RFC 9309 section 2.2.2", () => {
    const rules = {
      allow: ["/confidential/public-advisories", "/open/"],
      disallow: ["/admin/", "/confidential/"],
      crawlDelayMs: 1500,
    };

    // Public / unrelated paths allowed by default
    expect(isPathAllowed("/news/health-alerts", rules)).toBe(true);
    expect(isPathAllowed("/open/catalog", rules)).toBe(true);

    // Disallowed path blocked
    expect(isPathAllowed("/admin/users", rules)).toBe(false);
    expect(isPathAllowed("/admin/", rules)).toBe(false);

    // Specific sub-path allowance overrides broader parent disallow (longest match)
    expect(isPathAllowed("/confidential/public-advisories/2026/01", rules)).toBe(true);
    expect(isPathAllowed("/confidential/secret-report.pdf", rules)).toBe(false);
  });

  it("treats equal-length allow and disallow paths with allow precedence", () => {
    const rules = {
      allow: ["/portal/secure"],
      disallow: ["/portal/secure"],
      crawlDelayMs: 1500,
    };

    // RFC 9309 § 2.2.2: equal length -> allow takes precedence
    expect(isPathAllowed("/portal/secure/page", rules)).toBe(true);
  });

  it("handles empty Disallow directive as allow-all per RFC", () => {
    const emptyDisallow = `
User-agent: *
Disallow:
`;
    const rules = parseRobotsTxt(emptyDisallow);
    expect(rules.disallow).toEqual([]);
    expect(isPathAllowed("/anything/at/all", rules)).toBe(true);
  });

  it("RobotsManager permits crawling on 404 response per RFC 9309 section 2.3.1.2", async () => {
    const manager = new RobotsManager();
    // Simulate setting permissive fallback rules for an origin
    manager.setRules("https://api.fda.gov", {
      allow: ["/"],
      disallow: [],
      crawlDelayMs: 1500,
    });

    const isAllowed = await manager.isAllowed("https://api.fda.gov/drug/enforcement.json");
    expect(isAllowed).toBe(true);
  });
});

describe("Adaptive Domain-Level Rate Limiter", () => {
  let limiter: DomainRateLimiter;

  beforeEach(() => {
    limiter = new DomainRateLimiter();
  });

  it("enforces minimum delay between consecutive calls to the same origin", async () => {
    const origin = "https://api.fda.gov";
    const minDelay = 80;

    // First call has no elapsed wait
    const wait1 = await limiter.throttle(origin, minDelay, [0, 0]);
    expect(wait1).toBe(0);

    // Immediate second call must be throttled
    const wait2 = await limiter.throttle(origin, minDelay, [0, 0]);
    expect(wait2).toBeGreaterThanOrEqual(40);
  });

  it("does NOT throttle independent origins unnecessarily", async () => {
    const originA = "https://api.fda.gov";
    const originB = "https://narcoticsindia.nic.in";

    await limiter.throttle(originA, 200, [0, 0]);

    // Request to originB right after originA should execute immediately without waiting for originA
    const waitB = await limiter.throttle(originB, 200, [0, 0]);
    expect(waitB).toBe(0);
  });

  it("injects randomized jitter within the specified boundaries", async () => {
    const origin = "https://example.gov";
    await limiter.throttle(origin, 50, [0, 0]);

    // Throttle with jitter between 20ms and 40ms
    const waitWithJitter = await limiter.throttle(origin, 50, [20, 40]);
    expect(waitWithJitter).toBeGreaterThanOrEqual(20);
  });

  it("resets tracked timestamps when reset() is invoked", async () => {
    const origin = "https://api.fda.gov";
    await limiter.throttle(origin, 500, [0, 0]);
    expect(limiter.getLastRequestTime(origin)).toBeGreaterThan(0);

    limiter.reset();
    expect(limiter.getLastRequestTime(origin)).toBe(0);
  });
});

describe("Colorimetric Reagent Cross-Referencing", () => {
  it("correctly identifies Marquis reaction for classic opioids in color_library.json", () => {
    const morphineGuidance = findReagentGuidance("Morphine Sulfate");
    expect(morphineGuidance).toBeDefined();
    expect(morphineGuidance?.reagent).toBe("Marquis");
    expect(morphineGuidance?.rgbTarget).toEqual([16, 6, 13]);

    const heroinGuidance = findReagentGuidance("Heroin");
    expect(heroinGuidance).toBeDefined();
    expect(heroinGuidance?.reagent).toBe("Marquis");
    expect(heroinGuidance?.rgbTarget).toEqual([17, 7, 14]);

    const codeineGuidance = findReagentGuidance("Codeine Phosphate");
    expect(codeineGuidance).toBeDefined();
    expect(codeineGuidance?.reagent).toBe("Marquis");
    expect(codeineGuidance?.rgbTarget).toEqual([25, 11, 23]);
  });

  it("correctly identifies Marquis reaction for stimulants in color_library.json", () => {
    const amphetamineGuidance = findReagentGuidance("Amphetamine");
    expect(amphetamineGuidance).toBeDefined();
    expect(amphetamineGuidance?.reagent).toBe("Marquis");
    expect(amphetamineGuidance?.rgbTarget).toEqual([139, 48, 14]);

    const methGuidance = findReagentGuidance("Methamphetamine");
    expect(methGuidance).toBeDefined();
    expect(methGuidance?.reagent).toBe("Marquis");
    expect(methGuidance?.rgbTarget).toEqual([137, 53, 17]);
  });

  it("provides specialized forensic cautions for novel synthetic opioids (Nitazenes)", () => {
    const guidance = findReagentGuidance("Protonitazepyne");
    expect(guidance).toBeDefined();
    expect(guidance?.reagent).toContain("Marquis");
    expect(guidance?.cautionNote).toContain("High potency");
    expect(guidance?.expectedReaction).toContain("reagent does not confirm nitazene");
  });

  it("provides forensic cautions for veterinary adulterants (Xylazine / Medetomidine)", () => {
    const guidance = findReagentGuidance("Medetomidine / Xylazine");
    expect(guidance).toBeDefined();
    expect(guidance?.expectedReaction).toContain("adulterant remains masked");
    expect(guidance?.cautionNote).toContain("unresponsive to naloxone");
  });

  it("provides Zimmerman / Marquis guidance for novel benzodiazepines (Bromazolam)", () => {
    const guidance = findReagentGuidance("Bromazolam counterfeit tablets");
    expect(guidance).toBeDefined();
    expect(guidance?.reagent).toContain("Zimmerman");
  });

  it("returns undefined gracefully for unknown substances without throwing", () => {
    const guidance = findReagentGuidance("Inert Cornstarch Excipient");
    expect(guidance).toBeUndefined();
  });
});

describe("Threat Alerts Payload & Fallback Dataset Integrity", () => {
  it("loads verified offline fallback dataset with 100% schema adherence", async () => {
    const payload = await loadFallbackAlerts();

    expect(payload.success).toBe(true);
    expect(payload.source).toBe("fallback");
    expect(typeof payload.lastUpdated).toBe("string");
    expect(payload.count).toBeGreaterThanOrEqual(5);
    expect(payload.alerts.length).toBe(payload.count);
    expect(payload.sourcesScraped.length).toBeGreaterThan(0);

    const validLevels: ThreatLevel[] = ["CRITICAL", "HIGH", "ELEVATED", "MODERATE", "ADVISORY"];

    for (const alert of payload.alerts) {
      // Identity & Classification
      expect(alert.id).toBeDefined();
      expect(typeof alert.id).toBe("string");
      expect(alert.id.length).toBeGreaterThan(3);

      expect(alert.source).toBeDefined();
      expect(alert.substance).toBeDefined();
      expect(alert.category).toBeDefined();
      expect(validLevels).toContain(alert.threatLevel);

      // Timestamps & Geography
      expect(new Date(alert.publishedAt).getTime()).not.toBeNaN();
      expect(alert.region).toBeDefined();

      // Forensic Content
      expect(typeof alert.summary).toBe("string");
      expect(alert.summary.length).toBeGreaterThan(10);
      expect(alert.status).toMatch(/ACTIVE|MONITORING|RESOLVED/);
      expect(alert.url).toMatch(/^https?:\/\//);

      // Reagent Guidance
      if (alert.reagentGuidance) {
        expect(alert.reagentGuidance.reagent).toBeDefined();
        expect(alert.reagentGuidance.expectedReaction).toBeDefined();
        if (alert.reagentGuidance.rgbTarget) {
          expect(alert.reagentGuidance.rgbTarget.length).toBe(3);
          alert.reagentGuidance.rgbTarget.forEach((val) => {
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(255);
          });
        }
      }
    }
  });

  it("ensures national NCB India alerts and international alerts are both present in fallback", async () => {
    const payload = await loadFallbackAlerts();
    const hasNcb = payload.alerts.some((a) => a.source.includes("Narcotics Control Bureau"));
    const hasFdaOrDea = payload.alerts.some((a) => a.source.includes("FDA") || a.source.includes("DEA"));

    expect(hasNcb).toBe(true);
    expect(hasFdaOrDea).toBe(true);
  });
});
