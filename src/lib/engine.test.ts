import { expect, test } from "vitest";
import { calibrateColor, classifyResult, KNOWN_REFERENCE_COLOR } from "./engine";

test("Calibration keeps color same if reference matches exactly", () => {
  const calibrated = calibrateColor({ r: 100, g: 150, b: 200 }, KNOWN_REFERENCE_COLOR);
  expect(calibrated).toEqual({ r: 100, g: 150, b: 200 });
});

test("Calibration corrects dark lighting", () => {
  const capturedRef = {
    r: KNOWN_REFERENCE_COLOR.r / 2,
    g: KNOWN_REFERENCE_COLOR.g / 2,
    b: KNOWN_REFERENCE_COLOR.b / 2,
  };
  const capturedTest = { r: 50, g: 75, b: 100 };
  const calibrated = calibrateColor(capturedTest, capturedRef);
  expect(calibrated).toEqual({ r: 100, g: 150, b: 200 });
});

test("Classify positive (Green)", () => {
  // Delta E of (60, 125, 60) against (59, 125, 59) is very small (approx 0.5)
  const result = classifyResult({ r: 60, g: 125, b: 60 });
  expect(result).toEqual({ result: "positive", confidence: "high" });
});

test("Classify negative (Orange)", () => {
  // Delta E against (217, 164, 65) is small
  const result = classifyResult({ r: 215, g: 165, b: 65 });
  expect(result).toEqual({ result: "negative", confidence: "high" });
});

test("Classify inconclusive boundary", () => {
  // Directly hitting the boundary reference (143, 165, 92)
  const result = classifyResult({ r: 143, g: 165, b: 92 });
  expect(result.result).toBe("inconclusive");
  expect(result.confidence).toBe("estimated");
});

test("Classify low confidence (Totally unrelated color, e.g. blue)", () => {
  // Huge delta E for all references
  const result = classifyResult({ r: 10, g: 20, b: 200 });
  expect(result.result).toBe("inconclusive");
  expect(result.confidence).toBe("low");
});
