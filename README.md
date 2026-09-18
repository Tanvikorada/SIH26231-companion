# Digital Companion for Field Drug Testing (SIH26231)

This project is a mobile-first Progressive Web Application (PWA) designed as a digital companion for field drug testing, based on the **SatyaLabel Architecture Pattern** (zero-cost stack, pure standalone-testable classification engine).

## Target Kit
**Custom Mock Test Array**
The colorimetric classifier engine (`src/lib/engine.ts`) is currently modeled around the provided mock test image datasets:
- **Positive:** Green (RGB: 59, 125, 59)
- **Negative:** Orange (RGB: 217, 164, 65)
- **Inconclusive:** Yellow-Green (RGB: 143, 165, 92)

**DISCLAIMER**: This is a demonstrative prototype. The exact color distance thresholds and reference values configured in the classification engine would require rigorous validation and calibration against the real physical kit's manufacturer data before production use.

## Features
1. **Calibration**: Photographs are captured alongside a fixed reference card. The engine calculates the lighting divergence from the gray reference patch and calibrates the test strip color before classification.
2. **Pure Classification**: Standalone color comparison with high/estimated/low confidence ratings.
3. **Tamper-Evident Records**: An SHA-256 hash of the captured image is computed server-side to guarantee integrity. Geolocation and timestamp mismatches are tracked.
4. **Offline-ready PWA**: Installable on mobile devices via Next-PWA.

## Tech Stack
- Next.js (App Router, Turbopack)
- Tailwind CSS v4
- Prisma (SQLite local datastore for prototype)
- Sharp (Server-side image pixel extraction)
- Vitest (Engine unit testing)

## Setup
1. `npm install`
2. `npx prisma db push`
3. `npm run dev`
