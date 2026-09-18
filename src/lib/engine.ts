import convert from "color-convert";
import DeltaE from "delta-e";

export type RGB = { r: number; g: number; b: number };
export type LAB = { L: number; A: number; B: number };

export type ClassificationResult = {
  result: "positive" | "negative" | "inconclusive";
  confidence: "high" | "estimated" | "low";
};

// Extracted from user's kit profile JSON
export const KNOWN_REFERENCE_COLOR: RGB = { r: 128, g: 128, b: 128 }; // gray18
const WHITE_REFERENCE: RGB = { r: 255, g: 255, b: 255 }; // white

// We use both white and gray to roughly correct. For simplicity based on prompt: 
// "after white-balance correction using the card's white/gray patches"
// I will just use gray18 for standard exposure reference as I previously did,
// or calculate an average factor. Let's stick to gray18 for now.
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

// User's JSON data true colors
const POSITIVE_REFERENCE: RGB = { r: 59, g: 125, b: 59 }; // #3B7D3B
const NEGATIVE_REFERENCE: RGB = { r: 217, g: 164, b: 65 }; // #D9A441
const BOUNDARY_REFERENCE: RGB = { r: 143, g: 165, b: 92 }; // #8FA55C

const POS_LAB = rgbToLabObject(POSITIVE_REFERENCE);
const NEG_LAB = rgbToLabObject(NEGATIVE_REFERENCE);
const BOUNDARY_LAB = rgbToLabObject(BOUNDARY_REFERENCE);

const MAX_DELTA_E = 35;

export function classifyResult(calibratedColor: RGB): ClassificationResult {
  const lab = rgbToLabObject(calibratedColor);

  const deltaEPos = DeltaE.getDeltaE00(lab, POS_LAB);
  const deltaENeg = DeltaE.getDeltaE00(lab, NEG_LAB);
  const deltaEBoundary = DeltaE.getDeltaE00(lab, BOUNDARY_LAB);

  // If within boundary threshold, automatically inconclusive
  if (deltaEBoundary <= MAX_DELTA_E) {
    return { result: "inconclusive", confidence: "estimated" };
  }

  // 4) If delta-E to positive <= max_delta_e and clearly closer than to negative -> POSITIVE
  if (deltaEPos <= MAX_DELTA_E && deltaEPos < deltaENeg) {
    return { result: "positive", confidence: "high" };
  }
  
  // 5) Same logic for NEGATIVE
  if (deltaENeg <= MAX_DELTA_E && deltaENeg < deltaEPos) {
    return { result: "negative", confidence: "high" };
  }

  // 6) Otherwise -> INCONCLUSIVE
  return { result: "inconclusive", confidence: "low" };
}
