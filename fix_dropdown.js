const fs = require("fs");
let code = fs.readFileSync("src/app/capture/page.tsx", "utf8");

code = code.replace('<option value="Ferric Sulfate">', '<option value="Ferric">');
code = code.replace('<option value="Nitric Acid">', '<option value="Nitric">');
code = code.replace('<option value="Wagner Test">', '<option value="Wagner">');
code = code.replace('<option value="Cobalt Thiocyanate">', '<option value="Cobalt">');
code = code.replace('<option value="Simon Test">', '<option value="Simon">');

fs.writeFileSync("src/app/capture/page.tsx", code);
console.log("Dropdown fixed");
