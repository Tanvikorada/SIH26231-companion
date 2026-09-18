const fs = require("fs");
let code = fs.readFileSync("src/app/capture/page.tsx", "utf8");
code = code.replace('const ctx = canvas.getContext("2d");', 'const ctx = canvas.getContext("2d", { willReadFrequently: true });');
fs.writeFileSync("src/app/capture/page.tsx", code);
