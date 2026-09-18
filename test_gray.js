const sharp = require("sharp");
async function findGray() {
  const image = sharp("C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789748280311.jpg");
  const metadata = await image.metadata();
  const raw = await image.removeAlpha().raw().toBuffer();
  const width = metadata.width;
  
  const redX = 650;
  const redY = 670;
  
  // Scan up
  for(let y = redY - 10; y > 0; y -= 10) {
      const idx = (y * width + redX) * 3;
      const r = raw[idx];
      const g = raw[idx+1];
      const b = raw[idx+2];
      
      const isNeutral = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
      const isMidTone = r > 80 && r < 180;
      
      if (isNeutral && isMidTone) {
          console.log(`Found Gray above at Y:${y}! RGB: ${r},${g},${b}`);
          break;
      }
  }
}
findGray();
