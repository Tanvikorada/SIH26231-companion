// Generate and validate State Emblem of India SVG
const fs = require('fs');
const path = require('path');

function generateChakraSpokes(cx, cy, rInner, rOuter, count = 24) {
  let spokes = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 360 / count) * (Math.PI / 180);
    const x1 = (cx + rInner * Math.cos(angle)).toFixed(2);
    const y1 = (cy + rInner * Math.sin(angle)).toFixed(2);
    const x2 = (cx + rOuter * Math.cos(angle)).toFixed(2);
    const y2 = (cy + rOuter * Math.sin(angle)).toFixed(2);
    spokes.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="0.8" />`);
  }
  return spokes.join('\n      ');
}

function generateBeads(startX, endX, y, spacing, radius = 1.2) {
  let beads = [];
  for (let x = startX; x <= endX; x += spacing) {
    beads.push(`<circle cx="${x.toFixed(1)}" cy="${y}" r="${radius}" fill="currentColor" />`);
  }
  return beads.join('\n      ');
}

const centralChakraSpokes = generateChakraSpokes(100, 164, 3, 12, 24);
const leftChakraSpokes = generateChakraSpokes(28, 164, 2, 8, 12);
const rightChakraSpokes = generateChakraSpokes(172, 164, 2, 8, 12);

const upperBeads = generateBeads(24, 176, 146, 4, 1.0);
const lowerBeads = generateBeads(24, 176, 181, 4, 1.0);

console.log("Central chakra spokes count:", 24);
console.log("Upper beads length:", upperBeads.length);
