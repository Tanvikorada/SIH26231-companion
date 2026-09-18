import convert from "color-convert";
import DeltaE from "delta-e";
import db from "./color_library.json";

export type RGB = { r: number; g: number; b: number };
export type LAB = { L: number; A: number; B: number };

export type ClassificationResult = {
  result: "positive" | "negative" | "inconclusive";
  confidence: "high" | "estimated" | "low";
  drugMatch?: string;
  notes?: string;
};

export const KNOWN_REFERENCE_COLOR: RGB = { r: 128, g: 128, b: 128 }; 

export function calibrateColor(capturedTestColor: RGB, capturedGrayColor: RGB): RGB {
  const correctionFactor = {
    r: KNOWN_REFERENCE_COLOR.r / (capturedGrayColor.r || 1),
    g: KNOWN_REFERENCE_COLOR.g / (capturedGrayColor.g || 1),
    b: KNOWN_REFERENCE_COLOR.b / (capturedGrayColor.b || 1),
  };

  return {
    r: Math.min(255, Math.round(capturedTestColor.r * correctionFactor.r)),
    g: Math.min(255, Math.round(capturedTestColor.g * correctionFactor.g)),
    b: Math.min(255, Math.round(capturedTestColor.b * correctionFactor.b)),
  };
}

function rgbToLabObject(rgb: RGB): LAB {
  const labArr = convert.rgb.lab([rgb.r, rgb.g, rgb.b]);
  return { L: labArr[0], A: labArr[1], B: labArr[2] };
}

export function classifySpotTest(calibratedColor: RGB, reagent: string): ClassificationResult {
  const sampleLab = rgbToLabObject(calibratedColor);
  
  // Filter DB by reagent
  const tests = db.filter(t => t.reagent.toLowerCase() === reagent.toLowerCase());
  
  if (tests.length === 0) {
    return { result: "inconclusive", confidence: "low", notes: "Unknown Reagent" };
  }

  let bestMatch: string | undefined = undefined;
  let minDeltaE = Infinity;
  let isPositive = false;

  for (const test of tests) {
    const posLab = rgbToLabObject({ r: test.positive_rgb[0], g: test.positive_rgb[1], b: test.positive_rgb[2] });
    const negLab = rgbToLabObject({ r: test.negative_rgb[0], g: test.negative_rgb[1], b: test.negative_rgb[2] });
    
    const dPos = DeltaE.getDeltaE00(sampleLab, posLab);
    const dNeg = DeltaE.getDeltaE00(sampleLab, negLab);

    if (dPos < minDeltaE) {
      minDeltaE = dPos;
      bestMatch = test.drug;
      isPositive = true;
    }
    if (dNeg < minDeltaE) {
      minDeltaE = dNeg;
      bestMatch = test.drug; // It's negative for this drug, or just baseline negative
      isPositive = false;
    }
  }

  // Thresholds
  const MAX_CONFIDENT_DELTA = 15;
  const MAX_ACCEPTABLE_DELTA = 30;

  if (minDeltaE <= MAX_CONFIDENT_DELTA) {
    return {
      result: isPositive ? "positive" : "negative",
      confidence: "high",
      drugMatch: isPositive ? bestMatch : undefined,
      notes: isPositive ? `Detected ${bestMatch} via ${reagent} test` : `Negative reaction for ${reagent} test`
    };
  } else if (minDeltaE <= MAX_ACCEPTABLE_DELTA) {
    return {
      result: isPositive ? "positive" : "negative",
      confidence: "estimated",
      drugMatch: isPositive ? bestMatch : undefined,
      notes: isPositive ? `Possible ${bestMatch} trace detected` : `Presumed negative`
    };
  }

  return { result: "inconclusive", confidence: "low", notes: "Color did not match any known reaction" };
}
