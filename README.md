# Digital Companion for Field Drug Testing (SIH26231)

Mobile-first PWA (Next.js 16, React 19, Tailwind v4) that photographs a colorimetric spot test next to a reference card, classifies the color, and stores a tamper-evident record. UI follows Digital India UX4G / GIGW 3.0.

## IMPORTANT: prototype only, not a forensic instrument
- Output is a **screening aid**, not evidence of a controlled substance. Presumptive color tests are non-specific; many substances give the same color. Confirmation requires lab analysis (GC-MS / FTIR).
- Reference colors in `src/lib/color_library.json` come from a published spot-test table, not from measurements of the actual reagents/kits/camera used. Thresholds (`TOLERANCE_POS/NEG` in `src/lib/engine.ts`) are unvalidated.
- The classifier returns positive/negative/inconclusive per **reagent**, not an identified drug.
- No accuracy study (sensitivity/specificity, false-positive rate) has been done.

## Supported kit formats
- **Reagent spot tests** (Marquis, Cobalt Thiocyanate, Wagner, ...): colour of the reagent drop vs reference colours. Best with a white reference card in frame; a reference-free mode estimates lighting from the white plate/paper and is capped at "estimated" confidence.
- **Lateral-flow test cups / strips**: reads control (C) and test (T) lines per panel. C+T = negative, C only = positive, no C = invalid; line darkness is ignored. Hold the cup with the C end at the top.
- Not yet supported: NIK-style sealed ampoule pouches (multi-stage colour sequences read within ~60 s).

## How it works
1. Capture: photo with a gray/white reference patch (20% region) and test spot (65% region), sampled on a hidden canvas.
2. Calibration: per-channel white balance against the reference patch.
3. Classification: CIEDE2000 distance to positive/negative reference colors for the selected reagent.
4. Integrity: SHA-256 of the image; GPS and timestamps stored with the record.
5. Sync: `POST /api/v1/tests/sync` writes to Postgres via Prisma.
6. Threat alerts: `npm run scrape` (openFDA etc., robots.txt + rate-limit aware) writes `data/threat_alerts.json`.

## Setup
1. `npm install`
2. Set `DATABASE_URL` and `DIRECT_URL` (Postgres/Supabase) in `.env`
3. `npx prisma db push`
4. `npm run dev`
5. `npm test`
