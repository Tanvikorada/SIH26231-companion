const fs = require("fs");
let code = fs.readFileSync("src/lib/engine.ts", "utf8");

code = code.replace(/let bestMatch = null;/, 'let bestMatch: string | undefined = undefined;');

fs.writeFileSync("src/lib/engine.ts", code);
