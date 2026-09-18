const sharp = require("sharp");
async function findRed() {
  const image = sharp("C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789748280311.jpg");
  const metadata = await image.metadata();
  const raw = await image.removeAlpha().raw().toBuffer();
  
  const width = metadata.width;
  const height = metadata.height;
  
  let reds = [];
  for (let y = 0; y < height; y += 20) {
    for (let x = 0; x < width; x += 20) {
      const idx = (y * width + x) * 3;
      const r = raw[idx];
      const g = raw[idx+1];
      const b = raw[idx+2];
      // Red logic
      if (r > 150 && g < 80 && b < 80) {
        reds.push({x, y});
      }
    }
  }
  
  console.log(`Found ${reds.length} red pixels.`);
  if(reds.length > 0) {
      const avgX = reds.reduce((sum, p) => sum + p.x, 0) / reds.length;
      const avgY = reds.reduce((sum, p) => sum + p.y, 0) / reds.length;
      console.log(`Avg Red X: ${avgX}, Y: ${avgY}`);
      
      const idx = (Math.floor(avgY) * width + Math.floor(avgX)) * 3;
      console.log(`Center Red Pixel: R${raw[idx]} G${raw[idx+1]} B${raw[idx+2]}`);
  }
}
findRed();
