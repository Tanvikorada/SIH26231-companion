# Forensic Logic & Non-Touch Boundary Survey

**Investigation Timestamp:** 2026-09-19T16:30:00Z  
**Agent:** Explorer Subagent (Forensic Logic & Boundary Explorer)  
**Workspace:** `c:\Users\Thanvi\OneDrive\Desktop\drug testing`  
**Mandate:** Deep forensic analysis of core application logic, data pipelines, mathematical algorithms, and database operations to establish **STRICT NON-TOUCH BOUNDARIES** under Requirement R3 for Digital India UX4G / GIGW 3.0 UI refactoring.

---

## Executive Summary

The application is an optical drug-testing companion designed for field narcotics law enforcement (Narcotics Control Bureau - Ministry of Home Affairs, Government of India). It analyzes colorimetric spot tests and lateral flow assays from mobile/field imagery, computes color differences using the standard CIEDE2000 algorithm, cryptographically seals evidence using SHA-256 digests, and stores audit logs via Prisma in PostgreSQL.

**Requirement R3 Enforcement:**
> *"Do NOT alter the underlying forensic CIEDE2000 math, the SHA-256 hashing logic, the hidden canvas pixel extraction, or the Prisma database connections. Only the visual presentation layers (Tailwind classes, layouts, component structures) in `src/app/` should be rewritten."*

This survey maps every component of this core engine down to the exact line number, function signature, data structure, and UI interface contract.

---

## 1. CIEDE2000 Color Difference Math Architecture

### 1.1 Implementation Location
- **Primary Source File:** `src/lib/engine.ts` (100 lines)
- **Reference Library:** `src/lib/color_library.json` (464 lines, 30+ drug/reagent color profiles)
- **Local Validation Engine:** `test_engine_locally.js` and `test_fixed_reagent.js`

### 1.2 Function Breakdown & Line Numbers in `src/lib/engine.ts`

#### A. Color Space Transformation: `rgb2lab(rgb: number[]): number[]` (Lines 3–16)
- **Input:** Normalized RGB array `[r, g, b]` in range `[0, 255]`.
- **Transformation Steps:**
  1. **sRGB Gamma De-companding:**
     $$\text{channel} = \begin{cases} \left(\frac{\text{channel} + 0.055}{1.055}\right)^{2.4} & \text{if } \text{channel} > 0.04045 \\ \frac{\text{channel}}{12.92} & \text{otherwise} \end{cases}$$
  2. **Linear RGB to CIE XYZ (Observer 2°, Illuminant D65):**
     $$X = (0.4124 \cdot r + 0.3576 \cdot g + 0.1805 \cdot b) \times 100$$
     $$Y = (0.2126 \cdot r + 0.7152 \cdot g + 0.0722 \cdot b) \times 100$$
     $$Z = (0.0193 \cdot r + 0.1192 \cdot g + 0.9505 \cdot b) \times 100$$
  3. **Normalization by D65 Reference White:**
     $$X / 95.047,\quad Y / 100.000,\quad Z / 108.883$$
  4. **Cubic Root / Linear Spline:**
     $$f(t) = \begin{cases} t^{1/3} & \text{if } t > 0.008856 \\ 7.787 \cdot t + \frac{16}{116} & \text{otherwise} \end{cases}$$
  5. **CIELAB Calculation:**
     $$L^* = 116 \cdot f(Y) - 16,\quad a^* = 500 \cdot (f(X) - f(Y)),\quad b^* = 200 \cdot (f(Y) - f(Z))$$
- **Output:** Array `[L, a, b]`.

#### B. CIEDE2000 Metric Calculation: `deltaE00(lab1: number[], lab2: number[]): number` (Lines 20–43)
- **Standard:** Full analytical implementation of ISO/CIE 11664-6:2014 / CIE Technical Report 142-2001.
- **Parametric Factors:** $k_L = 1$, $k_C = 1$, $k_H = 1$.
- **Mathematical Steps:**
  1. Chroma: $C_1 = \sqrt{a_1^2 + b_1^2}$, $C_2 = \sqrt{a_2^2 + b_2^2}$, $\bar{C} = (C_1 + C_2)/2$.
  2. A-axis correction factor: $G = 0.5 \cdot \left(1 - \sqrt{\bar{C}^7 / (\bar{C}^7 + 25^7)}\right)$.
  3. Modified $a'$ coordinates: $a_i' = (1 + G) \cdot a_i$.
  4. Modified chroma $C_i'$ and hue angles $h_i' = \text{atan2}(b_i, a_i')$.
  5. Mean hue angle $\bar{H}'$ with $360^\circ$ angular wrap-around logic.
  6. Hue rotation weighting function $T$:
     $$T = 1 - 0.17\cos(\bar{H}' - 30^\circ) + 0.24\cos(2\bar{H}') + 0.32\cos(3\bar{H}' + 6^\circ) - 0.20\cos(4\bar{H}' - 63^\circ)$$
  7. Difference metrics $\Delta L'$, $\Delta C'$, $\Delta H' = 2\sqrt{C_1' C_2'} \sin(\Delta h' / 2)$.
  8. Weighting functions $S_L, S_C, S_H$, rotation term $R_T$, and ellipse calculation $R_C$.
  9. Returns Euclidean metric distance in CIEDE2000 space ($\Delta E_{00}$).

#### C. White Balance Calibration: `calibrateColor(rawSpot: number[], rawWhite: number[]): number[]` (Lines 45–57)
- Compares measured white card reference pixel against theoretical pure white `TARGET_WHITE = [255, 255, 255]`.
- Calculates white patch luminance:
  $$\text{lumaWhite} = 0.299 \cdot r_w + 0.587 \cdot g_w + 0.114 \cdot b_w$$
- **Safety Gate:** If $\text{lumaWhite} < 50$, the lighting is too dark or no reference card is detected; the function aborts scaling and returns `rawSpot` unadjusted.
- **Channel Scaling:** Computes $\text{scale}_c = 255 / \max(1, \text{rawWhite}_c)$ and scales each channel of `rawSpot`, clamping strictly to $[0, 255]$.

#### D. Drug Spot Test Classification: `classifySpotTest(testRGB: number[], reagent: string)` (Lines 59–93)
- Filters `color_library.json` for all records matching `r.reagent === reagent`.
- Converts calibrated RGB to CIELAB via `rgb2lab`.
- Compares `testLab` against both `profile.positive_rgb` and `profile.negative_rgb` via `deltaE00`.
- **Thresholds & Decision Logic:**
  - `TOLERANCE = 8.0` (strict tolerance to prevent device hue shifting false positives).
  - **Negative Override Bias:** If $d_{\text{Neg}} < \text{minDistance}$ and $d_{\text{Neg}} < 12.0$, it sets `bestMatch = "negative"` (avoids classifying muddy brown unreacted reagents as positives).
  - Positive match: If $d_{\text{Pos}} < \text{minDistance}$ and $d_{\text{Pos}} < \text{TOLERANCE}$, sets `bestMatch = "positive"`.
  - Inconclusive cutoff: If $\text{minDistance} > 12.0$, returns `{ result: "inconclusive", distance: minDistance }`.
  - Returns `{ result: bestMatch, distance: minDistance }`.

---

## 2. SHA-256 Hashing & Cryptographic Chain of Custody

### 2.1 Implementation Location
- **Function Definition:** `src/lib/engine.ts` (Lines 95–99)
- **Call Site:** `src/app/capture/page.tsx` (Lines 76–78)
- **Persistence:** `src/app/api/v1/tests/sync/route.ts` (Lines 8–20)
- **Presentation:**
  - `src/app/ledger/page.tsx` (Line 75)
  - `src/app/result/[id]/page.tsx` (Line 113)
  - `src/app/logs/page.tsx` (Line 53)
  - `src/app/logs/[id]/page.tsx` (Line 75)

### 2.2 Algorithm & Code
```ts
// src/lib/engine.ts (Lines 95-99)
export async function generateSHA256(buffer: ArrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
```

### 2.3 Cryptographic Lifecycle
1. **Binary Ingestion:** When the operator captures or uploads photographic evidence, `const arrayBuffer = await imageFile.arrayBuffer()` extracts raw binary bytes from the uncompressed `File` object.
2. **Digest Computation:** `crypto.subtle.digest("SHA-256", buffer)` executes natively in the browser Web Cryptography API sandbox, producing a 32-byte ArrayBuffer digest.
3. **Hex Formatting:** Converted into a standard 64-character lowercase hexadecimal hash string.
4. **Wire Transmission:** Dispatched in the JSON body of `POST /api/v1/tests/sync` as `image_hash`.
5. **Database Storage:** Stored in the `Test.image_hash` column in PostgreSQL.
6. **Evidentiary Verification:** Displayed on Form 4A Certificate of Analysis and Ledger table under Section 65B of the Indian Evidence Act to prove tamper-evident provenance.

---

## 3. Hidden Canvas Pixel Extraction Engine

### 3.1 Implementation Location
- **UI & DOM Structure:** `src/app/capture/page.tsx`
- **DOM Canvas Node:** Line 159: `<canvas ref={canvasRef} style={{ display: "none" }} />`
- **React Ref:** Line 20: `const canvasRef = useRef<HTMLCanvasElement>(null);`
- **Camera / File Input:** Line 156: `<input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />`

### 3.2 Pixel Extraction Algorithm: `extractColor` (Lines 46–53)
```ts
const extractColor = (ctx: CanvasRenderingContext2D, x: number, y: number): number[] => {
  const imageData = ctx.getImageData(x - 5, y - 5, 10, 10);
  const data = imageData.data;
  let r = 0, g = 0, b = 0;
  const count = data.length / 4;
  for (let i = 0; i < data.length; i += 4) { 
    r += data[i]; 
    g += data[i + 1]; 
    b += data[i + 2]; 
  }
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
};
```

### 3.3 Spatial Coordinate Sampling Geometry (Lines 63–71)
1. **Image Rendering:**
   ```ts
   const img = new Image();
   img.src = previewUrl;
   await new Promise((resolve) => (img.onload = resolve));
   canvas.width = img.width;
   canvas.height = img.height;
   const ctx = canvas.getContext("2d", { willReadFrequently: true });
   ctx.drawImage(img, 0, 0);
   ```
2. **Fixed Geometric Coordinates:**
   - **White Reference Calibration Patch:**
     $$x_{\text{white}} = \lfloor \text{width} \times 0.20 \rfloor,\quad y_{\text{white}} = \lfloor \text{height} \times 0.50 \rfloor$$
     *(20% from left, 50% from top — corresponding to the cassette's reference white strip)*.
   - **Chemical Reactive Test Well:**
     $$x_{\text{spot}} = \lfloor \text{width} \times 0.65 \rfloor,\quad y_{\text{spot}} = \lfloor \text{height} \times 0.50 \rfloor$$
     *(65% from left, 50% from top — corresponding to the cassette's reaction well)*.
3. **Noise Reduction Kernel:**
   A $10 \times 10$ pixel bounding box ($100$ total pixels) centered at $(x, y)$ is averaged to eliminate CMOS sensor noise, JPEG compression artifacts, and color fringing.
4. **Base64 Evidence Export:**
   ```ts
   const base64Image = canvas.toDataURL("image/jpeg", 0.5);
   ```
   Exports a compressed JPEG payload for database synchronization.

---

## 4. Prisma Database Connections, Schema, Models, and APIs

### 4.1 Prisma Client Singleton
- **File:** `src/lib/prisma.ts`
- **Implementation:**
  ```ts
  import { PrismaClient } from "@prisma/client";
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```
  Protects connection pool from saturation during Next.js hot-reloading.

### 4.2 Database Schema: `prisma/schema.prisma`
- **Provider:** `postgresql`
- **Connection Strings:** `env("DATABASE_URL")` and `env("DIRECT_URL")`
- **Model Definition:**
  ```prisma
  model Test {
    id                 String   @id @default(uuid())
    operator_id        String
    image_path         String   // Holds base64 JPEG data URL or asset path
    image_hash         String   // SHA-256 hex string (64 characters)
    gps_lat            Float?   // GPS Latitude (nullable)
    gps_lng            Float?   // GPS Longitude (nullable)
    captured_at        DateTime // Timestamp when photo taken
    recorded_at        DateTime @default(now()) // Timestamp recorded on server
    result             String   // "positive" | "negative" | "inconclusive"
    confidence         String   // "high" | "estimated" | "low"
    calibration_status String   // "calibrated" | "failed_no_reference_card"
    notes              String?  // Optional notes / Reagent label
  }
  ```

### 4.3 API Routes Catalog & Contracts

| Endpoint | Method | File Path | Request Input | Response Output | Database Operations |
|---|---|---|---|---|---|
| `/api/v1/tests/sync` | `POST` | `src/app/api/v1/tests/sync/route.ts` | JSON: `{ operator_id, reagent, notes, gps_lat, gps_lng, captured_at, image_hash, base64Image, result, confidence }` | Status 201: `{ success: true, id: string }`<br>Status 500: `{ error: string }` | `prisma.test.create(...)` |
| `/api/v1/tests` | `GET` | `src/app/api/v1/tests/route.ts` | Query: `?limit=N` (default 10) | Status 200: `{ data: Test[] }`<br>Status 500: `{ error: string }` | `prisma.test.findMany({ orderBy: { captured_at: 'desc' }, take: limit })` |
| `/api/v1/tests/[id]` | `GET` | `src/app/api/v1/tests/[id]/route.ts` | URL param: `id` | Status 200: `Test` (raw object)<br>Status 404: `{ error: "Not found" }` | `prisma.test.findUnique({ where: { id } })` |
| `/api/v1/dashboard/stats` | `GET` | `src/app/api/v1/dashboard/stats/route.ts` | None | Status 200: `{ total_tests: number, by_result: { positive: number, negative: number, inconclusive: number }, failed_calibration_count: number }` | 5 aggregate `count()` queries on `prisma.test` |

### 4.4 Direct Database Access in Server Components
- `src/app/logs/[id]/page.tsx` (Lines 8–9):
  ```ts
  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id } });
  ```
  Direct server-side read query rendering the detailed dossier.

---

## 5. End-to-End Scanning Workflow Trace

```
[Operator Action]
      │
      ▼
1. File Selection / Camera (`handleCapture`)
   ├─ Stores `imageFile` (File binary)
   ├─ Sets `previewUrl = URL.createObjectURL(file)`
   └─ Optional: `fetchGPS()` triggers `navigator.geolocation.getCurrentPosition`
      │
      ▼
2. Submit Trigger (`handleSubmit`)
      │
      ▼
3. Phase: EXTRACTING (500ms transition)
   ├─ Mounts `new Image()` with `previewUrl`
   ├─ Awaits `img.onload`
   ├─ Configures `<canvas ref={canvasRef}>`: width = img.width, height = img.height
   ├─ `ctx.drawImage(img, 0, 0)`
   ├─ `extractColor(ctx, 0.20 * width, 0.50 * height)` -> `rawWhite` RGB
   └─ `extractColor(ctx, 0.65 * width, 0.50 * height)` -> `rawSpot` RGB
      │
      ▼
4. Phase: MATH (700ms transition)
   ├─ `calibrateColor(rawSpot, rawWhite)` -> `finalColor` RGB
   └─ `classifySpotTest(finalColor, reagent)` -> `{ result, distance }`
      │
      ▼
5. Phase: HASHING (600ms transition)
   ├─ `arrayBuffer = await imageFile.arrayBuffer()`
   ├─ `image_hash = await generateSHA256(arrayBuffer)` (SHA-256 hex)
   └─ `base64Image = canvas.toDataURL("image/jpeg", 0.5)`
      │
      ▼
6. Phase: SYNCING
   ├─ `POST /api/v1/tests/sync` with payload:
   │   { operator_id, reagent, notes, gps_lat, gps_lng, captured_at, image_hash, base64Image, result, confidence }
   └─ PostgreSQL `prisma.test.create()` returns `{ success: true, id }`
      │
      ▼
7. Phase: SUCCESS (400ms transition)
   └─ `router.push("/result/" + id)` -> Renders Form 4A Certificate of Analysis
```

---

## 6. Strict Non-Touch Boundaries & Contracts for Worker Agents

To maintain 100% functional integrity while refactoring to UX4G and GIGW 3.0 government standards, Worker agents must adhere to the following boundary matrix:

### 6.1 Forbidden Files (DO NOT TOUCH)

| File Path | Component | Rationale |
|---|---|---|
| `src/lib/engine.ts` | Forensic Engine | CIEDE2000 math (`rgb2lab`, `deltaE00`), calibration, and SHA-256 logic |
| `src/lib/color_library.json` | Chemical Spectral DB | Empirical calibration baselines for reagents |
| `src/lib/prisma.ts` | Prisma Client Singleton | Database connection pooling configuration |
| `prisma/schema.prisma` | DB Schema | Database structure and model definitions |
| `src/app/api/v1/**` | Backend REST Routes | Database transactions, sync endpoints, stats aggregations |

### 6.2 Safe-to-Refactor Files (UI Presentation Only)

| File Path | Scope of Permitted Changes |
|---|---|
| `src/app/layout.tsx` | UX4G government top navbar, national emblem headers, remove noise SVG/gradients |
| `src/app/page.tsx` | Login UI: National Informatics Centre styling, e-Pramaan authentication styling |
| `src/app/dashboard/page.tsx` | Replace Bento-box cards with dense official tabular/column data portals |
| `src/app/capture/page.tsx` | Visual UI redesign only (see section 6.3 for preserved elements) |
| `src/app/ledger/page.tsx` | Government tabular ledger styling, official pagination/filter headers |
| `src/app/result/[id]/page.tsx` | Form 4A Certificate of Analysis presentation, official seals and print styles |
| `src/app/logs/page.tsx` | Case logs listing table styling |
| `src/app/logs/[id]/page.tsx` | Detailed case dossier presentation |
| `src/components/ui/StampBadge.tsx` | Official stamp styling |
| `src/app/globals.css` | Color tokens, typography, print stylesheets |

### 6.3 State & Hook Contract for `CapturePage` (`src/app/capture/page.tsx`)
When rewriting `src/app/capture/page.tsx`, the Worker agent **MUST** retain:
1. **DOM Elements:**
   - `<canvas ref={canvasRef} style={{ display: "none" }} />` MUST remain in the DOM. Removing this will cause `handleSubmit` to crash on `canvas missing`.
   - Hidden `<input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />` must remain to support mobile camera triggering.
2. **State Variables:**
   - `imageFile: File | null`
   - `previewUrl: string | null`
   - `processingState: "IDLE" | "EXTRACTING" | "MATH" | "HASHING" | "SYNCING" | "SUCCESS"`
   - `location: { lat: number; lng: number } | null`
   - `reagent: string`
   - `notes: string`
3. **Execution Logic:**
   - The entire `handleSubmit` function and its step-by-step calls to `extractColor`, `calibrateColor`, `classifySpotTest`, `generateSHA256`, and `fetch("/api/v1/tests/sync")` must remain functionally identical.
4. **Reagent Dropdown Option Values:**
   Option values must strictly match the library keys:
   `"Auto-Detect (Lateral Flow)"`, `"Marquis"`, `"Ferric"`, `"Nitric"`, `"Wagner"`, `"Cobalt"`, `"Simon"`, `"Liebermann"`.

### 6.4 API Response Handling Contract for `Dashboard` (`src/app/dashboard/page.tsx`)
The stats endpoint `/api/v1/dashboard/stats` returns:
```json
{
  "total_tests": 7,
  "by_result": {
    "positive": 2,
    "negative": 4,
    "inconclusive": 1
  },
  "failed_calibration_count": 0
}
```
Worker agents rewriting the dashboard UI must safely map these fields:
```ts
const totalTests = stats.total_tests ?? stats.total ?? 0;
const positiveTests = stats.by_result?.positive ?? stats.positive ?? 0;
const negativeTests = stats.by_result?.negative ?? stats.negative ?? 0;
const inconclusiveTests = stats.by_result?.inconclusive ?? stats.inconclusive ?? 0;
```

---

## 7. Verification Checklist for Worker Agents

After completing visual refactoring, the following checks must pass:
1. `npm run build` compiles with zero TypeScript or Tailwind errors.
2. `node test_engine_locally.js` runs with exit code 0.
3. `node test_fixed_reagent.js` runs with exit code 0.
4. Hidden canvas `<canvas ref={canvasRef} style={{ display: "none" }} />` exists in `src/app/capture/page.tsx`.
5. SHA-256 hash continues to generate and save to `/api/v1/tests/sync`.
6. Form 4A Certificate page renders `/result/[id]` with intact hash and metadata.
