const sharp = require("sharp");
async function scanCassette() {
  const image = sharp("C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789748280311.jpg");
  const metadata = await image.metadata();
  const raw = await image.removeAlpha().raw().toBuffer();
  const width = metadata.width;
  
  const cassetteX = 390; 
  
  for(let y = 300; y < 700; y += 10) {
      const idx = (y * width + cassetteX) * 3;
      const r = raw[idx];
      const g = raw[idx+1];
      const b = raw[idx+2];
      console.log(`Y:${y} -> R:${r} G:${g} B:${b}`);
  }
}
scanCassette();
