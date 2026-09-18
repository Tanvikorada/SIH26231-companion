const sharp = require("sharp");
const fs = require("fs");

async function createMocks() {
  const width = 800;
  const height = 600;

  // 1. Cobalt Thiocyanate Cocaine (Blue)
  const svgCobalt = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#3a3a3a" />
      
      <!-- Color Card -->
      <rect x="110" y="250" width="100" height="100" rx="10" fill="#ffffff" stroke="#aaaaaa" stroke-width="2" />
      <rect x="120" y="260" width="30" height="30" fill="#ff0000" />
      <rect x="160" y="260" width="30" height="30" fill="#00ff00" />
      <rect x="120" y="300" width="30" height="30" fill="#0000ff" />
      <rect x="160" y="300" width="30" height="30" fill="#ffffff" />

      <!-- Test Kit -->
      <rect x="540" y="200" width="200" height="200" rx="20" fill="#f5f5f5" stroke="#cccccc" stroke-width="3" />
      
      <!-- Blue Cocaine Reaction -->
      <circle cx="640" cy="300" r="40" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="2" />
      <circle cx="640" cy="300" r="30" fill="#0047AB" /> <!-- Cobalt Blue -->
      <ellipse cx="630" cy="285" rx="8" ry="4" fill="#ffffff" fill-opacity="0.6" transform="rotate(-30 630 285)" />
    </svg>
  `);

  await sharp({ create: { width, height, channels: 4, background: { r: 58, g: 58, b: 58, alpha: 1 } } })
  .composite([{ input: svgCobalt, top: 0, left: 0 }])
  .png().toFile("realistic_cobalt_cocaine.png");

  // 2. Negative Test (No Color Change)
  const svgNegative = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#2a2a2a" />
      
      <!-- Color Card -->
      <rect x="110" y="250" width="100" height="100" rx="10" fill="#ffffff" stroke="#aaaaaa" stroke-width="2" />
      <rect x="120" y="260" width="30" height="30" fill="#ff0000" />
      <rect x="160" y="260" width="30" height="30" fill="#00ff00" />
      <rect x="120" y="300" width="30" height="30" fill="#0000ff" />
      <rect x="160" y="300" width="30" height="30" fill="#ffffff" />

      <!-- Test Kit -->
      <rect x="540" y="200" width="200" height="200" rx="20" fill="#e5e5e5" stroke="#bbbbbb" stroke-width="3" />
      
      <!-- Negative Reaction (Just liquid color / slightly yellow/clear) -->
      <circle cx="640" cy="300" r="40" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="2" />
      <circle cx="640" cy="300" r="30" fill="#e6dfc3" /> <!-- Slight brownish/yellow liquid -->
      <ellipse cx="630" cy="285" rx="8" ry="4" fill="#ffffff" fill-opacity="0.6" transform="rotate(-30 630 285)" />
    </svg>
  `);

  await sharp({ create: { width, height, channels: 4, background: { r: 42, g: 42, b: 42, alpha: 1 } } })
  .composite([{ input: svgNegative, top: 0, left: 0 }])
  .png().toFile("realistic_negative.png");

}

createMocks().catch(console.error);
