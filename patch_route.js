const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/tests/route.ts', 'utf8');

// Replace the old findReferenceGray function with the 360-degree spatial scanner
const newFindFunc = `function findReferenceGray(buffer: Buffer, width: number, height: number): { x: number, y: number, refX: number, refY: number, orientation: string } | null {
  let redPixels = [];
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      // Find the bright red patch
      if (r > 150 && g < 80 && b < 80) {
        redPixels.push({x, y});
      }
    }
  }

  if (redPixels.length === 0) return null;

  const avgRedX = Math.floor(redPixels.reduce((sum, p) => sum + p.x, 0) / redPixels.length);
  const avgRedY = Math.floor(redPixels.reduce((sum, p) => sum + p.y, 0) / redPixels.length);

  // Scan for Gray in all 4 directions
  const directions = [
    { dx: -1, dy: 0, name: "left" },
    { dx: 1, dy: 0, name: "right" },
    { dx: 0, dy: -1, name: "up" },
    { dx: 0, dy: 1, name: "down" }
  ];

  for (const dir of directions) {
    for (let step = 20; step < Math.max(width, height) / 2; step += 10) {
      const x = avgRedX + (dir.dx * step);
      const y = avgRedY + (dir.dy * step);
      if (x < 0 || x >= width || y < 0 || y >= height) break;
      
      const idx = (y * width + x) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      
      const isNeutral = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
      const isMidTone = r > 80 && r < 180; 

      if (isNeutral && isMidTone) {
         return { x: avgRedX, y: avgRedY, refX: x, refY: y, orientation: dir.name };
      }
    }
  }
  return { x: avgRedX, y: avgRedY, refX: avgRedX, refY: avgRedY, orientation: "unknown" }; 
}`;

code = code.replace(/function findReferenceGray[\s\S]*?return null; \n\}/, newFindFunc);

// Replace the Targeting Logic
const newTargeting = `    // 1. SMART AUTO-DETECT REFERENCE CARD
    let refX = Math.floor(width * 0.12);
    let refY = Math.floor(height * 0.40);
    let testX = Math.floor(width * 0.70);
    let testY = Math.floor(height * 0.50);

    const detected = findReferenceGray(rawBuffer, width, height);
    
    if (detected && detected.orientation !== "unknown") {
      refX = detected.refX;
      refY = detected.refY;
      
      // Dynamic Spatial Cassette Targeting!
      // If the color card (Red) is on the right side of the image, the cassette is on the left.
      if (detected.x > width / 2) {
         testX = Math.floor(width * 0.35); // Target left side
      } else {
         testX = Math.floor(width * 0.65); // Target right side
      }
      
      // The Test 'T' line is generally right in the middle
      testY = Math.floor(height * 0.50);
      
      console.log(\`Auto-detected Gray at \${refX},\${refY} (Cassette at \${testX},\${testY})\`);
    } else {
      console.log("Auto-detect failed, using fallback coordinates.");
    }

    const refStats = await image.extract({ left: refX - 10, top: refY - 10, width: 20, height: 20 }).stats();
    const testStats = await image.extract({ left: testX - 10, top: testY - 10, width: 20, height: 20 }).stats();`;

code = code.replace(/\/\/ 1\. SMART AUTO-DETECT REFERENCE CARD[\s\S]*?width: 10, height: 10 \}\)\.stats\(\);/, newTargeting);

fs.writeFileSync('src/app/api/v1/tests/route.ts', code);
