const fs = require('fs');
let code = fs.readFileSync('src/lib/engine.ts', 'utf8');

code = code.replace(/\/\/ If within boundary threshold, automatically inconclusive\n  ;\n  \}/, '// Boundary check removed');

fs.writeFileSync('src/lib/engine.ts', code);
