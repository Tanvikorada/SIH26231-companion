# Dispatch: Worker M3 — Live Alerts Dashboard UI & API Route Integration

**Role**: teamwork_preview_worker
**Working Directory**: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m3_ui

## Mandatory Documents to Read
1. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\ORIGINAL_REQUEST.md` (specifically timestamp ## 2026-09-19T17:32:33Z)
2. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_survey_2_3\handoff.md`
3. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m2_scraper\handoff.md`
4. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_orchestrator_2\PROJECT.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Tasks
1. Implement Next.js API Route Handler `src/app/api/v1/alerts/route.ts`:
   - `GET /api/v1/alerts`: dynamically reads `data/threat_alerts.json` (or `src/data/threat_alerts.json`) via `fs.promises.readFile`.
   - If the file is missing or invalid, gracefully return the pre-seeded fallback alerts payload from `src/data/threat_alerts_fallback.json` with HTTP 200.
   - Set appropriate cache headers (`Cache-Control: no-cache, no-store, must-revalidate`).
2. Update `src/app/dashboard/page.tsx`:
   - Add a dedicated, full-width "Live Alerts" tabular section (`col-span-1 lg:col-span-3`) conforming to GIGW 3.0 / UX4G.
   - Render 5 dense columns:
     1. Advisory ID & Date (IST)
     2. Threat Level (using `<StampBadge size="sm" variant={...} />`: CRITICAL -> danger, HIGH -> saffron, ELEVATED -> brass, ADVISORY -> navy)
     3. Substance & Classification (bold substance name, monospace classification tag)
     4. Originating Agency & Region (agency name with jurisdiction badge)
     5. Advisory Summary & Reagent Marker (summary text + reagent guidance note)
   - Include bilingual header ("राष्ट्रीय मादक पदार्थ चेतावनी प्रणाली / National Drug Threat Advisories & Early Warning System").
   - Include threat level filter controls (ALL, CRITICAL, HIGH, ELEVATED), search input matching substance/agency, and a "Refresh Feed" button.
   - Include graceful loading skeleton and empty state if no matching advisories.
   - Fix the existing telemetry stats mapping: read `data.total_tests ?? data.total ?? 0` and `data.by_result?.positive ?? 0` from `/api/v1/dashboard/stats`.
   - Replace the plain placeholder box on line 36 with `<StateEmblem size={44} variant="navy" />`.
3. Hygiene fix in `src/app/logs/page.tsx:20`:
   - Remove the residual `backdrop-blur-md` class from line 20 of `src/app/logs/page.tsx` so the GIGW 3.0 sanitization test (`T1.1` in `tests/e2e_verify.mjs`) passes 100%.
4. Verification:
   - Run `npm run test` (55 tests pass).
   - Run `npm run scrape` (outputs structured threat data).
   - Run `node tests/e2e_verify.mjs --tier=1` (all 9 checks pass 100%).
   - Run `npm run build` (Turbopack builds cleanly with zero errors).
5. Write complete results and verification logs to `handoff.md` in your working directory and notify parent.

## 2026-09-19T17:59:28Z
You are Worker M3 (Live Alerts Dashboard UI & API Route Integration).
Working Directory: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m3_ui

Read your dispatch assignment in: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m3_ui\DISPATCH.md
Read the authoritative user request in: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\ORIGINAL_REQUEST.md (timestamp ## 2026-09-19T17:32:33Z)
Read Explorer 3 handoff in: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_survey_2_3\handoff.md
Read Worker M2 handoff in: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m2_scraper\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks:
1. Implement `src/app/api/v1/alerts/route.ts` to dynamically serve threat alerts from `data/threat_alerts.json` (with fallback to `src/data/threat_alerts_fallback.json`).
2. Update `src/app/dashboard/page.tsx` with the dedicated, full-width 5-column "Live Alerts" tabular section using `<StampBadge size="sm" />`, search/filter controls, and refresh button.
3. Replace the plain emblem placeholder in `page.tsx` with `<StateEmblem size={44} variant="navy" />` and fix the telemetry stats mapping.
4. Remove residual `backdrop-blur-md` from `src/app/logs/page.tsx:20`.
5. Verify: `npm run test`, `npm run scrape`, `node tests/e2e_verify.mjs --tier=1`, and `npm run build`.
6. Write full results and verification logs to `handoff.md` and notify parent.
