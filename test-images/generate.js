// Generates photo-style test images of a reagent spot test (white reference card + porcelain spot plate).
// The white card centre sits at 20%/50% and the reagent drop centre at 65%/50%, where the app samples.
// Run: node test-images/generate.js
const sharp = require("sharp");
const lib = require("../src/lib/color_library.json");
const W = 1600, H = 1067;
const find = (reagent, drug) => lib.find(x => x.reagent === reagent && x.drug === drug);
const cases = [
  ["marquis_heroin_positive", "Marquis", "Heroin", "positive", 1],
  ["marquis_heroin_negative", "Marquis", "Heroin", "negative", 1],
  ["marquis_amphetamine_positive", "Marquis", "Amphetamine", "positive", 1],
  ["cobalt_cocaine_positive", "Cobalt", "Cocaine HCl", "positive", 1],
  ["cobalt_cocaine_negative", "Cobalt", "Cocaine HCl", "negative", 1],
  ["wagner_cocaine_positive", "Wagner", "Cocaine HCl", "positive", 1],
  ["marquis_heroin_positive_dim_light", "Marquis", "Heroin", "positive", 0.55],
  ["cobalt_cocaine_positive_warm_light", "Cobalt", "Cocaine HCl", "positive", 1, [1.1, 1.0, 0.8]],
];
const rgb = c => `rgb(${c.map(Math.round).join(",")})`;
const shade = (c, k) => c.map(v => Math.max(0, Math.min(255, v * k)));

function scene(spot, kind) {
  const cx = W * 0.65, cy = H * 0.5, wx = W * 0.20, wy = H * 0.5;
  const wet = kind === "positive";
  const edge = shade(spot, wet ? 0.72 : 0.9), rim = shade(spot, wet ? 0.55 : 0.8);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.18" numOctaves="4" seed="7"/>
      <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.11  0 0 0 0 0.08  0 0 0 0.9 0"/>
    </filter>
    <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0"/></filter>
    <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur18"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="1.6"/></filter>
    <linearGradient id="bench" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7a5a3c"/><stop offset="0.5" stop-color="#6b4d33"/><stop offset="1" stop-color="#4d3826"/>
    </linearGradient>
    <radialGradient id="ceramic" cx="0.4" cy="0.35" r="0.9">
      <stop offset="0" stop-color="#f4f3ef"/><stop offset="1" stop-color="#d9d7d0"/>
    </radialGradient>
    <radialGradient id="well" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.85" stop-color="#e9e8e3"/><stop offset="1" stop-color="#bdbab1"/>
    </radialGradient>
    <radialGradient id="liquid" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${rgb(spot)}"/><stop offset="0.55" stop-color="${rgb(spot)}"/>
      <stop offset="0.88" stop-color="${rgb(edge)}"/><stop offset="1" stop-color="${rgb(rim)}"/>
    </radialGradient>
    <radialGradient id="spec" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/>
    </radialGradient>
    <linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#5a3b18"/><stop offset="0.35" stop-color="#b57a34"/><stop offset="1" stop-color="#4a2f12"/></linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bench)"/>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.55"/>

  <!-- reference card -->
  <g transform="rotate(-3 ${wx} ${wy})">
    <rect x="${wx-150+14}" y="${wy-190+22}" width="300" height="380" rx="6" fill="#000" opacity="0.5" filter="url(#blur18)"/>
    <rect x="${wx-150}" y="${wy-190}" width="300" height="380" rx="5" fill="#f5f5f3"/>
    <rect x="${wx-150}" y="${wy-190}" width="300" height="380" rx="5" filter="url(#paper)"/>
    <text x="${wx}" y="${wy-150}" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="#8a8a88">WHITE REFERENCE</text>
    <rect x="${wx-120}" y="${wy+150}" width="240" height="4" fill="#c9c9c6"/>
  </g>

  <!-- spot plate shadow + body -->
  <rect x="${cx-330+18}" y="${cy-240+26}" width="640" height="480" rx="34" fill="#000" opacity="0.55" filter="url(#blur18)"/>
  <rect x="${cx-330}" y="${cy-240}" width="640" height="480" rx="30" fill="url(#ceramic)" stroke="#bcb9b0" stroke-width="2"/>
  <rect x="${cx-322}" y="${cy-232}" width="624" height="464" rx="24" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="3"/>

  <!-- side wells (empty, slight residue) -->
  <circle cx="${cx-215}" cy="${cy-120}" r="72" fill="url(#well)"/><circle cx="${cx-215}" cy="${cy-120}" r="72" fill="none" stroke="#a6a39a" stroke-width="3"/>
  <circle cx="${cx-215}" cy="${cy+130}" r="72" fill="url(#well)"/><circle cx="${cx-215}" cy="${cy+130}" r="72" fill="none" stroke="#a6a39a" stroke-width="3"/>
  <circle cx="${cx-205}" cy="${cy+135}" r="16" fill="#fafafa" opacity="0.9" filter="url(#blur2)"/>
  <circle cx="${cx+225}" cy="${cy-110}" r="72" fill="url(#well)"/><circle cx="${cx+225}" cy="${cy-110}" r="72" fill="none" stroke="#a6a39a" stroke-width="3"/>

  <!-- active well -->
  <circle cx="${cx}" cy="${cy}" r="112" fill="url(#well)"/>
  <circle cx="${cx}" cy="${cy}" r="112" fill="none" stroke="#9c998f" stroke-width="4"/>
  <circle cx="${cx+6}" cy="${cy+8}" r="84" fill="#000" opacity="0.25" filter="url(#blur6)"/>
  <circle cx="${cx}" cy="${cy}" r="84" fill="url(#liquid)"/>
  <ellipse cx="${cx-46}" cy="${cy-48}" rx="30" ry="14" transform="rotate(-38 ${cx-46} ${cy-48})" fill="url(#spec)"/>
  <ellipse cx="${cx+50}" cy="${cy+52}" rx="10" ry="5" fill="#fff" opacity="0.35" filter="url(#blur2)"/>

  <!-- dropper bottle -->
  <g transform="rotate(24 ${W*0.9} ${H*0.32})">
    <ellipse cx="${W*0.9+20}" cy="${H*0.32+150}" rx="55" ry="120" fill="#000" opacity="0.5" filter="url(#blur18)"/>
    <rect x="${W*0.9-38}" y="${H*0.32-30}" width="76" height="190" rx="14" fill="url(#glass)"/>
    <rect x="${W*0.9-26}" y="${H*0.32-4}" width="14" height="150" rx="7" fill="#fff" opacity="0.3"/>
    <rect x="${W*0.9-28}" y="${H*0.32-70}" width="56" height="44" rx="8" fill="#1b1b1b"/>
    <path d="M ${W*0.9-12} ${H*0.32-70} q 12 -46 24 0 z" fill="#101010"/>
    <rect x="${W*0.9-30}" y="${H*0.32+50}" width="60" height="60" fill="#f1efe8" opacity="0.92"/>
    <text x="${W*0.9}" y="${H*0.32+86}" font-family="Arial,sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="#333">REAGENT</text>
  </g>

  <!-- light falloff, vignette -->
  <rect width="100%" height="100%" fill="url(#vig)"/>
</svg>`;
}

(async () => {
  for (const [name, reagent, drug, kind, light, cast = [1, 1, 1]] of cases) {
    const p = find(reagent, drug);
    const spot = kind === "positive" ? p.positive_rgb : p.negative_rgb;
    const noise = await sharp({ create: { width: W, height: H, channels: 3, noise: { type: "gaussian", mean: 128, sigma: 5 } } }).png().toBuffer();
    await sharp(Buffer.from(scene(spot, kind)))
      .composite([{ input: noise, blend: "overlay" }])
      .blur(0.7)
      .recomb([[light * cast[0], 0, 0], [0, light * cast[1], 0], [0, 0, light * cast[2]]])
      .jpeg({ quality: 88 })
      .toFile(`test-images/${name}.jpg`);
    console.log(name, kind, drug);
  }
})();
