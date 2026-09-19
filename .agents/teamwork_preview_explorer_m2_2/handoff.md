# Handoff Report — Explorer M2-2 (Stats API Mapping & Data Flow)

**Role**: Stats API Mapping & Data Flow Explorer  
**Milestone**: Milestone 2 — Dashboard & Portal Layout Redesign  
**Date**: 2026-09-19  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

Direct code observations from inspecting the codebase:

1. **Backend Route Handler** (`src/app/api/v1/dashboard/stats/route.ts`, lines 1-18):
   - Line 5: `const total = await prisma.test.count();`
   - Line 7: `const positive = await prisma.test.count({ where: { result: "positive" } });`
   - Line 8: `const negative = await prisma.test.count({ where: { result: "negative" } });`
   - Line 9: `const inconclusive = await prisma.test.count({ where: { result: "inconclusive" } });`
   - Line 10: `const failed_calibration = await prisma.test.count({ where: { calibration_status: "failed_no_reference_card" } });`
   - Lines 12-16:
     ```typescript
     return NextResponse.json({
       total_tests: total,
       by_result: { positive, negative, inconclusive },
       failed_calibration_count: failed_calibration,
     });
     ```
   - The returned JSON shape is strictly:
     `{ total_tests: number, by_result: { positive: number, negative: number, inconclusive: number }, failed_calibration_count: number }`.
   - Invariant: `src/app/api/v1/**` is defined as a **STRICT NON-TOUCH FILE** in `PROJECT.md` line 70.

2. **Frontend Consumer** (`src/app/dashboard/page.tsx`, lines 8-13, 98-116):
   - Line 9:
     ```typescript
     const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, inconclusive: 0 });
     ```
   - Line 11-13:
     ```typescript
     useEffect(() => {
       fetch("/api/v1/dashboard/stats").then(r => r.json()).then(setStats).catch(() => {});
     }, []);
     ```
   - Lines 98-116:
     - Line 100: `<div className="text-3xl font-black text-slate-900">{stats.total}</div>`
     - Line 106: `<div className="text-3xl font-black text-rose-700">{stats.positive}</div>`
     - Line 110: `<div className="text-3xl font-black text-emerald-700">{stats.negative}</div>`
     - Line 114: `<div className="text-3xl font-black text-slate-700">{stats.inconclusive}</div>`
   - Observation: When `setStats` executes with the backend payload, `stats` is assigned an object with keys `total_tests`, `by_result`, and `failed_calibration_count`. None of `total`, `positive`, `negative`, or `inconclusive` exist on the newly assigned object.
   - Result in React: `stats.total`, `stats.positive`, `stats.negative`, and `stats.inconclusive` evaluate to `undefined`, causing empty string rendering in the UI.

3. **Failed Calibration Metric**:
   - The backend route explicitly calculates `failed_calibration_count` (line 10), but `src/app/dashboard/page.tsx` never binds or renders it.

4. **Error Handling & State**:
   - `src/app/dashboard/page.tsx` line 12 has `.catch(() => {})`. If an HTTP error (e.g. 500) occurs or network fails, no error banner, status code check (`r.ok`), or operator alert is provided.
   - There is no `isLoading` state, skeleton, or manual refresh trigger.

5. **Prisma Test Model** (`prisma/schema.prisma`, lines 11-24):
   - Contains fields: `id`, `operator_id`, `image_path`, `image_hash`, `gps_lat`, `gps_lng`, `captured_at`, `recorded_at`, `result`, `confidence`, `calibration_status`, `notes`.
   - Seed data in `prisma/seed.js` confirms `result` values are `"positive"`, `"negative"`, `"inconclusive"` and `calibration_status` is `"calibrated"` or `"failed_no_reference_card"`.

---

## 2. Logic Chain

1. **Premise**: Per `PROJECT.md`, `src/app/api/v1/**` is non-touchable, establishing `{ total_tests, by_result: { positive, negative, inconclusive }, failed_calibration_count }` as an immutable backend contract.
2. **Deduction 1 (Direct Mismatch)**: Because the dashboard sets state directly via `setStats(apiJson)` without property mapping, reading `stats.total` or `stats.positive` attempts to access missing properties on the object, resulting in `undefined`.
3. **Deduction 2 (Forensic Quality Loss)**: Under Section 65B of the Indian Evidence Act and standard NCB operating procedures, samples with `failed_no_reference_card` are inadmissible. Discarding `failed_calibration_count` deprives operators of awareness regarding calibration anomalies.
4. **Deduction 3 (State Resilience)**: In client-side data fetching, network drops or cold starts without `res.ok` checks can load error JSON into state. A defensive normalizer function (`normalizeDashboardStats`) that provides default fallback numbers and guards against NaN or division-by-zero is required.
5. **Deduction 4 (Operational Ergonomics)**: In a field environment where officers capture new tests via `/capture`, the dashboard requires a refresh mechanism (e.g., `refreshData()`, cache-busting `cache: "no-store"`, and timestamp display) so officers do not have to do full browser reloads.

---

## 3. Caveats

1. **Database Connectivity**: When running locally without a live PostgreSQL instance, `prisma.test.count()` will fail unless a mock or seeded database is available. The normalization logic explicitly accounts for this by falling back to `DEFAULT_DASHBOARD_STATS` with all zeros and a user-friendly error notice.
2. **Server-Side Rendering (SSR) vs Client Component**: `src/app/dashboard/page.tsx` is designated `"use client"` because of real-time telemetry, filter interactions, and navigation. If future requirements shift the initial load to SSR, the same `normalizeDashboardStats` function can be used server-side.
3. **Write Permission**: In accordance with Explorer constraints, no code changes were made to source files (`src/app/dashboard/page.tsx` or `src/app/api/v1/**`). All implementation artifacts and proposals are encapsulated in `m2_data_flow_plan.md`.

---

## 4. Conclusion

1. The data flow failure in `src/app/dashboard/page.tsx` is completely understood and mapped.
2. An exact TypeScript contract (`DashboardStatsApiResponse`, `DashboardStatsData`, `RecentScanRecord`) has been specified.
3. A complete data-normalization utility (`normalizeDashboardStats`) has been authored to handle extraction, rate calculations (positivity %, clearance %, retest %, QC integrity %), and edge-case fallbacks.
4. Production-grade React hook and JSX code snippets adhering to Digital India UX4G, GIGW 3.0, and `StampBadge` components have been delivered in `m2_data_flow_plan.md` for immediate drop-in integration by Worker M2.

---

## 5. Verification Method

To independently verify these findings and the proposed solution:

1. **Inspect Route Handler**:
   - Run `view_file` on `src/app/api/v1/dashboard/stats/route.ts` and verify lines 12-16 return `{ total_tests, by_result: { positive, negative, inconclusive }, failed_calibration_count }`.
2. **Inspect Legacy Dashboard Page**:
   - Run `view_file` on `src/app/dashboard/page.tsx` and verify lines 9-13 and lines 100-114 attempt to read `stats.total`, `stats.positive`, `stats.negative`, `stats.inconclusive`.
3. **Verify Plan Deliverable**:
   - Inspect `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_m2_2\m2_data_flow_plan.md` for complete data types, normalization logic, and drop-in code snippets.
4. **Post-Implementation Typecheck & Build**:
   - Once Worker M2 integrates the code, execute:
     `npx tsc --noEmit`
     `npm run build`
   - Verify zero TypeScript or build errors.
