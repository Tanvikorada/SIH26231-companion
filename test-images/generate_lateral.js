// Photo-style images of a multi-drug urine test cup panel (lateral flow, C above T).
// Interpretation per kit inserts: C+T = negative, C only = positive, no C = invalid.
// Run: node test-images/generate_lateral.js
const sharp = require("sharp");
const W = 1600, H = 1067;
const drugs = ["COC", "OPI", "THC", "AMP", "MET"];
// per panel: [control, test] strength 0..1
const cases = [
  ["cup_all_negative", drugs.map(() => [1, 1]), 1, [1, 1, 1], 0],
  ["cup_cocaine_thc_positive", [[1, 0], [1, 1], [1, 0], [1, 1], [1, 1]], 1, [1, 1, 1], 0],
  ["cup_faint_test_lines_negative", drugs.map(() => [1, 0.35]), 1, [1, 1, 1], 0],
  ["cup_invalid_no_control", [[1, 1], [0, 1], [1, 1], [1, 1], [1, 1]], 1, [1, 1, 1], 0],
  ["cup_opiates_positive_dim_warm", [[1, 1], [1, 0], [1, 1], [1, 1], [1, 1]], 0.6, [1.08, 1, 0.82], 0],
  ["cup_amphetamine_positive_landscape", [[1, 1], [1, 1], [1, 1], [1, 0], [1, 1]], 1, [1, 1, 1], 270],
];

function scene(panels) {
  const py = 180, ph = 700, px = 260, pw = 1080;
  const wx = i => px + 130 + i * 205, wy = py + 170, wh = 420, ww = 56;
  let g = "";
  panels.forEach(([c, t], i) => {
    const x = wx(i);
    const cY = wy + wh * 0.26, tY = wy + wh * 0.56;
    const line = (y, k) => k > 0 ? `<rect x="${x - ww / 2 + 2}" y="${y - 3}" width="${ww - 4}" height="6" fill="rgb(${Math.round(235 - 60 * k)},${Math.round(235 - 175 * k)},${Math.round(235 - 120 * k)})" opacity="0.95"/>` : "";
    g += `
    <text x="${x}" y="${py + 70}" font-family="Arial,sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#1d3557">${drugs[i]}</text>
    <rect x="${x - ww / 2 - 8}" y="${wy - 8}" width="${ww + 16}" height="${wh + 16}" rx="10" fill="#2b2f36"/>
    <rect x="${x - ww / 2}" y="${wy}" width="${ww}" height="${wh}" fill="url(#membrane)"/>
    <rect x="${x - ww / 2}" y="${wy + wh * 0.72}" width="${ww}" height="${wh * 0.28}" fill="#e9b7c3" opacity="0.28"/>
    ${line(cY, c)}${line(tY, t)}
    <text x="${x - ww / 2 - 18}" y="${cY + 8}" font-family="Arial" font-size="22" font-weight="700" text-anchor="end" fill="#1d3557">C</text>
    <text x="${x - ww / 2 - 18}" y="${tY + 8}" font-family="Arial" font-size="22" font-weight="700" text-anchor="end" fill="#1d3557">T</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b8f96"/><stop offset="1" stop-color="#60646b"/></linearGradient>
    <linearGradient id="plastic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset="1" stop-color="#d9dce1"/></linearGradient>
    <linearGradient id="membrane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f4ee"/><stop offset="1" stop-color="#f1ede6"/></linearGradient>
    <filter id="sh"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/></filter>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="${px + 14}" y="${py + 24}" width="${pw}" height="${ph}" rx="36" fill="#000" opacity="0.5" filter="url(#sh)"/>
  <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="34" fill="url(#plastic)"/>
  <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="34" filter="url(#grain)"/>
  <text x="${px + pw / 2}" y="${py + ph - 40}" font-family="Arial" font-size="24" fill="#5b6470" text-anchor="middle">MULTI-DRUG URINE TEST CUP  -  READ AT 5 MINUTES</text>
  ${g}
  <rect width="100%" height="100%" fill="url(#vig)"/>
</svg>`;
}

(async () => {
  for (const [name, panels, light, cast, rot] of cases) {
    const noise = await sharp({ create: { width: W, height: H, channels: 3, noise: { type: "gaussian", mean: 128, sigma: 5 } } }).png().toBuffer();
    let img = sharp(Buffer.from(scene(panels))).composite([{ input: noise, blend: "overlay" }]).blur(0.7)
      .recomb([[light * cast[0], 0, 0], [0, light * cast[1], 0], [0, 0, light * cast[2]]]);
    if (rot) img = sharp(await img.png().toBuffer()).rotate(rot);
    await img.jpeg({ quality: 88 }).toFile(`test-images/${name}.jpg`);
    console.log(name);
  }
})();
