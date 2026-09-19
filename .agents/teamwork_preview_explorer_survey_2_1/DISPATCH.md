# Dispatch: Survey Explorer 1 — Core Accuracy Calibration

**Role**: teamwork_preview_explorer
**Mission**: Investigate R1 Core Accuracy Calibration in `src/lib/engine.ts` and test suite requirements.

## Objectives
1. Read `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\ORIGINAL_REQUEST.md` (specifically timestamp ## 2026-09-19T17:32:33Z).
2. Examine `src/lib/engine.ts` and `src/lib/color_library.json`.
3. Analyze current CIEDE2000 math, RGB to Lab conversion, white balance / calibration (`calibrateColor`), and reagent classification logic (`classifySpotTest`).
4. Identify why real-world lighting variance (shadows, underexposure, overexposure, chromatic shift) causes misclassification or accuracy drops.
5. Formulate recommendations for calibrating CIEDE2000 and color normalization:
   - Dynamic white point adaptation / chromatic adaptation (e.g., Bradford or von Kries, or improved reference patch normalization).
   - Luminance/illumination normalization to decouple lighting intensity (shadows/overexposure) from chromaticity.
   - Weighting factors in CIEDE2000 (kL, kC, kH) or threshold tuning.
6. Examine how tests are currently run (`package.json`, test scripts, Jest/Vitest/Node test runner).
7. Propose synthetic mock color generation strategy under simulated lighting conditions to verify >=95% accuracy.
8. Write comprehensive findings to `handoff.md` in your working directory.

## 2026-09-19T17:34:40Z
You are Survey Explorer 1 (Core Accuracy Calibration).
Your Working Directory: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_survey_2_1
Read your dispatch assignment in: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_survey_2_1\DISPATCH.md
Read the authoritative user request in: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\ORIGINAL_REQUEST.md (specifically timestamp ## 2026-09-19T17:32:33Z)

Investigate R1:
1. Examine `src/lib/engine.ts` and `src/lib/color_library.json`.
2. Inspect how RGB to Lab, CIEDE2000 math, reference white calibration (`calibrateColor`), and reagent classification (`classifySpotTest`) operate.
3. Determine how real-world lighting variance (shadows, underexposure, overexposure, color cast) degrades accuracy and how to calibrate the engine (chromatic adaptation, luminance normalization, CIEDE2000 weight tuning).
4. Inspect `package.json` test setup (`npm run test`) and design a synthetic mock color matrix test harness under simulated lighting variance to prove >=95% accuracy.
5. Record your progress in `progress.md` and write your complete findings to `handoff.md` in your working directory.
When done, send a message back to parent with summary and artifact path.
