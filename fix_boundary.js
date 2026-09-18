const fs = require('fs');
let code = fs.readFileSync('src/lib/engine.ts', 'utf8');

// Remove the boundary check
code = code.replace(/if \(deltaEBoundary <= MAX_DELTA_E\) \{[\s\S]*?\}/, '');

fs.writeFileSync('src/lib/engine.ts', code);
