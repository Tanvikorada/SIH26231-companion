const sharp = require("sharp");

function findReferenceGray(buffer, width, height) {
  let redPixels = [];
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      if (r > 180 && g < 70 && b < 70) {
        redPixels.push({x, y});
      }
    }
  }

  if (redPixels.length === 0) return null;

  const avgRedX = Math.floor(redPixels.reduce((sum, p) => sum + p.x, 0) / redPixels.length);
  const avgRedY = Math.floor(redPixels.reduce((sum, p) => sum + p.y, 0) / redPixels.length);

  for (let x = avgRedX - 10; x > 0; x -= 5) {
    const idx = (avgRedY * width + x) * 3;
    const r = buffer[idx];
    const g = buffer[idx+1];
    const b = buffer[idx+2];
    
    const isNeutral = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
    const isMidTone = r > 60 && r < 200; 

    if (isNeutral && isMidTone) {
       return { x, y: avgRedY };
    }
  }
  return null; 
}

async function testDetector(filename) {
  const image = sharp("C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/" + filename).removeAlpha();
  const metadata = await image.metadata();
  const raw = await image.raw().toBuffer();
  
  const detected = findReferenceGray(raw, metadata.width, metadata.height);
  console.log(`${filename}: ${detected ? `Found at ${detected.x}, ${detected.y}` : "Not found"}`);
}

async function run() {
  await testDetector("mock_positive.png");
  await testDetector("mock_negative.png");
  await testDetector("mock_positive_dim.png");
  await testDetector("mock_inconclusive.png");
}
run();
