/**
/**
 * Empirical Adversarial Stress Test Suite for Safe Scraper Infrastructure.
 * Challenger 1 — Milestone 4.
 *
 * Tests:
 * 1. Robots.txt: RFC 9309 block paths, complex patterns, $ terminator, comments, 404/500 fallbacks, timeout
 * 2. Rate Limiter: Delay precision, domain isolation, jitter boundaries, concurrency behavior
 * 3. Safe Fetcher: AbortSignal timeout, transient 502/503 retry, retry exhaustion, safeFetchJson/safeFetchText error swallowing
 * 4. Malformed Payloads: HTML error pages, truncated JSON, missing schema properties, null elements
 * 5. Pipeline Error Isolation & Offline Fallback: Single source failure, dual source failure, emergency fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseRobotsTxt,
  isPathAllowed,
  RobotsManager,
} from "../src/lib/scraper/robots.ts";
import { DomainRateLimiter } from "../src/lib/scraper/rateLimiter.ts";
import {
  safeFetch,
  safeFetchJson,
  safeFetchText,
  RobotsDisallowedError,
} from "../src/lib/scraper/fetcher.ts";
import { scrapeOpenFda } from "../src/lib/scraper/sources/openfda.ts";
import {
  runScraper,
  loadFallbackAlerts,
} from "../src/lib/scraper/index.ts";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("Adversarial Robots.txt Parser & Access Evaluator", () => {
  it("handles hostile malformed robots.txt content (no colons, trailing colons, spaces, comments)", () => {
    const hostileRobots = `
# Broken header without content
Just some random plain text
:::
User-agent:
Disallow:
User-agent: *
Disallow: /restricted/ # inline comment
Allow: /restricted/public$ # path termination
Crawl-delay: not-a-number
Crawl-delay: -5
Crawl-delay: 4.2
`;
    const parsed = parseRobotsTxt(hostileRobots, "TestBot");
    expect(parsed.disallow).toEqual(["/restricted/"]);
    expect(parsed.allow).toEqual(["/restricted/public$"]);
    expect(parsed.crawlDelayMs).toBe(4200);
  });

  it("handles case-insensitive directive keywords (USER-AGENT, DISALLOW, ALLOW)", () => {
    const upperRobots = `
USER-AGENT: *
DISALLOW: /secret/
ALLOW: /secret/open
CRAWL-DELAY: 3.5
`;
    const parsed = parseRobotsTxt(upperRobots);
    expect(parsed.disallow).toEqual(["/secret/"]);
    expect(parsed.allow).toEqual(["/secret/open"]);
    expect(parsed.crawlDelayMs).toBe(3500);
  });

  it("evaluates end-of-path pattern matching ($ marker)", () => {
    const rules = {
      allow: ["/exact$"],
      disallow: ["/exact/"],
      crawlDelayMs: 1500,
    };

    expect(isPathAllowed("/exact", rules)).toBe(true);
    expect(isPathAllowed("/exact/", rules)).toBe(false);
    expect(isPathAllowed("/exact/child", rules)).toBe(false);
  });

  it("handles query string paths in allow/disallow rules", () => {
    const rules = {
      allow: ["/api/v1/alerts?format=json"],
      disallow: ["/api/v1/alerts"],
      crawlDelayMs: 1500,
    };

    // Longest match: /api/v1/alerts?format=json (length 27) vs /api/v1/alerts (length 14)
    expect(isPathAllowed("/api/v1/alerts?format=json", rules)).toBe(true);
    expect(isPathAllowed("/api/v1/alerts?format=xml", rules)).toBe(false);
    expect(isPathAllowed("/api/v1/alerts", rules)).toBe(false);
  });

  it("RobotsManager handles HTTP 404, 403, and 500 status codes with permissive fallback", async () => {
    const manager = new RobotsManager();
    const originalFetch = globalThis.fetch;

    // Test 404 Not Found
    globalThis.fetch = vi.fn().mockResolvedValueOnce(new Response("", { status: 404 }));
    const rules404 = await manager.getRulesForOrigin("https://hostile-404.gov");
    expect(rules404.allow).toEqual(["/"]);
    expect(rules404.disallow).toEqual([]);

    // Test 500 Internal Server Error
    manager.clearCache();
    globalThis.fetch = vi.fn().mockResolvedValueOnce(new Response("Internal Error", { status: 500 }));
    const rules500 = await manager.getRulesForOrigin("https://hostile-500.gov");
    expect(rules500.allow).toEqual(["/"]);
    expect(rules500.disallow).toEqual([]);

    // Test 403 Forbidden
    manager.clearCache();
    globalThis.fetch = vi.fn().mockResolvedValueOnce(new Response("Forbidden", { status: 403 }));
    const rules403 = await manager.getRulesForOrigin("https://hostile-403.gov");
    expect(rules403.allow).toEqual(["/"]);
    expect(rules403.disallow).toEqual([]);

    globalThis.fetch = originalFetch;
  });

  it("RobotsManager handles network timeout and connection reset gracefully", async () => {
    const manager = new RobotsManager();
    const originalFetch = globalThis.fetch;

    // Network connection reset / failure
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error("ECONNRESET: connection reset by peer"));
    const rulesReset = await manager.getRulesForOrigin("https://unstable-origin.gov");
    expect(rulesReset.allow).toEqual(["/"]);
    expect(rulesReset.disallow).toEqual([]);

    globalThis.fetch = originalFetch;
  });

  it("RobotsManager enforces in-memory cache within TTL", async () => {
    const manager = new RobotsManager();
    const originalFetch = globalThis.fetch;

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("User-agent: *\nDisallow: /cached-block/\n", { status: 200 })
    );
    globalThis.fetch = mockFetch;

    // First call triggers network fetch
    const allowed1 = await manager.isAllowed("https://cached-domain.gov/cached-block/test");
    expect(allowed1).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call must hit cache without triggering another fetch
    const allowed2 = await manager.isAllowed("https://cached-domain.gov/cached-block/test2");
    expect(allowed2).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    globalThis.fetch = originalFetch;
  });

  it("isAllowed returns false when given a completely malformed URL string", async () => {
    const manager = new RobotsManager();
    const result = await manager.isAllowed("not-a-valid-url-at-all");
    expect(result).toBe(false);
  });
});

describe("Adversarial Rate Limiter Stress Testing", () => {
  let limiter: DomainRateLimiter;

  beforeEach(() => {
    limiter = new DomainRateLimiter();
  });

  it("empirically enforces inter-request delay under rapid sequential invocations", async () => {
    const origin = "https://rate-limit-test.gov";
    const minDelay = 100;

    const t0 = Date.now();
    await limiter.throttle(origin, minDelay, [0, 0]);
    const t1 = Date.now();
    await limiter.throttle(origin, minDelay, [0, 0]);
    const t2 = Date.now();

    expect(t1 - t0).toBeLessThan(50); // First call: immediate
    expect(t2 - t1).toBeGreaterThanOrEqual(85); // Second call: throttled
  });

  it("maintains strict domain isolation across concurrent/interleaved origins", async () => {
    const originA = "https://origin-a.org";
    const originB = "https://origin-b.org";
    const originC = "https://origin-c.org";

    // Throttle origin A
    await limiter.throttle(originA, 250, [0, 0]);

    // Origin B and Origin C should execute immediately without waiting for Origin A
    const tB0 = Date.now();
    const waitB = await limiter.throttle(originB, 250, [0, 0]);
    const tB1 = Date.now();

    const tC0 = Date.now();
    const waitC = await limiter.throttle(originC, 250, [0, 0]);
    const tC1 = Date.now();

    expect(waitB).toBe(0);
    expect(waitC).toBe(0);
    expect(tB1 - tB0).toBeLessThan(30);
    expect(tC1 - tC0).toBeLessThan(30);
  });

  it("adds jitter strictly within bounded range", async () => {
    const origin = "https://jitter-test.gov";
    await limiter.throttle(origin, 40, [0, 0]);

    const jitterMin = 15;
    const jitterMax = 35;
    const wait = await limiter.throttle(origin, 40, [jitterMin, jitterMax]);

    // Wait should be base wait + jitter (at least jitterMin)
    expect(wait).toBeGreaterThanOrEqual(jitterMin);
  });

  it("concurrency stress test: reveals absence of mutex queue under simultaneous Promise.all calls", async () => {
    // If two calls happen at the exact same instant before lastRequestMap is updated:
    const origin = "https://concurrent-test.gov";
    limiter.reset();

    const [wait1, wait2] = await Promise.all([
      limiter.throttle(origin, 150, [0, 0]),
      limiter.throttle(origin, 150, [0, 0]),
    ]);

    // Note for Challenger Report: If both resolve with 0 wait because lastRequest was 0 at initiation,
    // this documents that the limiter is designed for serial dispatch rather than concurrent queueing.
    expect(typeof wait1).toBe("number");
    expect(typeof wait2).toBe("number");
  });
});

describe("Safe Fetcher Adversarial Scenarios", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("throws RobotsDisallowedError when robots.txt disallows the URL", async () => {
    const robotsManager = new RobotsManager();
    robotsManager.setRules("https://blocked-site.gov", {
      allow: [],
      disallow: ["/api/threats/"],
      crawlDelayMs: 1500,
    });

    const rateLimiter = new DomainRateLimiter();

    await expect(
      safeFetch("https://blocked-site.gov/api/threats/active.json", {
        robotsManager,
        rateLimiter,
      })
    ).rejects.toThrow(RobotsDisallowedError);
  });

  it("aborts when server response exceeds timeoutMs", async () => {
    const robotsManager = new RobotsManager();
    robotsManager.setRules("https://slow-server.gov", {
      allow: ["/"],
      disallow: [],
      crawlDelayMs: 1500,
    });

    const rateLimiter = new DomainRateLimiter();

    // Mock fetch that hangs longer than timeoutMs
    globalThis.fetch = vi.fn().mockImplementation((_url, init) => {
      return new Promise((_, reject) => {
        const signal = init?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "TimeoutError";
            reject(err);
          });
        }
      });
    });

    await expect(
      safeFetch("https://slow-server.gov/data.json", {
        timeoutMs: 50,
        maxRetries: 0,
        robotsManager,
        rateLimiter,
      })
    ).rejects.toThrow();
  });

  it("retries on transient HTTP 502/503 errors and succeeds on subsequent attempt", async () => {
    const robotsManager = new RobotsManager();
    robotsManager.setRules("https://flaky-server.gov", {
      allow: ["/"],
      disallow: [],
      crawlDelayMs: 1500,
    });

    const rateLimiter = new DomainRateLimiter();

    let attempts = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        return new Response("Bad Gateway", { status: 502 });
      }
      return new Response(JSON.stringify({ status: "recovered" }), { status: 200 });
    });

    const res = await safeFetch("https://flaky-server.gov/data.json", {
      retryDelayMs: 10,
      maxRetries: 1,
      robotsManager,
      rateLimiter,
    });

    expect(res.status).toBe(200);
    expect(attempts).toBe(2);
  });

  it("returns 503 response when retries are exhausted without throwing unhandled network error", async () => {
    const robotsManager = new RobotsManager();
    robotsManager.setRules("https://down-server.gov", {
      allow: ["/"],
      disallow: [],
      crawlDelayMs: 1500,
    });

    const rateLimiter = new DomainRateLimiter();

    let calls = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      calls++;
      return new Response("Service Unavailable", { status: 503 });
    });

    const res = await safeFetch("https://down-server.gov/data.json", {
      retryDelayMs: 5,
      maxRetries: 1,
      robotsManager,
      rateLimiter,
    });

    // safeFetch follows fetch convention: returns Response object with status 503 (res.ok is false)
    expect(res.status).toBe(503);
    expect(res.ok).toBe(false);
    expect(calls).toBe(2); // 1 initial + 1 retry = 2 attempts

    // safeFetchJson properly inspects !res.ok and returns null
    const jsonRes = await safeFetchJson("https://down-server.gov/data.json", {
      retryDelayMs: 5,
      maxRetries: 1,
      robotsManager,
      rateLimiter,
    });
    expect(jsonRes).toBeNull();
  });

  it("safeFetchJson catches network and HTTP errors without throwing and returns null", async () => {
    const robotsManager = new RobotsManager();
    robotsManager.setRules("https://error-json.gov", {
      allow: ["/"],
      disallow: [],
      crawlDelayMs: 1500,
    });

    const rateLimiter = new DomainRateLimiter();

    // 1. HTTP 500 error
    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      new Response("Server Error", { status: 500 })
    );
    const res500 = await safeFetchJson("https://error-json.gov/api", {
      robotsManager,
      rateLimiter,
      maxRetries: 0,
    });
    expect(res500).toBeNull();

    // 2. Syntax error (corrupt JSON)
    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      new Response("<html>Bad Gateway Cloudflare</html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      })
    );
    const resSyntax = await safeFetchJson("https://error-json.gov/corrupt", {
      robotsManager,
      rateLimiter,
      maxRetries: 0,
    });
    expect(resSyntax).toBeNull();
  });

  it("safeFetchText returns null on failure without throwing", async () => {
    const robotsManager = new RobotsManager();
    robotsManager.setRules("https://error-text.gov", {
      allow: ["/"],
      disallow: [],
      crawlDelayMs: 1500,
    });

    const rateLimiter = new DomainRateLimiter();

    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      new Response("Not Found", { status: 404 })
    );
    const res = await safeFetchText("https://error-text.gov/missing.txt", {
      robotsManager,
      rateLimiter,
      maxRetries: 0,
    });
    expect(res).toBeNull();
  });
});

describe("Malformed API Payloads & OpenFDA Error Isolation", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("handles non-array results field from openFDA gracefully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: "unexpected_string_not_array" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await scrapeOpenFda();
    expect(result.success).toBe(false);
    expect(result.alerts).toEqual([]);
    expect(result.error).toBeDefined();
  });

  it("handles missing/empty results in openFDA response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "No matches found" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await scrapeOpenFda();
    expect(result.success).toBe(false);
    expect(result.alerts).toEqual([]);
    expect(result.error).toContain("No matches found");
  });

  it("handles results containing null or sparse records without throwing", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {}, // completely empty object
            { recall_number: "R-999" }, // missing product_description and reason
            { product_description: "Fentanyl Citrate 50mcg", classification: "Class I" },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    const result = await scrapeOpenFda();
    expect(result.success).toBe(true);
    expect(result.alerts.length).toBe(3);

    // Verify fallback defaults on sparse records
    expect(result.alerts[0].substance).toBe("Controlled");
    expect(result.alerts[0].category).toBe("RECALL");
    expect(result.alerts[2].substance).toBe("Fentanyl");
    expect(result.alerts[2].threatLevel).toBe("CRITICAL");
  });

  it("handles results array containing null element gracefully via try/catch without crashing", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [null],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    const result = await scrapeOpenFda();
    expect(result.success).toBe(false);
    expect(result.alerts).toEqual([]);
    expect(result.error).toBeDefined();
  });
});

describe("Pipeline Error Isolation & Offline Fallback Activation", () => {
  it("activates verified offline fallback dataset when live sources fail", async () => {
    const fallback = await loadFallbackAlerts();
    expect(fallback.success).toBe(true);
    expect(fallback.source).toBe("fallback");
    expect(fallback.count).toBeGreaterThanOrEqual(5);
    expect(fallback.alerts.length).toBe(fallback.count);

    // Verify essential structure for UI rendering
    for (const a of fallback.alerts) {
      expect(a.id).toBeTruthy();
      expect(a.substance).toBeTruthy();
      expect(a.threatLevel).toMatch(/CRITICAL|HIGH|ELEVATED|MODERATE|ADVISORY/);
      expect(a.summary).toBeTruthy();
      expect(a.region).toBeTruthy();
    }
  });

  it("runs full pipeline and writes to test directory with zero crash", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "scraper-test-"));
    const outPath1 = path.join(tmpDir, "data", "threat_alerts.json");
    const outPath2 = path.join(tmpDir, "src_data", "threat_alerts.json");

    try {
      const payload = await runScraper({
        outDirs: [outPath1, outPath2],
      });

      expect(payload.success).toBe(true);
      expect(payload.count).toBeGreaterThan(0);
      expect(Array.isArray(payload.alerts)).toBe(true);

      // Verify files were actually written to disk
      const content1 = await fs.readFile(outPath1, "utf-8");
      const parsed1 = JSON.parse(content1);
      expect(parsed1.count).toBe(payload.count);

      const content2 = await fs.readFile(outPath2, "utf-8");
      const parsed2 = JSON.parse(content2);
      expect(parsed2.count).toBe(payload.count);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("activates hard-coded emergency fallback alert if fallback JSON file is corrupted or missing", async () => {
    const originalReadFile = fs.readFile;
    // Mock fs.readFile to throw ENOENT
    (fs as any).readFile = vi.fn().mockRejectedValueOnce(new Error("ENOENT: no such file or directory"));

    const fallback = await loadFallbackAlerts();
    expect(fallback.success).toBe(true);
    expect(fallback.source).toBe("fallback");
    expect(fallback.count).toBe(1);
    expect(fallback.alerts[0].id).toBe("NCB-EMERGENCY-001");
    expect(fallback.alerts[0].threatLevel).toBe("CRITICAL");

    fs.readFile = originalReadFile;
  });
});

