# Handoff Report — Forensic Logic & Boundary Explorer

**Agent:** Forensic Logic & Boundary Explorer (`teamwork_preview_explorer_survey_3`)  
**Parent Agent:** `teamwork_preview_orchestrator_1` (Conversation ID: `98b88647-4057-44af-9fbf-1b891c753430`)  
**Timestamp:** 2026-09-19T16:32:00Z  
**Handoff Type:** Hard (Task complete)  

---

## 1. Observation

Direct observations from the codebase investigation:

1. **CIEDE2000 Color Difference Math:**
   - File: `src/lib/engine.ts`
   - Lines 3–16: `export function rgb2lab(rgb: number[])` performs sRGB gamma de-companding, matrix multiplication to CIE XYZ (Observer 2°, Illuminant D65, normalized by 95.047, 100.0, 108.883), and conversion to CIELAB $[L^*, a^*, b^*]$.
   - Lines 20–43: `export function deltaE00(lab1: number[], lab2: number[])` implements the complete standard CIEDE2000 color difference formula including chroma $C_{1,2}$, $G$-factor adjustment of $a$-axis, mean hue $\bar{H}'$ with angular wrap-around logic, $T$ weighting polynomial, $S_L, S_C, S_H$ compensation functions, and $R_T$ ellipse rotation.
   - Lines 45–57: `export function calibrateColor(rawSpot: number[], rawWhite: number[])` scales raw RGB using white card luminance reference ($TARGET\_WHITE = [255, 255, 255]$) with a darkness cutoff at $\text{lumaWhite} < 50$.
   - Lines 59–93: `export function classifySpotTest(testRGB: number[], reagent: string)` filters `src/lib/color_library.json`, evaluates $\Delta E_{00}$ against both positive and negative profiles with $TOLERANCE = 8.0$ and a $12.0$ negative override bias.

2. **SHA-256 Hashing Logic:**
   - File: `src/lib/engine.ts`
   - Lines 95–99:
     ```ts
     export async function generateSHA256(buffer: ArrayBuffer) {
       const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
       const hashArray = Array.from(new Uint8Array(hashBuffer));
       return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
     }
     ```
   - Invocation: `src/app/capture/page.tsx` line 77–78:
     ```ts
     const arrayBuffer = await imageFile.arrayBuffer();
     const image_hash = await generateSHA256(arrayBuffer);
     ```

3. **Hidden Canvas Pixel Extraction:**
   - File: `src/app/capture/page.tsx`
   - Line 20: `const canvasRef = useRef<HTMLCanvasElement>(null);`
   - Line 159: `<canvas ref={canvasRef} style={{ display: "none" }} />`
   - Lines 46–53: `extractColor(ctx, x, y)` extracts a $10 \times 10$ pixel bounding box via `ctx.getImageData(x - 5, y - 5, 10, 10)` and averages RGB values.
   - Lines 65–70: Geometric extraction coordinates:
     - Reference white patch: $x = \lfloor \text{width} \times 0.20 \rfloor, y = \lfloor \text{height} \times 0.50 \rfloor$
     - Reactive test spot: $x = \lfloor \text{width} \times 0.65 \rfloor, y = \lfloor \text{height} \times 0.50 \rfloor$
   - Line 79: Compressed snapshot generation: `const base64Image = canvas.toDataURL("image/jpeg", 0.5);`

4. **Prisma Database Connections & APIs:**
   - File: `src/lib/prisma.ts` creates singleton `new PrismaClient({ log: ["query"] })` on `globalThis`.
   - File: `prisma/schema.prisma` configures PostgreSQL provider with `DATABASE_URL` and `DIRECT_URL` and defines model `Test` with fields `id`, `operator_id`, `image_path`, `image_hash`, `gps_lat`, `gps_lng`, `captured_at`, `recorded_at`, `result`, `confidence`, `calibration_status`, `notes`.
   - API routes:
     - `src/app/api/v1/tests/sync/route.ts` [POST]: Writes new test record via `prisma.test.create`.
     - `src/app/api/v1/tests/route.ts` [GET]: Returns `{ data: tests }` with limit.
     - `src/app/api/v1/tests/[id]/route.ts` [GET]: Returns single test record by UUID.
     - `src/app/api/v1/dashboard/stats/route.ts` [GET]: Returns `{ total_tests, by_result: { positive, negative, inconclusive }, failed_calibration_count }`.
   - Server Component Direct Query: `src/app/logs/[id]/page.tsx` lines 8–9 performs direct query `await prisma.test.findUnique({ where: { id } })`.

5. **Build & Script Test Verification:**
   - Command: `npm run build` executed successfully with 0 errors (11/11 pages statically/dynamically generated).
   - Command: `node test_engine_locally.js` executed successfully with exit code 0, confirming positive and negative classification on test images.
   - Command: `node test_fixed_reagent.js` executed with exit code 0, validating Cobalt (POSITIVE, dE: 0.00), Marquis (POSITIVE, dE: 0.00), and Marquis (NEGATIVE, dE: 0.00).

---

## 2. Logic Chain

1. **Requirement R3 Constraint:** The prompt specifies: *"Do NOT alter the underlying forensic CIEDE2000 math, the SHA-256 hashing logic, the hidden canvas pixel extraction, or the Prisma database connections. Only the visual presentation layers (Tailwind classes, layouts, component structures) in `src/app/` should be rewritten."*
2. **From Observation 1 & 2:** The CIEDE2000 math and SHA-256 hashing functions reside in `src/lib/engine.ts` and depend on `src/lib/color_library.json`. Neither of these files is inside `src/app/`. Therefore, `src/lib/engine.ts` and `src/lib/color_library.json` must be marked as **STRICTLY PROHIBITED FROM MODIFICATION**.
3. **From Observation 3:** The hidden canvas extraction logic resides inside `src/app/capture/page.tsx`. Because `src/app/capture/page.tsx` must be visually refactored from glassmorphic to UX4G/GIGW 3.0, the Worker agent modifying this file will be editing the same file where hidden canvas pixel extraction and state machine transitions reside.
4. **Boundary Derivation for `src/app/capture/page.tsx`:** To prevent breaking the pixel extraction engine, Worker agents must maintain the exact DOM presence of `<canvas ref={canvasRef} style={{ display: "none" }} />`, the hidden file input `<input ref={fileInputRef} ... className="hidden" />`, the state machine sequence (`EXTRACTING` -> `MATH` -> `HASHING` -> `SYNCING` -> `SUCCESS`), and the exact coordinate sampling ratios (20% and 65% width at 50% height).
5. **From Observation 4:** The Prisma client singleton (`src/lib/prisma.ts`), schema (`prisma/schema.prisma`), and backend routes (`src/app/api/v1/**`) handle persistence and aggregation. To comply with R3, Worker agents must not touch these backend files.
6. **From Observation 4 (`Dashboard` stats shape):** `src/app/api/v1/dashboard/stats` returns `{ total_tests, by_result: { positive, negative, inconclusive } }`, whereas `src/app/dashboard/page.tsx` previously expected flat keys. Worker agents rewriting `dashboard/page.tsx` must be provided with the exact response contract to safely map these fields without modifying the API route.

---

## 3. Caveats

- **Webcam Hardware Access:** Field testing can utilize either file upload or direct environment camera access via the standard HTML5 `capture="environment"` attribute on the hidden `<input type="file">`. The application currently relies on this standard HTML5 attribute rather than a live `<video>` stream.
- **Node vs. Browser Crypto:** `src/lib/engine.ts` utilizes `crypto.subtle` (Web Cryptography API). This runs in modern browser contexts and Node 18+ global contexts, but will error if executed in older Node environments lacking global `crypto`.

---

## 4. Conclusion

The non-touch boundaries for Requirement R3 are clearly demarcated:
1. **Forbidden Files (Do Not Touch):**
   - `src/lib/engine.ts`
   - `src/lib/color_library.json`
   - `src/lib/prisma.ts`
   - `prisma/schema.prisma`
   - `src/app/api/v1/**`
2. **Safe-to-Refactor Files (UI Presentation Only):**
   - `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/capture/page.tsx` (preserving canvas & handlers), `src/app/ledger/page.tsx`, `src/app/result/[id]/page.tsx`, `src/app/logs/page.tsx`, `src/app/logs/[id]/page.tsx`, `src/components/ui/StampBadge.tsx`, `src/app/globals.css`.
3. **Capture Contract:** Any UI rewrite of `src/app/capture/page.tsx` must preserve `<canvas ref={canvasRef} style={{ display: "none" }} />`, the file input ref, and the complete `handleSubmit` async execution flow.
4. **Detailed Reference:** All exact mathematical formulas, coordinates, API shapes, and UI contract tables are documented in `survey_core_logic_boundaries.md`.

---

## 5. Verification Method

To independently verify the integrity of the core logic and boundaries:
1. **Build Validation:** Run `npm run build` in the project root. Must compile cleanly with 0 TypeScript and Tailwind errors.
2. **Engine Math Verification:** Run `node test_engine_locally.js` and `node test_fixed_reagent.js`. Both must return exit code 0 and valid positive/negative classifications.
3. **Inspection of Capture Page:** Verify that `<canvas ref={canvasRef} style={{ display: "none" }} />` remains in the JSX tree of `src/app/capture/page.tsx`.
4. **Boundary Invalidation Condition:** If any modification is made to `src/lib/engine.ts`, `src/lib/prisma.ts`, or `prisma/schema.prisma`, or if the canvas element is omitted from `src/app/capture/page.tsx`, the boundary contract is violated.
