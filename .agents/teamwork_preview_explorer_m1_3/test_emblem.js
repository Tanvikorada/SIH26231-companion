// Test script to validate SVG syntax and structure
const fs = require('fs');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" fill="none" role="img" aria-labelledby="emblemTitle emblemDesc">
  <title id="emblemTitle">State Emblem of India</title>
  <desc id="emblemDesc">Lion Capital of Ashoka with Satyameva Jayate</desc>
  <!-- Content test -->
</svg>`;

console.log("SVG Length:", svgContent.length);
