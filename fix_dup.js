const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/tests/route.ts', 'utf8');

// The duplicate lines:
// const refStats = await image.extract({ left: refX - 10, top: refY - 10, width: 20, height: 20 }).stats();
// const testStats = await image.extract({ left: testX - 10, top: testY - 10, width: 20, height: 20 }).stats();
// const testStats = await image.extract({ left: testX - 5, top: testY - 5, width: 10, height: 10 }).stats();

// Just manually strip out the duplicate `const testStats` and `const refStats`
code = code.replace(/const testStats = await image\.extract\(\{ left: testX - 5, top: testY - 5, width: 10, height: 10 \}\)\.stats\(\);\n/, '');

fs.writeFileSync('src/app/api/v1/tests/route.ts', code);
