import library from "./color_library.json";

export interface ReagentProfile {
  reagent: string;
  drug: string;
  positive_rgb: number[];
  negative_rgb: number[];
}

const typedLibrary = library as ReagentProfile[];

export function rgb2lab(rgb: number[]) {
  let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;
  x /= 95.047; y /= 100.000; z /= 108.883;
  x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);
  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

function Lbarprime(L1: number, L2: number) { return (L1 + L2) / 2; }

export function deltaE00(lab1: number[], lab2: number[], kL = 1.0, kC = 1.0, kH = 1.0) {
  const L1 = lab1[0], a1 = lab1[1], b1 = lab1[2];
  const L2 = lab2[0], a2 = lab2[1], b2 = lab2[2];
  const weightL = kL, weightC = kC, weightH = kH;
  const C1 = Math.sqrt(a1 * a1 + b1 * b1); const C2 = Math.sqrt(a2 * a2 + b2 * b2); const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1prime = (1 + G) * a1; const a2prime = (1 + G) * a2;
  const C1prime = Math.sqrt(a1prime * a1prime + b1 * b1); const C2prime = Math.sqrt(a2prime * a2prime + b2 * b2);
  const Cbarprime = (C1prime + C2prime) / 2;
  let h1prime = Math.atan2(b1, a1prime) * (180 / Math.PI); if (h1prime < 0) h1prime += 360;
  let h2prime = Math.atan2(b2, a2prime) * (180 / Math.PI); if (h2prime < 0) h2prime += 360;
  
  let Hbarprime;
  if (C1prime * C2prime === 0) {
    Hbarprime = h1prime + h2prime;
  } else if (Math.abs(h1prime - h2prime) <= 180) {
    Hbarprime = (h1prime + h2prime) / 2;
  } else if (h1prime + h2prime < 360) {
    Hbarprime = (h1prime + h2prime + 360) / 2;
  } else {
    Hbarprime = (h1prime + h2prime - 360) / 2;
  }

  const T = 1 - 0.17 * Math.cos((Hbarprime - 30) * (Math.PI / 180)) + 0.24 * Math.cos((2 * Hbarprime) * (Math.PI / 180)) + 0.32 * Math.cos((3 * Hbarprime + 6) * (Math.PI / 180)) - 0.20 * Math.cos((4 * Hbarprime - 63) * (Math.PI / 180));
  
  let deltahprime;
  if (C1prime * C2prime === 0) {
    deltahprime = 0;
  } else if (Math.abs(h2prime - h1prime) <= 180) {
    deltahprime = h2prime - h1prime;
  } else if (h2prime - h1prime > 180) {
    deltahprime = h2prime - h1prime - 360;
  } else {
    deltahprime = h2prime - h1prime + 360;
  }

  const deltaLprime = L2 - L1; const deltaCprime = C2prime - C1prime; const deltaHprime = 2 * Math.sqrt(C1prime * C2prime) * Math.sin((deltahprime / 2) * (Math.PI / 180));
  const S_L = 1 + (0.015 * Math.pow(Lbarprime(L1, L2) - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarprime(L1, L2) - 50, 2));
  const S_C = 1 + 0.045 * Cbarprime; const S_H = 1 + 0.015 * Cbarprime * T;
  const deltaTheta = 30 * Math.exp(-Math.pow((Hbarprime - 275) / 25, 2));
  const R_C = 2 * Math.sqrt(Math.pow(Cbarprime, 7) / (Math.pow(Cbarprime, 7) + Math.pow(25, 7)));
  const R_T = -Math.sin(2 * deltaTheta * (Math.PI / 180)) * R_C;
  return Math.sqrt(Math.pow(deltaLprime / (weightL * S_L), 2) + Math.pow(deltaCprime / (weightC * S_C), 2) + Math.pow(deltaHprime / (weightH * S_H), 2) + R_T * (deltaCprime / (weightC * S_C)) * (deltaHprime / (weightH * S_H)));
}

export function calibrateColor(rawSpot: number[], rawWhite: number[]) {
  const TARGET_WHITE = [255, 255, 255];
  const lumaWhite = (rawWhite[0]*0.299 + rawWhite[1]*0.587 + rawWhite[2]*0.114);
  // Lower noise floor to 20 to support dim ambient captures while rejecting zero-signal noise
  if (lumaWhite < 20) return rawSpot;
  const scaleR = TARGET_WHITE[0] / Math.max(1, rawWhite[0]);
  const scaleG = TARGET_WHITE[1] / Math.max(1, rawWhite[1]);
  const scaleB = TARGET_WHITE[2] / Math.max(1, rawWhite[2]);
  return [
    Math.min(255, Math.max(0, Math.round(rawSpot[0] * scaleR))),
    Math.min(255, Math.max(0, Math.round(rawSpot[1] * scaleG))),
    Math.min(255, Math.max(0, Math.round(rawSpot[2] * scaleB)))
  ];
}

export function classifySpotTest(testRGB: number[], reagent: string) {
  const targetProfiles = typedLibrary.filter((r) => r.reagent === reagent);
  if (targetProfiles.length === 0) return { result: "inconclusive", distance: 999 };

  const testLab = rgb2lab(testRGB);
  let minPos = 999;
  let minNeg = 999;
  
  for (const profile of targetProfiles) {
    const posLab = rgb2lab(profile.positive_rgb);
    const negLab = rgb2lab(profile.negative_rgb);
    // Use kL = 1.5 to decouple illumination intensity and shadows from chemical chroma/hue
    const dPos = deltaE00(testLab, posLab, 1.5, 1.0, 1.0);
    const dNeg = deltaE00(testLab, negLab, 1.5, 1.0, 1.0);
    if (dPos < minPos) minPos = dPos;
    if (dNeg < minNeg) minNeg = dNeg;
  }

  const TOLERANCE_POS = 10.0;
  const TOLERANCE_NEG = 14.0;

  // Symmetric classification: test is positive if closer to positive profile than negative profile
  if (minPos < minNeg && minPos < TOLERANCE_POS) {
    return { result: "positive", distance: minPos };
  } else if (minNeg < TOLERANCE_NEG) {
    return { result: "negative", distance: minNeg };
  } else if (minPos < TOLERANCE_POS) {
    return { result: "positive", distance: minPos };
  }

  return { result: "inconclusive", distance: Math.min(minPos, minNeg) };
}

export async function generateSHA256(buffer: ArrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
