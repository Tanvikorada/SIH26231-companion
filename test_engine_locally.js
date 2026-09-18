const sharp = require("sharp");

// The math logic copied directly from our engine.ts
function rgb2lab(rgb) {
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

function Lbarprime(L1, L2) { return (L1 + L2) / 2; }

function deltaE00(lab1, lab2) {
  const L1 = lab1[0], a1 = lab1[1], b1 = lab1[2];
  const L2 = lab2[0], a2 = lab2[1], b2 = lab2[2];
  const weightL = 1, weightC = 1, weightH = 1;
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1prime = (1 + G) * a1;
  const a2prime = (1 + G) * a2;
  const C1prime = Math.sqrt(a1prime * a1prime + b1 * b1);
  const C2prime = Math.sqrt(a2prime * a2prime + b2 * b2);
  const Cbarprime = (C1prime + C2prime) / 2;
  let h1prime = Math.atan2(b1, a1prime) * (180 / Math.PI);
  if (h1prime < 0) h1prime += 360;
  let h2prime = Math.atan2(b2, a2prime) * (180 / Math.PI);
  if (h2prime < 0) h2prime += 360;
  let Hbarprime;
  if (Math.abs(h1prime - h2prime) > 180) {
      Hbarprime = (h1prime + h2prime + 360) / 2;
  } else {
      Hbarprime = (h1prime + h2prime) / 2;
  }
  const T = 1 - 0.17 * Math.cos((Hbarprime - 30) * (Math.PI / 180))
            + 0.24 * Math.cos((2 * Hbarprime) * (Math.PI / 180))
            + 0.32 * Math.cos((3 * Hbarprime + 6) * (Math.PI / 180))
            - 0.20 * Math.cos((4 * Hbarprime - 63) * (Math.PI / 180));
  let deltahprime;
  if (Math.abs(h2prime - h1prime) <= 180) {
      deltahprime = h2prime - h1prime;
  } else if (h2prime <= h1prime) {
      deltahprime = h2prime - h1prime + 360;
  } else {
      deltahprime = h2prime - h1prime - 360;
  }
  const deltaLprime = L2 - L1;
  const deltaCprime = C2prime - C1prime;
  const deltaHprime = 2 * Math.sqrt(C1prime * C2prime) * Math.sin((deltahprime / 2) * (Math.PI / 180));
  const S_L = 1 + (0.015 * Math.pow(Lbarprime(L1, L2) - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarprime(L1, L2) - 50, 2));
  const S_C = 1 + 0.045 * Cbarprime;
  const S_H = 1 + 0.015 * Cbarprime * T;
  const deltaTheta = 30 * Math.exp(-Math.pow((Hbarprime - 275) / 25, 2));
  const R_C = 2 * Math.sqrt(Math.pow(Cbarprime, 7) / (Math.pow(Cbarprime, 7) + Math.pow(25, 7)));
  const R_T = -Math.sin(2 * deltaTheta * (Math.PI / 180)) * R_C;
  return Math.sqrt(
      Math.pow(deltaLprime / (weightL * S_L), 2) +
      Math.pow(deltaCprime / (weightC * S_C), 2) +
      Math.pow(deltaHprime / (weightH * S_H), 2) +
      R_T * (deltaCprime / (weightC * S_C)) * (deltaHprime / (weightH * S_H))
  );
}

function calibrateColor(rawSpot, rawWhite) {
  const TARGET_WHITE = [255, 255, 255];
  const lumaWhite = (rawWhite[0]*0.299 + rawWhite[1]*0.587 + rawWhite[2]*0.114);
  if (lumaWhite < 50) return rawSpot;
  const scaleR = TARGET_WHITE[0] / Math.max(1, rawWhite[0]);
  const scaleG = TARGET_WHITE[1] / Math.max(1, rawWhite[1]);
  const scaleB = TARGET_WHITE[2] / Math.max(1, rawWhite[2]);
  return [
    Math.min(255, Math.max(0, Math.round(rawSpot[0] * scaleR))),
    Math.min(255, Math.max(0, Math.round(rawSpot[1] * scaleG))),
    Math.min(255, Math.max(0, Math.round(rawSpot[2] * scaleB)))
  ];
}

const library = require("./src/lib/color_library.json");

function classifySpotTest(testRGB, reagent) {
  const targetProfiles = library.filter(r => r.reagent === reagent);
  if (targetProfiles.length === 0) return { result: "inconclusive", distance: 999 };
  const testLab = rgb2lab(testRGB);
  let bestMatch = "inconclusive";
  let minDistance = 999;
  const TOLERANCE = 15.0;
  for (const profile of targetProfiles) {
    const posLab = rgb2lab(profile.positive_rgb);
    const negLab = rgb2lab(profile.negative_rgb);
    const dPos = deltaE00(testLab, posLab);
    const dNeg = deltaE00(testLab, negLab);
    if (dPos < minDistance && dPos < TOLERANCE) { minDistance = dPos; bestMatch = "positive"; }
    if (dNeg < minDistance && dNeg < TOLERANCE) { minDistance = dNeg; bestMatch = "negative"; }
  }
  return { result: bestMatch, distance: minDistance };
}

async function runTest(imageFile, reagent) {
  const { data, info } = await sharp(imageFile).raw().toBuffer({ resolveWithObject: true });
  // Engine targets 20% and 65% width, 50% height
  const refX = Math.floor(info.width * 0.20);
  const refY = Math.floor(info.height * 0.50);
  const testX = Math.floor(info.width * 0.65);
  const testY = Math.floor(info.height * 0.50);

  const getPixel = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };

  const rawWhite = getPixel(refX, refY);
  const rawSpot = getPixel(testX, testY);

  const finalColor = calibrateColor(rawSpot, rawWhite);
  const classification = classifySpotTest(finalColor, reagent);

  console.log(`\nTESTING: ${imageFile} with Reagent: ${reagent}`);
  console.log(`- Sampled White Patch: RGB[${rawWhite.join(", ")}]`);
  console.log(`- Sampled Spot Test: RGB[${rawSpot.join(", ")}]`);
  console.log(`- Calibrated Color: RGB[${finalColor.join(", ")}]`);
  console.log(`=> FINAL RESULT: ${classification.result.toUpperCase()} (Confidence Distance: ${classification.distance.toFixed(2)})`);
}

async function testAll() {
  await runTest("realistic_cobalt_cocaine.png", "Cobalt Thiocyanate");
  await runTest("realistic_marquis_heroin.png", "Marquis");
  await runTest("realistic_marquis_negative.png", "Marquis");
}

testAll().catch(console.error);
