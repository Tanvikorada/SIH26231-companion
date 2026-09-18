const convert = require("color-convert");
const DeltaE = require("delta-e");

function rgbToLabObject(rgb) {
  const labArr = convert.rgb.lab([rgb.r, rgb.g, rgb.b]);
  return { L: labArr[0], A: labArr[1], B: labArr[2] };
}

const POS_LAB = rgbToLabObject({ r: 59, g: 125, b: 59 });
const NEG_LAB = rgbToLabObject({ r: 217, g: 164, b: 65 });

const greenLine = rgbToLabObject({ r: 106, g: 155, b: 123 }); // T line
const background = rgbToLabObject({ r: 214, g: 214, b: 214 }); // bg

console.log("Green Line vs POS:", DeltaE.getDeltaE00(greenLine, POS_LAB));
console.log("Green Line vs NEG:", DeltaE.getDeltaE00(greenLine, NEG_LAB));
console.log("Bg vs POS:", DeltaE.getDeltaE00(background, POS_LAB));
console.log("Bg vs NEG:", DeltaE.getDeltaE00(background, NEG_LAB));
