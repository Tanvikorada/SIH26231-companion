function rgb2lab(rgb) { let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255; r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92; g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92; b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92; let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100; let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100; let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100; x /= 95.047; y /= 100.000; z /= 108.883; x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116); y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116); z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116); return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]; }
function deltaE00(lab1, lab2) {
  const L1 = lab1[0], a1 = lab1[1], b1 = lab1[2]; const L2 = lab2[0], a2 = lab2[1], b2 = lab2[2];
  const C1 = Math.sqrt(a1 * a1 + b1 * b1); const C2 = Math.sqrt(a2 * a2 + b2 * b2); const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1prime = (1 + G) * a1; const a2prime = (1 + G) * a2;
  const C1prime = Math.sqrt(a1prime * a1prime + b1 * b1); const C2prime = Math.sqrt(a2prime * a2prime + b2 * b2);
  const Cbarprime = (C1prime + C2prime) / 2;
  let h1prime = Math.atan2(b1, a1prime) * (180 / Math.PI); if (h1prime < 0) h1prime += 360;
  let h2prime = Math.atan2(b2, a2prime) * (180 / Math.PI); if (h2prime < 0) h2prime += 360;
  let Hbarprime = Math.abs(h1prime - h2prime) > 180 ? (h1prime + h2prime + 360) / 2 : (h1prime + h2prime) / 2;
  const T = 1 - 0.17 * Math.cos((Hbarprime - 30) * (Math.PI / 180)) + 0.24 * Math.cos((2 * Hbarprime) * (Math.PI / 180)) + 0.32 * Math.cos((3 * Hbarprime + 6) * (Math.PI / 180)) - 0.20 * Math.cos((4 * Hbarprime - 63) * (Math.PI / 180));
  let deltahprime = Math.abs(h2prime - h1prime) <= 180 ? h2prime - h1prime : (h2prime <= h1prime ? h2prime - h1prime + 360 : h2prime - h1prime - 360);
  const deltaLprime = L2 - L1; const deltaCprime = C2prime - C1prime; const deltaHprime = 2 * Math.sqrt(C1prime * C2prime) * Math.sin((deltahprime / 2) * (Math.PI / 180));
  const S_L = 1 + (0.015 * Math.pow((L1+L2)/2 - 50, 2)) / Math.sqrt(20 + Math.pow((L1+L2)/2 - 50, 2));
  const S_C = 1 + 0.045 * Cbarprime; const S_H = 1 + 0.015 * Cbarprime * T;
  const deltaTheta = 30 * Math.exp(-Math.pow((Hbarprime - 275) / 25, 2));
  const R_C = 2 * Math.sqrt(Math.pow(Cbarprime, 7) / (Math.pow(Cbarprime, 7) + Math.pow(25, 7)));
  const R_T = -Math.sin(2 * deltaTheta * (Math.PI / 180)) * R_C;
  return Math.sqrt(Math.pow(deltaLprime / S_L, 2) + Math.pow(deltaCprime / S_C, 2) + Math.pow(deltaHprime / S_H, 2) + R_T * (deltaCprime / S_C) * (deltaHprime / S_H));
}

const testRGB = [165, 161, 156];
const lab = rgb2lab(testRGB);
const adPos = rgb2lab([59, 125, 59]);
const adNeg = rgb2lab([217, 164, 65]);
console.log("Auto-Detect Positive Distance:", deltaE00(lab, adPos));
console.log("Auto-Detect Negative Distance:", deltaE00(lab, adNeg));
