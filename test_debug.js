const sharp = require("sharp");

async function debugImage() {
  const image = sharp("C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789748280311.jpg");
  const metadata = await image.metadata();
  console.log(`Original Size: ${metadata.width}x${metadata.height}`);
  
  const raw = await image.removeAlpha().raw().toBuffer();
  const w = metadata.width;
  
  const getPixel = (x, y) => {
    const idx = (Math.floor(y) * w + Math.floor(x)) * 3;
    return `R:${raw[idx]} G:${raw[idx+1]} B:${raw[idx+2]}`;
  }
  
  console.log(`Bottom Right (800, 800): ${getPixel(800, 800)}`);
  console.log(`Mid Left (300, 500): ${getPixel(300, 500)}`);
}
debugImage();
