const sharp = require('sharp');
const convert = require('color-convert');
const DeltaE = require('delta-e');

function rgbToLabObject(rgb) {
  const labArr = convert.rgb.lab([rgb.r, rgb.g, rgb.b]);
  return { L: labArr[0], A: labArr[1], B: labArr[2] };
}

function calibrateColor(capturedTestColor, capturedGrayColor) {
  const KNOWN_REFERENCE_COLOR = { r: 128, g: 128, b: 128 };
  const correctionFactor = {
    r: KNOWN_REFERENCE_COLOR.r / (capturedGrayColor.r || 1),
    g: KNOWN_REFERENCE_COLOR.g / (capturedGrayColor.g || 1),
    b: KNOWN_REFERENCE_COLOR.b / (capturedGrayColor.b || 1),
  };
  return {
    r: Math.min(255, Math.round(capturedTestColor.r * correctionFactor.r)),
    g: Math.min(255, Math.round(capturedTestColor.g * correctionFactor.g)),
    b: Math.min(255, Math.round(capturedTestColor.b * correctionFactor.b)),
  };
}

async function testEngine() {
  const imgPath = 'C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/mock_positive.png';
  const image = sharp(imgPath).removeAlpha();
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;
  const rawBuffer = await image.raw().toBuffer();

  let redPixels = [];
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 3;
      const r = rawBuffer[idx];
      const g = rawBuffer[idx+1];
      const b = rawBuffer[idx+2];
      if (r > 150 && g < 80 && b < 80) redPixels.push({x, y});
    }
  }

  console.log("Red Pixels count:", redPixels.length);
  if (redPixels.length === 0) { console.log("NO RED PATCH FOUND!"); return; }

  const avgRedX = Math.floor(redPixels.reduce((sum, p) => sum + p.x, 0) / redPixels.length);
  const avgRedY = Math.floor(redPixels.reduce((sum, p) => sum + p.y, 0) / redPixels.length);
  console.log(`Red Avg: ${avgRedX}, ${avgRedY}`);

  let detected = null;
  const directions = [{dx:-1,dy:0},{dx:1,dy:0},{dx:0,dy:-1},{dx:0,dy:1}];
  for (const dir of directions) {
    for (let step = 20; step < Math.max(width, height)/2; step += 10) {
      const x = avgRedX + dir.dx * step;
      const y = avgRedY + dir.dy * step;
      if (x < 0 || x >= width || y < 0 || y >= height) break;
      const idx = (y * width + x) * 3;
      const r = rawBuffer[idx], g = rawBuffer[idx+1], b = rawBuffer[idx+2];
      
      if (Math.abs(r-g)<20 && Math.abs(g-b)<20 && Math.abs(r-b)<20 && r>80 && r<180) {
        detected = {x:avgRedX, y:avgRedY, refX:x, refY:y};
        break;
      }
    }
    if (detected) break;
  }

  console.log("Detected Gray:", detected);

  let testX = Math.floor(width * 0.70);
  let testY = Math.floor(height * 0.50);
  let refX = Math.floor(width * 0.12);
  let refY = Math.floor(height * 0.40);

  if (detected) {
    refX = detected.refX; refY = detected.refY;
    if (detected.x > width / 2) testX = Math.floor(width * 0.35);
    else testX = Math.floor(width * 0.65);
    testY = Math.floor(height * 0.50);
  }

  console.log(`Sampling Ref at ${refX},${refY} and Test at ${testX},${testY}`);

  const refStats = await image.extract({ left: refX-10, top: refY-10, width:20, height:20 }).stats();
  const testStats = await image.extract({ left: testX-10, top: testY-10, width:20, height:20 }).stats();

  const cRef = {r: refStats.channels[0].mean, g: refStats.channels[1].mean, b: refStats.channels[2].mean};
  const cTest = {r: testStats.channels[0].mean, g: testStats.channels[1].mean, b: testStats.channels[2].mean};
  console.log("Captured Ref:", cRef);
  console.log("Captured Test:", cTest);

  const calTest = calibrateColor(cTest, cRef);
  console.log("Calibrated Test:", calTest);

  const pos = { r: 59, g: 125, b: 59 };
  const neg = { r: 217, g: 164, b: 65 };
  
  const sampleLab = rgbToLabObject(calTest);
  const dPos = DeltaE.getDeltaE00(sampleLab, rgbToLabObject(pos));
  const dNeg = DeltaE.getDeltaE00(sampleLab, rgbToLabObject(neg));
  console.log("Delta E to Positive:", dPos);
  console.log("Delta E to Negative:", dNeg);
}
testEngine();
