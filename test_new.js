const sharp = require("sharp");

function findFeatures(buffer, width, height) {
  let redPixels = [];
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      if (r > 150 && g < 80 && b < 80) {
        redPixels.push({x, y});
      }
    }
  }

  if (redPixels.length === 0) return { error: "No red found" };

  const avgRedX = Math.floor(redPixels.reduce((sum, p) => sum + p.x, 0) / redPixels.length);
  const avgRedY = Math.floor(redPixels.reduce((sum, p) => sum + p.y, 0) / redPixels.length);

  // Scan in 4 directions to find Gray
  let grayAnchor = null;
  const directions = [
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 },  // right
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }   // down
  ];

  for (const dir of directions) {
    for (let step = 10; step < Math.max(width, height); step += 5) {
      const x = avgRedX + (dir.dx * step);
      const y = avgRedY + (dir.dy * step);
      if (x < 0 || x >= width || y < 0 || y >= height) break;
      
      const idx = (y * width + x) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      
      const isNeutral = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
      const isMidTone = r > 80 && r < 180; 

      if (isNeutral && isMidTone) {
         grayAnchor = { x, y };
         break;
      }
    }
    if (grayAnchor) break;
  }

  // Find Cassette position
  // If Red is on the right side of the image, Cassette must be on the left.
  const cassetteX = avgRedX > width / 2 ? Math.floor(width * 0.35) : Math.floor(width * 0.65);
  // Cassette Y is usually in the middle
  const cassetteY = Math.floor(height * 0.45);

  return { avgRedX, avgRedY, grayAnchor, cassetteX, cassetteY };
}

async function testImage() {
  const image = sharp("C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789748280311.jpg").removeAlpha().resize(640, 640, { fit: 'inside' });
  const metadata = await image.metadata();
  const raw = await image.raw().toBuffer();
  
  const res = findFeatures(raw, metadata.width, metadata.height);
  console.log(res);
}
testImage();
