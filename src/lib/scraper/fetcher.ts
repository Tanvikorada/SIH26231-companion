/**
 * Safe Network Fetcher with RFC 9309 Robots Check, Rate Limiting,
 * AbortSignal Timeout, Polite Government User-Agent, and Transient 5xx Retry.
 */

import { defaultRobotsManager, RobotsManager } from "./robots.ts";
import { defaultRateLimiter, DomainRateLimiter } from "./rateLimiter.ts";

export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (NCB-Forensic-Monitor/1.0; +https://narcoticsindia.nic.in)";

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  headers?: Record<string, string>;
  checkRobots?: boolean;
  robotsManager?: RobotsManager;
  rateLimiter?: DomainRateLimiter;
  userAgent?: string;
}

export class RobotsDisallowedError extends Error {
  constructor(url: string) {
    super(`Access to URL disallowed by robots.txt: ${url}`);
    this.name = "RobotsDisallowedError";
  }
}

/**
 * Executes an HTTP fetch with:
 * 1. Robots.txt permission check
 * 2. Origin-based adaptive rate limiting (with jitter)
 * 3. 8-second default AbortSignal timeout
 * 4. Polite browser + forensic monitor User-Agent
 * 5. Transient 5xx retry logic
 */
export async function safeFetch(
  urlStr: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 8000,
    maxRetries = 1,
    retryDelayMs = 2000,
    headers = {},
    checkRobots = true,
    robotsManager = defaultRobotsManager,
    rateLimiter = defaultRateLimiter,
    userAgent = DEFAULT_USER_AGENT,
  } = options;

  const url = new URL(urlStr);
  const origin = url.origin;

  // 1. Robots.txt Check
  if (checkRobots) {
    const allowed = await robotsManager.isAllowed(urlStr, userAgent);
    if (!allowed) {
      throw new RobotsDisallowedError(urlStr);
    }
  }

  // 2. Determine required delay from robots crawl-delay or default 1500ms
  const crawlDelay = await robotsManager.getCrawlDelay(origin);
  const minDelay = Math.max(1500, crawlDelay);

  // 3. Adaptive Rate Limiter Throttle
  await rateLimiter.throttle(origin, minDelay);

  const requestHeaders = {
    "User-Agent": userAgent,
    "Accept": "application/json, text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    ...headers,
  };

  let attempts = 0;
  while (attempts <= maxRetries) {
    attempts++;
    try {
      const response = await fetch(urlStr, {
        headers: requestHeaders,
        signal: AbortSignal.timeout(timeoutMs),
      });

      // Transient server errors (502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout)
      if ([502, 503, 504].includes(response.status) && attempts <= maxRetries) {
        console.warn(`[safeFetch] Transient HTTP ${response.status} from ${origin}. Retrying in ${retryDelayMs}ms (attempt ${attempts}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, retryDelayMs));
        continue;
      }

      return response;
    } catch (err: unknown) {
      const errName = err instanceof Error ? err.name : "";
      const errMessage = err instanceof Error ? err.message : String(err);
      const isAbort = errName === "TimeoutError" || errName === "AbortError";
      if (attempts <= maxRetries && !isAbort) {
        console.warn(`[safeFetch] Network error for ${origin}: ${errMessage}. Retrying in ${retryDelayMs}ms...`);
        await new Promise((r) => setTimeout(r, retryDelayMs));
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Exceeded maximum retries (${maxRetries}) fetching ${urlStr}`);
}

/**
 * Safely fetches and parses JSON. Returns null on non-200 or parse error without throwing.
 */
export async function safeFetchJson<T>(
  urlStr: string,
  options: SafeFetchOptions = {}
): Promise<T | null> {
  try {
    const res = await safeFetch(urlStr, options);
    if (!res.ok) {
      console.warn(`[safeFetchJson] HTTP ${res.status} from ${urlStr}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.warn(`[safeFetchJson] Error fetching ${urlStr}: ${errMessage}`);
    return null;
  }
}

/**
 * Safely fetches text content. Returns null on failure without throwing.
 */
export async function safeFetchText(
  urlStr: string,
  options: SafeFetchOptions = {}
): Promise<string | null> {
  try {
    const res = await safeFetch(urlStr, options);
    if (!res.ok) return null;
    return await res.text();
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.warn(`[safeFetchText] Error fetching ${urlStr}: ${errMessage}`);
    return null;
  }
}
