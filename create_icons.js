const sharp = require("sharp");

async function createIcons() {
  const iconSvg = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#0B1B3D"/>
      <circle cx="256" cy="256" r="150" fill="#B5915F"/>
    </svg>
  `;

  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .toFile("public/icon-192.png");

  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .toFile("public/icon-512.png");
}

createIcons().then(() => console.log("Icons created!")).catch(console.error);
