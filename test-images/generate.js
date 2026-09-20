// Generates synthetic test photos: white reference card at 20% width, reagent spot at 65% width, both at 50% height.
// Run: node test-images/generate.js
const sharp = require("sharp");
const lib = require("../src/lib/color_library.json");
const W = 1200, H = 800;
const find = (reagent, drug) => lib.find(x => x.reagent === reagent && x.drug === drug);
const cases = [
  ["marquis_heroin_positive", "Marquis", "Heroin", "positive", 1],
  ["marquis_heroin_negative", "Marquis", "Heroin", "negative", 1],
  ["marquis_amphetamine_positive", "Marquis", "Amphetamine", "positive", 1],
  ["cobalt_cocaine_positive", "Cobalt", "Cocaine HCl", "positive", 1],
  ["cobalt_cocaine_negative", "Cobalt", "Cocaine HCl", "negative", 1],
  ["marquis_heroin_positive_dim_light", "Marquis", "Heroin", "positive", 0.55],
  ["cobalt_cocaine_positive_warm_light", "Cobalt", "Cocaine HCl", "positive", 1, [1.1, 1.0, 0.8]],
  ["wagner_cocaine_positive", "Wagner", "Cocaine HCl", "positive", 1],
];
const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
(async () => {
  for (const [name, reagent, drug, kind, light, cast = [1, 1, 1]] of cases) {
    const p = find(reagent, drug);
    const tint = c => c.map((v, i) => clamp(v * light * cast[i]));
    const spot = tint(kind === "positive" ? p.positive_rgb : p.negative_rgb);
    const white = tint([245, 245, 245]);
    const bg = tint([120, 105, 90]);
    const rgb = c => `rgb(${c.join(",")})`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect width="100%" height="100%" fill="${rgb(bg)}"/>
      <rect x="${W*0.20-90}" y="${H*0.5-90}" width="180" height="180" fill="${rgb(white)}"/>
      <circle cx="${W*0.65}" cy="${H*0.5}" r="90" fill="${rgb(spot)}"/>
    </svg>`;
    const noise = await sharp({ create: { width: W, height: H, channels: 3, noise: { type: "gaussian", mean: 128, sigma: 6 } } }).png().toBuffer();
    await sharp(Buffer.from(svg)).composite([{ input: noise, blend: "overlay" }]).jpeg({ quality: 90 }).toFile(`test-images/${name}.jpg`);
    console.log(name, kind, "spot", spot);
  }
})();
