const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/tests/route.ts', 'utf8');

code = code.replace(/detectedGray/g, 'detected');

fs.writeFileSync('src/app/api/v1/tests/route.ts', code);
