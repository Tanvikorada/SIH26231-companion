import { describe, expect, it } from "vitest";
import {
  rgb2lab,
  deltaE00,
  calibrateColor,
  classifySpotTest,
  generateSHA256,
} from "./engine";

describe("Core Forensic Engine Unit Tests", () => {
  describe("rgb2lab Color Space Conversion", () => {
    it("converts pure white [255, 255, 255] to Lab [100, 0, 0]", () => {
      const lab = rgb2lab([255, 255, 255]);
      expect(lab[0]).toBeCloseTo(100, 1);
      expect(Math.abs(lab[1])).toBeLessThan(1);
      expect(Math.abs(lab[2])).toBeLessThan(1);
    });

    it("converts pure black [0, 0, 0] to Lab [0, 0, 0]", () => {
      const lab = rgb2lab([0, 0, 0]);
      expect(lab[0]).toBeCloseTo(0, 1);
      expect(lab[1]).toBeCloseTo(0, 1);
      expect(lab[2]).toBeCloseTo(0, 1);
    });
  });

  describe("deltaE00 CIEDE2000 Distance Calculation", () => {
    it("returns zero distance for identical Lab coordinates", () => {
      const d = deltaE00([50, 10, 20], [50, 10, 20]);
      expect(d).toBe(0);
    });

    it("satisfies metric symmetry: deltaE00(a, b) === deltaE00(b, a)", () => {
      const d1 = deltaE00([50, 10, 20], [60, -10, 30]);
      const d2 = deltaE00([60, -10, 30], [50, 10, 20]);
      expect(d1).toBeCloseTo(d2, 8);
      expect(d1).toBeGreaterThan(20);
    });
  });

  describe("calibrateColor Lighting Calibration", () => {
    it("preserves color exactly when reference white matches [255, 255, 255]", () => {
      const calibrated = calibrateColor([100, 150, 200], [255, 255, 255]);
      expect(calibrated).toEqual([100, 150, 200]);
    });

    it("corrects underexposed / dark lighting based on captured white patch", () => {
      const calibrated = calibrateColor([50, 75, 100], [128, 128, 128]);
      expect(Math.abs(calibrated[0] - 100)).toBeLessThanOrEqual(1);
      expect(Math.abs(calibrated[1] - 149)).toBeLessThanOrEqual(1);
      expect(Math.abs(calibrated[2] - 199)).toBeLessThanOrEqual(1);
    });

    it("falls back to uncalibrated spot when lumaWhite < 20 (zero-signal rejection)", () => {
      const fallback = calibrateColor([50, 75, 100], [10, 10, 10]);
      expect(fallback).toEqual([50, 75, 100]);
    });
  });

  describe("classifySpotTest Reagent Classification", () => {
    it("classifies known positive spot for Marquis reagent", () => {
      const result = classifySpotTest([16, 6, 13], "Marquis");
      expect(result.result).toBe("positive");
      expect(result.distance).toBeLessThan(8.0);
    });

    it("classifies known negative spot for Marquis reagent", () => {
      const result = classifySpotTest([215, 209, 199], "Marquis");
      expect(result.result).toBe("negative");
      expect(result.distance).toBeLessThan(12.0);
    });

    it("returns inconclusive for non-existent reagent profile", () => {
      const result = classifySpotTest([100, 100, 100], "NonExistentReagent");
      expect(result.result).toBe("inconclusive");
      expect(result.distance).toBe(999);
    });

    it("returns inconclusive for unrelated color against Marquis reagent", () => {
      const result = classifySpotTest([0, 0, 255], "Marquis");
      expect(result.result).toBe("inconclusive");
    });
  });

  describe("generateSHA256 Evidence Hashing", () => {
    it("generates deterministic SHA-256 digest matching known test vector", async () => {
      const buffer = new TextEncoder().encode("NCB-EVIDENCE").buffer;
      const hash = await generateSHA256(buffer);
      expect(hash).toBe("8aa06e253f8047776bfa4cfaa39e749c6088506012f5bb799bf907024494cce6");
    });
  });
});
