const sharp = require("sharp");

async function makeIcons() {
  const svg = Buffer.from(`
    <svg width="512" height="512">
      <rect width="100%" height="100%" fill="#003366" />
      <text x="50%" y="50%" font-family="Arial" font-size="120" fill="white" font-weight="bold" text-anchor="middle" alignment-baseline="middle">NCB</text>
    </svg>
  `);

  await sharp(svg).resize(192, 192).png().toFile("public/icons/icon-192x192.png");
  await sharp(svg).resize(512, 512).png().toFile("public/icons/icon-512x512.png");
}

makeIcons().catch(console.error);
