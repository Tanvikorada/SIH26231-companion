const sharp = require("sharp");
const fs = require("fs");

async function createRealisticMock() {
  // Let's create a base background: dark grey/black gradient to look like a tactical table
  const width = 800;
  const height = 600;

  // We can create SVG layers and composite them over a solid color
  const svgLayers = Buffer.from(`
    <svg width="${width}" height="${height}">
      <!-- Table background -->
      <rect width="100%" height="100%" fill="#2c2c2c" />
      
      <!-- Color Card on the left (at x=160, y=300 for the center) -->
      <!-- The engine scans at x=width*0.2 (160) and y=height*0.5 (300) -->
      <!-- Let's draw a realistic looking color card there -->
      <rect x="110" y="250" width="100" height="100" rx="10" fill="#ffffff" stroke="#aaaaaa" stroke-width="2" />
      <rect x="120" y="260" width="30" height="30" fill="#ff0000" />
      <rect x="160" y="260" width="30" height="30" fill="#00ff00" />
      <rect x="120" y="300" width="30" height="30" fill="#0000ff" />
      <rect x="160" y="300" width="30" height="30" fill="#ffffff" />
      <circle cx="160" cy="300" r="10" fill="#ffffff" /> <!-- Exact target center -->

      <!-- Test Kit on the right (at x=width*0.8 = 640) -->
      <!-- A white ceramic spot plate or plastic cassette -->
      <rect x="540" y="200" width="200" height="200" rx="20" fill="#f0f0f0" stroke="#cccccc" stroke-width="3" />
      
      <!-- The reaction well exactly at 640, 300 -->
      <circle cx="640" cy="300" r="40" fill="#e0e0e0" stroke="#c0c0c0" stroke-width="2" />
      
      <!-- Purple Marquis Positive for MDMA -->
      <!-- MDMA goes deep purple / black with Marquis -->
      <circle cx="640" cy="300" r="30" fill="#4a0e4e" />
      <circle cx="640" cy="300" r="20" fill="#2d0830" />
      
      <!-- Lighting reflections -->
      <ellipse cx="630" cy="285" rx="8" ry="4" fill="#ffffff" fill-opacity="0.6" transform="rotate(-30 630 285)" />
      
    </svg>
  `);

  await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 44, g: 44, b: 44, alpha: 1 }
    }
  })
  .composite([{ input: svgLayers, top: 0, left: 0 }])
  .png()
  .toFile("realistic_marquis_mdma.png");
  
  console.log("Created realistic_marquis_mdma.png");
}

createRealisticMock().catch(console.error);
