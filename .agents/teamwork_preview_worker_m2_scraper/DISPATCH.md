## 2026-09-19T17:50:47Z

# Dispatch: Worker M2 — Web Scraping Data Pipeline & Safe Infrastructure (R2 & R3)

**Role**: teamwork_preview_worker
**Working Directory**: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m2_scraper

## Mandatory Documents to Read
1. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\ORIGINAL_REQUEST.md` (specifically timestamp ## 2026-09-19T17:32:33Z)
2. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_survey_2_2\handoff.md`
3. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_orchestrator_2\PROJECT.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Tasks
1. Implement the modular scraper in `src/lib/scraper/`:
   - `types.ts`: Define `ThreatAlert`, `ThreatAlertsPayload`, and config interfaces.
   - `robots.ts`: Robust robots.txt parser and checker with 1-hour cache and RFC 9309 rules (allow/disallow precedence, 404 permissive fallback).
   - `rateLimiter.ts`: Domain-level rate limiter enforcing >= 1500ms delay + crawl-delay support + jitter.
   - `fetcher.ts`: Safe fetch wrapper with polite headers (`Mozilla/5.0... (NCB-Forensic-Monitor/1.0; ...)`), `AbortSignal.timeout(8000)`, and transient 5xx retry logic.
   - `sources/openfda.ts`: Live openFDA drug enforcement / recall query (`https://api.fda.gov/drug/enforcement.json?limit=5`).
   - `sources/syntheticThreats.ts`: Ingest/synthesize DEA/UNODC/NCB early warning advisories on novel synthetic opioids/NPS (nitazenes, bromazolam, xylazine).
   - `sources/reagentMatcher.ts`: Cross-reference substance names with `src/lib/color_library.json` to attach official colorimetric reagent reaction guidance.
   - `index.ts`: Master aggregator orchestrator pulling from sources with per-source error isolation and writing to `data/threat_alerts.json` and `src/data/threat_alerts.json`.
   - `scraper.test.ts`: Automated unit test suite verifying robots.txt, rate limiting, and output schema.
2. Create fallback data in `src/data/threat_alerts_fallback.json` to guarantee 100% crash immunity in air-gapped or network-down environments.
3. Create CLI script `scripts/scrape.ts`:
   - Calls the master scraper, logs progress, writes `data/threat_alerts.json` and `src/data/threat_alerts.json`, handles any global exception cleanly, and exits with code 0.
4. Update `package.json`:
   - Add `"scrape": "node --experimental-strip-types scripts/scrape.ts"` under `"scripts"`.
5. Run and verify:
   - Run `npm run scrape` and verify `data/threat_alerts.json` is generated with valid schema.
   - Run `npx vitest run src/lib/scraper/scraper.test.ts` to ensure scraper tests pass.
   - Run `npm run test` to ensure existing 37 tests continue to pass.
   - Run `npm run build` to ensure Next.js Turbopack compiles cleanly.
6. Write comprehensive handoff to `handoff.md` in your working directory and notify parent.
