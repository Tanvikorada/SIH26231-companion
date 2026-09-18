const fs = require("fs");
let code = fs.readFileSync("src/app/layout.tsx", "utf8");

// inject manifest link
code = code.replace(/<head>/, `<head>\n        <link rel="manifest" href="/manifest.json" />\n        <meta name="theme-color" content="#0B192C" />\n        <link rel="apple-touch-icon" href="/icon-192.png" />`);

fs.writeFileSync("src/app/layout.tsx", code);
