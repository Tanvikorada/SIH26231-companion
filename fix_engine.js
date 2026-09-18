const fs = require('fs');
let code = fs.readFileSync('src/lib/engine.ts', 'utf8');

// Increase MAX_DELTA_E from 12 to 35
code = code.replace(/const MAX_DELTA_E = 12;/, 'const MAX_DELTA_E = 35;');

fs.writeFileSync('src/lib/engine.ts', code);
