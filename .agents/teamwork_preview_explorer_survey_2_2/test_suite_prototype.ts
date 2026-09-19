// Unit test prototype for Scraper and Safe Infrastructure
import assert from "node:assert";

// 1. Robots.txt parser
export function parseRobotsTxt(content: string, userAgent = "*") {
  const lines = content.split(/\r?\n/);
  const rules = { allow: [] as string[], disallow: [] as string[], crawlDelay: 1000 };
  let match = false;
  for (let line of lines) {
    line = line.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [k, ...v] = line.split(":");
    const key = k.trim().toLowerCase();
    const val = v.join(":").trim();
    if (key === "user-agent") {
      match = val === "*" || val.toLowerCase() === userAgent.toLowerCase();
    } else if (match) {
      if (key === "disallow" && val) rules.disallow.push(val);
      else if (key === "allow" && val) rules.allow.push(val);
      else if (key === "crawl-delay") {
        const d = parseFloat(val);
        if (!isNaN(d)) rules.crawlDelay = Math.max(rules.crawlDelay, d * 1000);
      }
    }
  }
  return rules;
}

export function isUrlAllowed(urlStr: string, rules: { allow: string[]; disallow: string[] }): boolean {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname + parsed.search;
    for (const allow of rules.allow) {
      if (path.startsWith(allow)) return true;
    }
    for (const disallow of rules.disallow) {
      if (path.startsWith(disallow)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// 2. Rate limiter tracker
export class DomainRateLimiter {
  private lastRequest = new Map<string, number>();

  async throttle(origin: string, minDelayMs = 1000): Promise<number> {
    const now = Date.now();
    const last = this.lastRequest.get(origin) || 0;
    const elapsed = now - last;
    let waitTime = 0;
    if (elapsed < minDelayMs) {
      waitTime = minDelayMs - elapsed;
      await new Promise((r) => setTimeout(r, waitTime));
    }
    this.lastRequest.set(origin, Date.now());
    return waitTime;
  }
}

// Verification runner
async function runTests() {
  console.log("Running Scraper Infra Unit Tests...");

  // Test 1: Robots.txt parsing
  const robotsSample = `
  User-agent: otherbot
  Disallow: /public
  
  User-agent: *
  Disallow: /admin/
  Disallow: /confidential/
  Allow: /confidential/public-advisories
  Crawl-delay: 2.5
  `;
  const rules = parseRobotsTxt(robotsSample);
  assert.deepStrictEqual(rules.disallow, ["/admin/", "/confidential/"]);
  assert.deepStrictEqual(rules.allow, ["/confidential/public-advisories"]);
  assert.strictEqual(rules.crawlDelay, 2500);
  console.log("✔ Test 1 passed: Robots.txt parsed correctly");

  // Test 2: URL permission checking
  assert.strictEqual(isUrlAllowed("https://test.gov/news/alerts", rules), true);
  assert.strictEqual(isUrlAllowed("https://test.gov/admin/login", rules), false);
  assert.strictEqual(isUrlAllowed("https://test.gov/confidential/public-advisories/1", rules), true);
  assert.strictEqual(isUrlAllowed("https://test.gov/confidential/secret", rules), false);
  console.log("✔ Test 2 passed: URL path permissions correctly evaluated");

  // Test 3: Domain Rate Limiter
  const limiter = new DomainRateLimiter();
  const start = Date.now();
  await limiter.throttle("https://api.fda.gov", 100);
  const wait = await limiter.throttle("https://api.fda.gov", 100);
  assert(wait >= 50, `Expected wait time >= 50ms, got ${wait}`);
  console.log("✔ Test 3 passed: Rate limiter throttles consecutive same-domain calls");

  // Test 4: Independent domains do not block each other
  const waitOther = await limiter.throttle("https://narcoticsindia.nic.in", 100);
  assert(waitOther < 20, `Independent domain should not be delayed, got ${waitOther}ms`);
  console.log("✔ Test 4 passed: Independent domains are not throttled unnecessarily");

  console.log("All Scraper Infra Unit Tests PASSED (4/4)!");
}

runTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
