# Test Infrastructure: Forensic Drug Testing Government UI Transformation

## Overview
This document specifies the architecture, execution model, and verification tiers for the automated, opaque-box End-to-End (E2E) test suite. The suite is designed to ensure strict compliance with the **Digital India UX4G design system**, **GIGW 3.0 (Guidelines for Indian Government Websites)**, the **Digital Brand Identity Manual (DBIM)** palette, and non-touch forensic core integrity.

---

## Test Architecture & Directory Structure

All test infrastructure is self-contained outside `src/app/` under the `tests/` directory:

```
tests/
├── e2e_verify.mjs              # Master test runner orchestrating all 4 tiers
├── helpers.mjs                 # Shared utilities: WCAG luminance math, Vite SSR module loader, CLI reporting
├── tier1_feature_coverage.mjs  # Tier 1: Aesthetics sanitization, DBIM palette, forensic math & hidden canvas
├── tier2_boundary_corner.mjs   # Tier 2: WCAG 2.1 AA contrast ratios, empty state records, CSS variable tokens
├── tier3_cross_feature.mjs     # Tier 3: Bidirectional navigation continuity & forensic sync API payload contract
└── tier4_workflows.mjs         # Tier 4: TypeScript static typechecking & Next.js production build
```

---

## Test Tiers & Authoritative Expected Outputs

### Tier 1: Feature Coverage (Sanitization, Branding, Forensic Math & Canvas)
| Test ID | Test Name | Target Scope | Authoritative Source | Expected Behavior |
|---------|-----------|--------------|----------------------|-------------------|
| **T1.1** | Zero `backdrop-blur` | All files in `src/` | `ORIGINAL_REQUEST.md` R1, `PROJECT.md` F3 | 0 occurrences of `backdrop-blur*` classes |
| **T1.2** | Zero `bg-gradient-to-*` | All files in `src/` | `ORIGINAL_REQUEST.md` R1, `PROJECT.md` F3 | 0 occurrences of pastel/decorative gradients |
| **T1.3** | Zero `framer-motion` spring animations | All files in `src/` | `ORIGINAL_REQUEST.md` R1, `PROJECT.md` F4 | 0 occurrences of `type: "spring"` bouncy animations |
| **T1.4** | Removal of noise SVG & dot grids | `src/app/layout.tsx` | `PROJECT.md` F2 | 0 references to `/noise.svg` or radial dot grids |
| **T1.5** | Official Government Branding | Shell & layout | `ORIGINAL_REQUEST.md` R1, `PROJECT.md` F2 | Presence of National Emblem (`सत्यमेव जयते`/Landmark) & Ministry header |
| **T1.6** | DBIM High-Contrast Palette | Design tokens & CSS | `ORIGINAL_REQUEST.md` R1, `PROJECT.md` F1 | Active presence of Navy (`#003366`), Saffron (`#FF9933`), Green (`#138808`) |
| **T1.7** | Traditional Dense Portal Layout | `src/app/dashboard/` | `ORIGINAL_REQUEST.md` R2, `PROJECT.md` F5 | Replacement of `rounded-3xl` bento cards with dense bordered/table layout |
| **T1.8** | Core Forensic Math Integrity | `src/lib/engine.ts` | `ORIGINAL_REQUEST.md` R3, `PROJECT.md` F7 | Exact numerical output for CIEDE2000 (`deltaE00`), calibration, and SHA-256 |
| **T1.9** | Hidden Canvas Sampling Invariant | `src/app/capture/` | `ORIGINAL_REQUEST.md` R3, `PROJECT.md` F7 | Hidden canvas retained in DOM; sampling at 20% ref white, 65% spot, 50% height |

### Tier 2: Boundary & Corner Cases (WCAG Contrast, Empty States, CSS Tokens)
| Test ID | Test Name | Target Scope | Authoritative Source | Expected Behavior |
|---------|-----------|--------------|----------------------|-------------------|
| **T2.1** | WCAG 2.1 AA Color Contrast | DBIM Palette | WCAG 2.1 Level AA Specification | Navy-on-White $\ge 4.5:1$, Green-on-White $\ge 4.5:1$, Red-on-White $\ge 4.5:1$ |
| **T2.2** | Empty & Missing Records Handling | UI Pages | `PROJECT.md` F5, F8 | Graceful empty state placeholders for empty ledger/logs and 404 null checks |
| **T2.3** | Calibration Zero/Boundary Inputs | `src/lib/engine.ts` | `src/lib/engine.ts` boundary spec | Zero/dark white luma (< 50) triggers safe raw fallback; channel clipping $\le 255$ |
| **T2.4** | CSS Variables Resolution | `src/app/globals.css` | `PROJECT.md` F1 | `--color-navy` (`#003366`) and `--color-brass` explicitly defined in CSS |

### Tier 3: Cross-Feature Combinations (Route Continuity & Forensic Sync Contract)
| Test ID | Test Name | Target Scope | Authoritative Source | Expected Behavior |
|---------|-----------|--------------|----------------------|-------------------|
| **T3.1** | Bidirectional Route Continuity | 7 Core App Routes | `PROJECT.md` Interface Contract 1 | All routes exist with verified forward/back navigation links |
| **T3.2** | Forensic Sync Schema Contract | Client & Server API | `PROJECT.md` Interface Contract 2 | Client payload and `/api/v1/tests/sync` match all 10 forensic schema fields |

### Tier 4: Real-World Workflows (Build & Typecheck)
| Test ID | Test Name | Target Scope | Authoritative Source | Expected Behavior |
|---------|-----------|--------------|----------------------|-------------------|
| **T4.1** | Static TypeScript Typecheck | Entire workspace | `ORIGINAL_REQUEST.md` Acceptance Criteria | `npx tsc --noEmit` exits with status code 0 |
| **T4.2** | Next.js Production Build | Entire workspace | `ORIGINAL_REQUEST.md` Acceptance Criteria | `npm run build` exits with status code 0 without Turbopack/Tailwind errors |

---

## How to Run the Tests

### 1. Run Complete E2E Suite
```bash
node tests/e2e_verify.mjs
```

### 2. Run Specific Tiers
```bash
# Run only Tier 1 (Feature Coverage)
node tests/e2e_verify.mjs --tier=1

# Run Tiers 2 and 3
node tests/e2e_verify.mjs --tier=2,3

# Run Tier 4 (Workflows: Typecheck & Build)
node tests/e2e_verify.mjs --tier=4
```

### 3. Machine-Readable JSON Output
```bash
node tests/e2e_verify.mjs --json
```

### 4. Fast-Fail (Bail) Mode
```bash
node tests/e2e_verify.mjs --bail
```

---

## Exit Code Contract
- `0`: All executed checks passed successfully (100% pass rate).
- `1`: One or more checks failed (defects detected).

This contract ensures integration into CI/CD pipelines and milestone completion gating.
