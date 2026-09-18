const fs = require('fs');
let code = fs.readFileSync('src/lib/engine.ts', 'utf8');

// Swap the strings in the returns
code = code.replace(/return \{ result: "positive", confidence: "high" \};/g, 'return { result: "TEMP", confidence: "high" };');
code = code.replace(/return \{ result: "negative", confidence: "high" \};/g, 'return { result: "positive", confidence: "high" };');
code = code.replace(/return \{ result: "TEMP", confidence: "high" \};/g, 'return { result: "negative", confidence: "high" };');

fs.writeFileSync('src/lib/engine.ts', code);
console.log("Swapped positive and negative in engine.ts");
