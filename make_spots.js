const sharp = require('sharp');
const fs = require('fs');

async function createMock(type) {
  const width = 800;
  const height = 500;
  
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="100%" height="100%" fill="#E0E5E0" />
    
    <!-- Color Card (Left Side) -->
    <rect x="50" y="200" width="100" height="100" fill="#FF0000" />
    <rect x="150" y="200" width="100" height="100" fill="#808080" />
    <rect x="50" y="300" width="100" height="100" fill="#000000" />
    <rect x="150" y="300" width="100" height="100" fill="#FFFFFF" />
    
    <!-- Spot Test Area (Right Side, y = 50% -> 250) -->
    <circle cx="560" cy="250" r="40" fill="${type === 'positive' ? '#3B7D3B' : '#D9A441'}" />
    
    <!-- Text -->
    <text x="560" y="320" font-family="monospace" font-size="20" text-anchor="middle" fill="#555">
      ${type.toUpperCase()} TEST
    </text>
  </svg>`;

  await sharp(Buffer.from(svg)).toFile(`C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/spot_mock_${type}.png`);
}

createMock('positive').then(() => createMock('negative'));
