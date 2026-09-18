const sharp = require("sharp");

async function createPerfectMocks() {
  const width = 800;
  const height = 600;

  // The engine samples the test at X = width * 0.65 = 520, Y = height * 0.50 = 300.
  // The red patch is at X ~ 135, Y ~ 275.
  
  // 1. Cobalt Cocaine (Expects POSITIVE [2, 65, 121] #024179)
  const svgCobalt = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#3a3a3a" />
      
      <!-- Color Card (Left Side) -->
      <rect x="110" y="250" width="100" height="100" rx="10" fill="#ffffff" stroke="#aaaaaa" stroke-width="2" />
      <rect x="120" y="260" width="30" height="30" fill="#ff0000" />
      <rect x="160" y="260" width="30" height="30" fill="#00ff00" />
      <rect x="120" y="300" width="30" height="30" fill="#0000ff" />
      <rect x="160" y="300" width="30" height="30" fill="#ffffff" />
      
      <!-- Test Kit (Centered EXACTLY at 520, 300) -->
      <rect x="420" y="200" width="200" height="200" rx="20" fill="#f5f5f5" stroke="#cccccc" stroke-width="3" />
      
      <!-- Reaction Well exactly at cx=520 cy=300 -->
      <circle cx="520" cy="300" r="40" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="2" />
      <circle cx="520" cy="300" r="30" fill="#024179" />
      <ellipse cx="510" cy="285" rx="8" ry="4" fill="#ffffff" fill-opacity="0.6" transform="rotate(-30 510 285)" />
    </svg>
  `);

  await sharp({ create: { width, height, channels: 4, background: { r: 58, g: 58, b: 58, alpha: 1 } } })
  .composite([{ input: svgCobalt, top: 0, left: 0 }])
  .png().toFile("realistic_cobalt_cocaine.png");

  // 2. Marquis Heroin (Expects POSITIVE [17, 7, 14] #11070e)
  const svgHeroin = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#2c2c2c" />
      <rect x="110" y="250" width="100" height="100" rx="10" fill="#ffffff" stroke="#aaaaaa" stroke-width="2" />
      <rect x="120" y="260" width="30" height="30" fill="#ff0000" />
      <rect x="160" y="260" width="30" height="30" fill="#00ff00" />
      <rect x="120" y="300" width="30" height="30" fill="#0000ff" />
      <rect x="160" y="300" width="30" height="30" fill="#ffffff" />
      <rect x="420" y="200" width="200" height="200" rx="20" fill="#f0f0f0" stroke="#cccccc" stroke-width="3" />
      <circle cx="520" cy="300" r="40" fill="#e0e0e0" stroke="#c0c0c0" stroke-width="2" />
      <circle cx="520" cy="300" r="30" fill="#11070e" />
      <ellipse cx="510" cy="285" rx="8" ry="4" fill="#ffffff" fill-opacity="0.6" transform="rotate(-30 510 285)" />
    </svg>
  `);

  await sharp({ create: { width, height, channels: 4, background: { r: 44, g: 44, b: 44, alpha: 1 } } })
  .composite([{ input: svgHeroin, top: 0, left: 0 }])
  .png().toFile("realistic_marquis_heroin.png");

  // 3. Marquis Negative (Expects NEGATIVE [165, 161, 156] #a5a19c)
  const svgNeg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#2a2a2a" />
      <rect x="110" y="250" width="100" height="100" rx="10" fill="#ffffff" stroke="#aaaaaa" stroke-width="2" />
      <rect x="120" y="260" width="30" height="30" fill="#ff0000" />
      <rect x="160" y="260" width="30" height="30" fill="#00ff00" />
      <rect x="120" y="300" width="30" height="30" fill="#0000ff" />
      <rect x="160" y="300" width="30" height="30" fill="#ffffff" />
      <rect x="420" y="200" width="200" height="200" rx="20" fill="#e5e5e5" stroke="#bbbbbb" stroke-width="3" />
      <circle cx="520" cy="300" r="40" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="2" />
      <circle cx="520" cy="300" r="30" fill="#a5a19c" />
      <ellipse cx="510" cy="285" rx="8" ry="4" fill="#ffffff" fill-opacity="0.6" transform="rotate(-30 510 285)" />
    </svg>
  `);

  await sharp({ create: { width, height, channels: 4, background: { r: 42, g: 42, b: 42, alpha: 1 } } })
  .composite([{ input: svgNeg, top: 0, left: 0 }])
  .png().toFile("realistic_marquis_negative.png");
}

createPerfectMocks().catch(console.error);
