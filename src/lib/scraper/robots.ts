/**
 * RFC 9309 Compliant Robots.txt Parser and Access Evaluator.
 * Implements 1-hour in-memory caching, longest-match precedence, and 404 permissive fallback.
 */

import type { RobotsRules } from "./types.ts";

const ONE_HOUR_MS = 60 * 60 * 1000;
const DEFAULT_CRAWL_DELAY_MS = 1500;

export interface ParsedRules {
  allow: string[];
  disallow: string[];
  crawlDelayMs: number;
}

/**
 * Pure parser for robots.txt content adhering to RFC 9309.
 * Extracts allow, disallow, and crawl-delay directives for the specified user agent.
 */
export function parseRobotsTxt(content: string, userAgent = "*"): ParsedRules {
  const lines = content.split(/\r?\n/);
  const wildcardRules: ParsedRules = { allow: [], disallow: [], crawlDelayMs: DEFAULT_CRAWL_DELAY_MS };
  const specificRules: ParsedRules = { allow: [], disallow: [], crawlDelayMs: DEFAULT_CRAWL_DELAY_MS };

  const targetAgentLower = userAgent.toLowerCase();
  const currentAgents: string[] = [];

  for (const rawLine of lines) {
    // Strip comments and leading/trailing whitespace
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === "user-agent") {
      currentAgents.push(val.toLowerCase());
    } else if (key === "disallow" || key === "allow" || key === "crawl-delay") {
      const appliesToTarget = currentAgents.some(
        (a) => a === targetAgentLower || (targetAgentLower.includes(a) && a !== "*")
      );
      const appliesToWildcard = currentAgents.includes("*");

      if (key === "disallow") {
        if (val) {
          if (appliesToTarget) specificRules.disallow.push(val);
          if (appliesToWildcard) wildcardRules.disallow.push(val);
        }
      } else if (key === "allow") {
        if (val) {
          if (appliesToTarget) specificRules.allow.push(val);
          if (appliesToWildcard) wildcardRules.allow.push(val);
        }
      } else if (key === "crawl-delay") {
        const delaySec = parseFloat(val);
        if (!isNaN(delaySec) && delaySec > 0) {
          const delayMs = Math.round(delaySec * 1000);
          if (appliesToTarget) specificRules.crawlDelayMs = Math.max(delayMs, DEFAULT_CRAWL_DELAY_MS);
          if (appliesToWildcard) wildcardRules.crawlDelayMs = Math.max(delayMs, DEFAULT_CRAWL_DELAY_MS);
        }
      }
    }
  }

  // If specific agent rules were matched, prefer them over wildcard
  if (specificRules.allow.length > 0 || specificRules.disallow.length > 0) {
    return specificRules;
  }
  return wildcardRules;
}

/**
 * Evaluates whether a relative path (pathname + query) is allowed based on RFC 9309 longest-match rule.
 * If allow and disallow have matching prefix lengths, allow wins.
 */
export function isPathAllowed(path: string, rules: { allow: string[]; disallow: string[] }): boolean {
  let longestAllow = -1;
  let longestDisallow = -1;

  for (const allowPattern of rules.allow) {
    if (pathMatchesPrefix(path, allowPattern)) {
      if (allowPattern.length > longestAllow) {
        longestAllow = allowPattern.length;
      }
    }
  }

  for (const disallowPattern of rules.disallow) {
    if (pathMatchesPrefix(path, disallowPattern)) {
      if (disallowPattern.length > longestDisallow) {
        longestDisallow = disallowPattern.length;
      }
    }
  }

  // If both match, longest match wins. Equal length -> Allow wins per RFC 9309 section 2.2.2.
  if (longestAllow >= 0 && longestDisallow >= 0) {
    return longestAllow >= longestDisallow;
  }

  // If only allow matched
  if (longestAllow >= 0) return true;

  // If only disallow matched
  if (longestDisallow >= 0) return false;

  // No rule matched -> Allowed by default
  return true;
}

function pathMatchesPrefix(path: string, pattern: string): boolean {
  if (pattern.endsWith("$")) {
    const rawPattern = pattern.slice(0, -1);
    return path === rawPattern;
  }
  return path.startsWith(pattern);
}

/**
 * In-memory caching robots.txt manager.
 * Caches parsed rules for 1 hour per domain origin.
 */
export class RobotsManager {
  private cache = new Map<string, RobotsRules>();

  /**
   * Clears the in-memory cache (primarily for unit tests).
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Sets manual rules for an origin (useful for testing or offline mocking).
   */
  setRules(origin: string, rules: ParsedRules): void {
    this.cache.set(origin, {
      ...rules,
      cachedAt: Date.now(),
    });
  }

  /**
   * Fetches and parses robots.txt for a given origin, using cached rules if fresh.
   * If robots.txt returns 404, returns permissive rules per RFC 9309.
   */
  async getRulesForOrigin(origin: string, userAgent = "*"): Promise<RobotsRules> {
    const cached = this.cache.get(origin);
    const now = Date.now();
    if (cached && now - cached.cachedAt < ONE_HOUR_MS) {
      return cached;
    }

    const robotsUrl = `${origin}/robots.txt`;
    try {
      const res = await fetch(robotsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) (NCB-Forensic-Monitor/1.0)",
          "Accept": "text/plain",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.status === 404) {
        // RFC 9309: 404 means no restrictions
        const permissive: RobotsRules = {
          allow: ["/"],
          disallow: [],
          crawlDelayMs: DEFAULT_CRAWL_DELAY_MS,
          cachedAt: now,
        };
        this.cache.set(origin, permissive);
        return permissive;
      }

      if (res.ok) {
        const text = await res.text();
        const parsed = parseRobotsTxt(text, userAgent);
        const rules: RobotsRules = {
          ...parsed,
          cachedAt: now,
        };
        this.cache.set(origin, rules);
        return rules;
      }

      // Any other HTTP error (e.g. 403, 500) -> safe permissive fallback
      const fallback: RobotsRules = {
        allow: ["/"],
        disallow: [],
        crawlDelayMs: DEFAULT_CRAWL_DELAY_MS,
        cachedAt: now,
      };
      this.cache.set(origin, fallback);
      return fallback;
    } catch {
      // Network failure / timeout fetching robots.txt -> treat as permissive to prevent pipeline stall
      const networkFallback: RobotsRules = {
        allow: ["/"],
        disallow: [],
        crawlDelayMs: DEFAULT_CRAWL_DELAY_MS,
        cachedAt: now,
      };
      this.cache.set(origin, networkFallback);
      return networkFallback;
    }
  }

  /**
   * Checks whether the given full URL is allowed by robots.txt.
   */
  async isAllowed(urlStr: string, userAgent = "*"): Promise<boolean> {
    try {
      const url = new URL(urlStr);
      const origin = url.origin;
      const path = url.pathname + url.search;
      const rules = await this.getRulesForOrigin(origin, userAgent);
      return isPathAllowed(path, rules);
    } catch {
      return false;
    }
  }

  /**
   * Retrieves crawl-delay in milliseconds for a domain.
   */
  async getCrawlDelay(origin: string): Promise<number> {
    const rules = await this.getRulesForOrigin(origin);
    return rules.crawlDelayMs;
  }
}

export const defaultRobotsManager = new RobotsManager();
