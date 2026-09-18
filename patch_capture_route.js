const fs = require("fs");
let code = fs.readFileSync("src/app/capture/page.tsx", "utf8");
code = code.replace(/router\.push\(`\/processing\/\$\{data\.id\}`\);/, 'router.push(`/result/${data.id}`);');
fs.writeFileSync("src/app/capture/page.tsx", code);
