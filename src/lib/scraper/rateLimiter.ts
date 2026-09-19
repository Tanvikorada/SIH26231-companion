/**
 * Domain-Level Adaptive Rate Limiter.
 * Enforces per-origin delays (default >= 1500ms), respects robots.txt crawl-delays,
 * and adds random jitter to prevent synchronized request spikes.
 */

const DEFAULT_MIN_DELAY_MS = 1500;
const DEFAULT_JITTER_MIN_MS = 100;
const DEFAULT_JITTER_MAX_MS = 300;

export class DomainRateLimiter {
  private lastRequestMap = new Map<string, number>();

  /**
   * Resets all tracked timestamps (primarily for unit tests).
   */
  reset(): void {
    this.lastRequestMap.clear();
  }

  /**
   * Throttles execution until at least minDelayMs (+ optional jitter) has elapsed
   * since the last request to the specified origin.
   *
   * @param origin URL origin (e.g. "https://api.fda.gov")
   * @param minDelayMs Minimum time between requests to this origin
   * @param jitterRange Optional [min, max] ms of randomized jitter (default [100, 300])
   * @returns The number of milliseconds waited (0 if no throttle was needed)
   */
  async throttle(
    origin: string,
    minDelayMs: number = DEFAULT_MIN_DELAY_MS,
    jitterRange: [number, number] = [DEFAULT_JITTER_MIN_MS, DEFAULT_JITTER_MAX_MS]
  ): Promise<number> {
    const now = Date.now();
    const lastRequest = this.lastRequestMap.get(origin) || 0;
    const elapsed = now - lastRequest;

    let waitTime = 0;
    if (elapsed < minDelayMs) {
      const baseWait = minDelayMs - elapsed;
      const [jitterMin, jitterMax] = jitterRange;
      const jitter = jitterMax > jitterMin
        ? Math.floor(Math.random() * (jitterMax - jitterMin + 1)) + jitterMin
        : 0;
      waitTime = baseWait + jitter;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestMap.set(origin, Date.now());
    return waitTime;
  }

  /**
   * Retrieves the timestamp of the last request to the specified origin.
   */
  getLastRequestTime(origin: string): number {
    return this.lastRequestMap.get(origin) || 0;
  }
}

export const defaultRateLimiter = new DomainRateLimiter();
