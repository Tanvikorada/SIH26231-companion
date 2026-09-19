# Dispatch: Worker M1 — Core Accuracy Calibration & Test Suite

**Role**: teamwork_preview_worker
**Working Directory**: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m1_calib

## Mandatory Documents to Read
1. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\ORIGINAL_REQUEST.md` (specifically timestamp ## 2026-09-19T17:32:33Z)
2. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_survey_2_1\handoff.md`
3. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_orchestrator_2\PROJECT.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Tasks
1. Update `src/lib/engine.ts`:
   - Implement the mathematically calibrated `rgb2lab`, `deltaE00`, `calibrateColor`, `classifySpotTest`, and `generateSHA256` per the exact specifications and formulas in Survey Explorer 1's handoff.
   - CIE 142-2001 angle wrapping in `deltaE00` and zero guard when $C'_1 C'_2 = 0$.
   - Lower `calibrateColor` threshold to `lumaWhite < 20` to support dim and shadow captures while retaining zero-signal rejection.
   - Symmetric minimization in `classifySpotTest` across reagent profiles, setting $k_L = 1.5$ to decouple illumination fluctuations from chemical chroma/hue, with $\text{TOL\_POS} = 10.0$ and $\text{TOL\_NEG} = 14.0$.
2. Update `package.json`:
   - Add `"test": "vitest run -c tests/vitest.config.mjs"` to `"scripts"`.
3. Fix `src/lib/engine.test.ts`:
   - Update tests to use the modern signatures: `rgb2lab(number[])`, `deltaE00(number[], number[])`, `calibrateColor(number[], number[])`, and `classifySpotTest(number[], string)`.
4. Create `src/lib/color_matrix.test.ts`:
   - Implement the 660-sample synthetic mock color matrix test across 10 simulated lighting conditions (D65 daylight, 80% shadow, 60% shadow, 40% shadow, 3000K tungsten, 2700K golden hour, 7000K cool sky, fluorescent green tint, 105% bright light, and 35% dim light with sensor noise $\sigma=2$).
   - Programmatically assert that overall accuracy $\ge 95\%$.
5. Verification:
   - Run `npm run test` using `run_command` and ensure all test suites pass.
   - Run `node tests/e2e_verify.mjs --tier=1` to ensure all existing Tier 1 invariants remain 100% satisfied.
6. Write full results and verification logs to `handoff.md` in your working directory and notify parent.
