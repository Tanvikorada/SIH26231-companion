import { describe, expect, it } from "vitest";
import library from "./color_library.json";
import { calibrateColor, classifySpotTest } from "./engine";

interface LightingCondition {
  name: string;
  gains: [number, number, number];
  noise: number;
}

// 10 simulated real-world lighting conditions
const LIGHTING_CONDITIONS: LightingCondition[] = [
  { name: "D65 daylight", gains: [1.0, 1.0, 1.0], noise: 0 },
  { name: "80% shadow", gains: [0.8, 0.8, 0.8], noise: 0 },
  { name: "60% shadow", gains: [0.6, 0.6, 0.6], noise: 0 },
  { name: "40% shadow", gains: [0.4, 0.4, 0.4], noise: 0 },
  { name: "3000K tungsten", gains: [0.9, 0.765, 0.54], noise: 0 },
  { name: "2700K golden hour", gains: [0.85, 0.663, 0.425], noise: 0 },
  { name: "7000K cool sky", gains: [0.765, 0.828, 0.9], noise: 0 },
  { name: "fluorescent green tint", gains: [0.748, 0.85, 0.697], noise: 0 },
  { name: "105% bright light", gains: [1.05, 1.05, 1.05], noise: 0 },
  { name: "35% dim light with sensor noise", gains: [0.35, 0.35, 0.35], noise: 2.0 },
];

// Deterministic PRNG for reproducible test execution
function createPRNG(seed = 42) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function gaussianNoise(rand: () => number, sigma: number): number {
  if (sigma === 0) return 0;
  const u1 = Math.max(1e-6, rand());
  const u2 = rand();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * sigma;
}

describe("Synthetic Mock Color Matrix Lighting Calibration (660 Samples)", () => {
  it("verifies 100% baseline classification on unperturbed library samples", () => {
    let passed = 0;
    for (const profile of library) {
      const posRes = classifySpotTest(profile.positive_rgb, profile.reagent);
      const negRes = classifySpotTest(profile.negative_rgb, profile.reagent);
      if (posRes.result === "positive") passed++;
      if (negRes.result === "negative") passed++;
    }
    expect(passed).toBe(66);
    expect((passed / 66) * 100).toBe(100.0);
  });

  // Test each of the 10 lighting conditions individually
  for (const condition of LIGHTING_CONDITIONS) {
    it(`evaluates 66 samples under ${condition.name}`, () => {
      const rand = createPRNG(42);
      let passed = 0;

      for (const profile of library) {
        for (const kind of ["positive", "negative"] as const) {
          const trueRgb = kind === "positive" ? profile.positive_rgb : profile.negative_rgb;
          const targetWhite = [255, 255, 255];

          const nR = gaussianNoise(rand, condition.noise);
          const nG = gaussianNoise(rand, condition.noise);
          const nB = gaussianNoise(rand, condition.noise);

          const rawWhite = [
            Math.min(255, Math.max(0, Math.round(targetWhite[0] * condition.gains[0] + nR))),
            Math.min(255, Math.max(0, Math.round(targetWhite[1] * condition.gains[1] + nG))),
            Math.min(255, Math.max(0, Math.round(targetWhite[2] * condition.gains[2] + nB))),
          ];

          const rawSpot = [
            Math.min(255, Math.max(0, Math.round(trueRgb[0] * condition.gains[0] + gaussianNoise(rand, condition.noise)))),
            Math.min(255, Math.max(0, Math.round(trueRgb[1] * condition.gains[1] + gaussianNoise(rand, condition.noise)))),
            Math.min(255, Math.max(0, Math.round(trueRgb[2] * condition.gains[2] + gaussianNoise(rand, condition.noise)))),
          ];

          const calibrated = calibrateColor(rawSpot, rawWhite);
          const classification = classifySpotTest(calibrated, profile.reagent);

          if (classification.result === kind) {
            passed++;
          }
        }
      }

      const conditionAccuracy = (passed / 66) * 100;
      // Each individual condition should exceed 90%
      expect(conditionAccuracy).toBeGreaterThanOrEqual(90.0);
    });
  }

  it("programmatically asserts that overall accuracy across all 660 samples is >= 95%", () => {
    const rand = createPRNG(42);
    let totalTested = 0;
    let totalPassed = 0;
    const conditionStats: Record<string, { passed: number; total: number }> = {};

    for (const condition of LIGHTING_CONDITIONS) {
      conditionStats[condition.name] = { passed: 0, total: 0 };

      for (const profile of library) {
        for (const kind of ["positive", "negative"] as const) {
          const trueRgb = kind === "positive" ? profile.positive_rgb : profile.negative_rgb;
          const targetWhite = [255, 255, 255];

          const nR = gaussianNoise(rand, condition.noise);
          const nG = gaussianNoise(rand, condition.noise);
          const nB = gaussianNoise(rand, condition.noise);

          const rawWhite = [
            Math.min(255, Math.max(0, Math.round(targetWhite[0] * condition.gains[0] + nR))),
            Math.min(255, Math.max(0, Math.round(targetWhite[1] * condition.gains[1] + nG))),
            Math.min(255, Math.max(0, Math.round(targetWhite[2] * condition.gains[2] + nB))),
          ];

          const rawSpot = [
            Math.min(255, Math.max(0, Math.round(trueRgb[0] * condition.gains[0] + gaussianNoise(rand, condition.noise)))),
            Math.min(255, Math.max(0, Math.round(trueRgb[1] * condition.gains[1] + gaussianNoise(rand, condition.noise)))),
            Math.min(255, Math.max(0, Math.round(trueRgb[2] * condition.gains[2] + gaussianNoise(rand, condition.noise)))),
          ];

          const calibrated = calibrateColor(rawSpot, rawWhite);
          const classification = classifySpotTest(calibrated, profile.reagent);

          totalTested++;
          conditionStats[condition.name].total++;

          if (classification.result === kind) {
            totalPassed++;
            conditionStats[condition.name].passed++;
          }
        }
      }
    }

    const overallAccuracy = (totalPassed / totalTested) * 100;

    // Output formatted diagnostic matrix table for test reporting
    console.log("\n=======================================================");
    console.log("   660-SAMPLE SYNTHETIC LIGHTING MATRIX CALIBRATION   ");
    console.log("=======================================================");
    for (const [condName, stats] of Object.entries(conditionStats)) {
      const pct = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`  ${condName.padEnd(35)} : ${stats.passed}/${stats.total} (${pct}%)`);
    }
    console.log("-------------------------------------------------------");
    console.log(`  Total Evaluated : ${totalTested}`);
    console.log(`  Total Passed    : ${totalPassed}`);
    console.log(`  Overall Accuracy: ${overallAccuracy.toFixed(2)}%`);
    console.log("=======================================================\n");

    expect(totalTested).toBe(660);
    expect(overallAccuracy).toBeGreaterThanOrEqual(95.0);
  });
});
