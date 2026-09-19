// Safe robots.txt parser and checker
export interface RobotsRules {
  allow: string[];
  disallow: string[];
  crawlDelay: number;
}

export function parseRobotsTxt(content: string, userAgent = "*"): RobotsRules {
  const lines = content.split(/\r?\n/);
  const rules: RobotsRules = {
    allow: [],
    disallow: [],
    crawlDelay: 1000 // default 1s
  };

  let currentUserAgentMatches = false;
  const targetAgent = userAgent.toLowerCase();

  for (let line of lines) {
    line = line.replace(/#.*$/, "").trim();
    if (!line) continue;

    const [keyRaw, ...valParts] = line.split(":");
    const key = keyRaw.trim().toLowerCase();
    const val = valParts.join(":").trim();

    if (key === "user-agent") {
      const agent = val.toLowerCase();
      currentUserAgentMatches = agent === "*" || agent === targetAgent;
    } else if (currentUserAgentMatches) {
      if (key === "disallow" && val) {
        rules.disallow.push(val);
      } else if (key === "allow" && val) {
        rules.allow.push(val);
      } else if (key === "crawl-delay") {
        const delay = parseFloat(val);
        if (!isNaN(delay)) {
          rules.crawlDelay = Math.max(rules.crawlDelay, delay * 1000);
        }
      }
    }
  }

  return rules;
}

export function isUrlAllowed(urlStr: string, rules: RobotsRules): boolean {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname + parsed.search;

    // Check allow rules first (most specific wins or explicit allow overrides)
    for (const allow of rules.allow) {
      if (path.startsWith(allow)) return true;
    }

    // Check disallow rules
    for (const disallow of rules.disallow) {
      if (path.startsWith(disallow)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Quick verification test
const mockRobots = `
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /private/public-feed
Crawl-delay: 2.5
`;

const parsed = parseRobotsTxt(mockRobots);
console.log("Parsed rules:", parsed);
console.log("Allowed /data/alerts?", isUrlAllowed("https://example.com/data/alerts", parsed)); // true
console.log("Allowed /admin/secrets?", isUrlAllowed("https://example.com/admin/secrets", parsed)); // false
console.log("Allowed /private/public-feed?", isUrlAllowed("https://example.com/private/public-feed", parsed)); // true
console.log("Allowed /private/other?", isUrlAllowed("https://example.com/private/other", parsed)); // false
