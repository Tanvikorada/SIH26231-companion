const sharp = require("sharp");

async function scan() {
  const path = "C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/mock_positive.png"; 
  const image = sharp(path).removeAlpha();
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;
  
  const buffer = await image.raw().toBuffer();
  
  for (let y = 5; y <= 95; y += 10) {
    let row = "";
    for (let x = 5; x <= 95; x += 10) {
      const px = Math.floor(x * width / 100);
      const py = Math.floor(y * height / 100);
      const idx = (py * width + px) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      
      if (Math.abs(r-128) < 40 && Math.abs(g-128) < 40 && Math.abs(b-128) < 40) {
         row += "G ";
      } else if (Math.abs(r-59) < 40 && Math.abs(g-125) < 40 && Math.abs(b-59) < 40) {
         row += "T ";
      } else if (r > 240 && g > 240 && b > 240) {
         row += "W "; // Also includes the off-white background
      } else if (r < 40 && g < 40 && b < 40) {
         row += "B ";
      } else if (r > 150 && g < 50 && b < 50) {
         row += "R ";
      } else {
         row += "? ";
      }
    }
    console.log(`Y=${y}%: ${row}`);
  }
}
scan();
