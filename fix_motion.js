const fs = require("fs");
let code = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");
code = code.replace('const container = {', 'const container: any = {');
code = code.replace('const item = {', 'const item: any = {');
fs.writeFileSync("src/app/dashboard/page.tsx", code);
