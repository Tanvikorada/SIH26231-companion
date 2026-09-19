# Dispatch: Remediation Worker — Dashboard UI & Route Synchronization

**Role**: teamwork_preview_worker
**Working Directory**: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_remediation

## Mandatory Documents
1. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_victory_auditor_1\handoff.md`
2. `tests/m3_alerts_dashboard.test.tsx`
3. `tests/e2e_verify.mjs`

## Mission
Fix the 3 specific discrepancies identified by the Victory Auditor so that all 87 tests in `npm run test`, all tests in `node tests/e2e_verify.mjs`, and `npm run build` pass 100%:

1. `src/app/api/v1/alerts/route.ts`:
   - Return cache headers containing `'no-cache'` and `'no-store'`:
     `headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }`
   - Ensure returned JSON payload matches `ThreatAlertsPayload`:
     `{ success: true, source: 'live_cache', count: alerts.length, alerts: alerts.alerts ?? alerts }`
   - In `catch`, read and return `src/data/threat_alerts_fallback.json` with `{ success: true, source: 'fallback', ... }`.

2. `src/app/dashboard/page.tsx`:
   - Render `<StateEmblem size={44} variant="navy" />` (renders text 'State Emblem of India' and Ashoka Chakra).
   - Render bilingual Live Alerts header containing `'राष्ट्रीय मादक पदार्थ चेतावनी प्रणाली'`.
   - Render 5 dense table columns matching `tests/m3_alerts_dashboard.test.tsx`:
     - `Advisory ID & Date (IST)`
     - `Threat Level` (with `<StampBadge size="sm" />`)
     - `Substance & Classification`
     - `Originating Agency & Region`
     - `Advisory Summary & Reagent Marker`
   - Render filter buttons: `ALL`, `CRITICAL`, `HIGH`, `ELEVATED`.
   - Render refresh button with text `Refresh Feed`.

3. `src/app/result/[id]/page.tsx`:
   - Ensure there is a back link button to `/ledger` (or router push to `/ledger`) that satisfies `tests/e2e_verify.mjs` check `[T3.1]`.

4. Run and verify:
   - `npm run test` (all 6 test files, 87/87 tests must pass).
   - `npm run scrape` (must exit 0).
   - `node tests/e2e_verify.mjs` (all tiers pass).
   - `npm run build` (must compile cleanly).
5. Write results to `handoff.md` and report to parent.

## 2026-09-19T18:33:16Z
You are Remediation Worker for fixing dashboard UI, API route, and navigation continuity.
Working Directory: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_remediation

Read your dispatch assignment in: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_remediation\DISPATCH.md
Read the Victory Auditor report in: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_victory_auditor_1\handoff.md
Read tests/m3_alerts_dashboard.test.tsx to see the exact assertions.

Tasks:
1. Update `src/app/api/v1/alerts/route.ts`:
   - Set `'Cache-Control': 'no-cache, no-store, must-revalidate'`.
   - Return `{ success: true, source: 'live_cache', count: alerts.length, alerts: alerts.alerts ?? alerts }`.
   - Return fallback from `src/data/threat_alerts_fallback.json` with `{ success: true, source: 'fallback', ... }`.
2. Update `src/app/dashboard/page.tsx`:
   - Render `<StateEmblem size={44} variant="navy" />`.
   - Render bilingual Live Alerts header containing `'राष्ट्रीय मादक पदार्थ चेतावनी प्रणाली'`.
   - Render 5 dense table columns matching `tests/m3_alerts_dashboard.test.tsx`:
     - 'Advisory ID & Date (IST)'
     - 'Threat Level'
     - 'Substance & Classification'
     - 'Originating Agency & Region'
     - 'Advisory Summary & Reagent Marker'
   - Render filter buttons: `ALL`, `CRITICAL`, `HIGH`, `ELEVATED`.
   - Render refresh button with text `Refresh Feed`.
3. Update `src/app/result/[id]/page.tsx` to fix the back link to `/ledger` matching `tests/e2e_verify.mjs` Tier 3 `[T3.1]`.
4. Run `npm run test` (verify all 87 tests pass).
5. Run `node tests/e2e_verify.mjs` (verify all tests pass).
6. Run `npm run build` (verify clean build).
7. Write `handoff.md` and report back to parent.
