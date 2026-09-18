const sharp = require("sharp");

async function generate() {
  const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#0B192C"/>
    <circle cx="256" cy="256" r="200" fill="none" stroke="#FF6500" stroke-width="24"/>
    <path d="M256 128 L256 384 M128 256 L384 256" stroke="#FF6500" stroke-width="24"/>
    <circle cx="256" cy="256" r="40" fill="#FF6500"/>
  </svg>`;

  await sharp(Buffer.from(svg)).resize(192).toFile("public/icon-192.png");
  await sharp(Buffer.from(svg)).resize(512).toFile("public/icon-512.png");
}

generate();
