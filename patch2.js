const fs = require("fs");
let code = fs.readFileSync("src/app/api/v1/tests/route.ts", "utf8");

code = code.replace(/const classification = classifyResult\(calibratedTest\);/, `
      const reagent = formData.get("reagent")?.toString() || "Marquis";
      const classification = classifySpotTest(calibratedTest, reagent);
`);
code = code.replace(/result: classification\.result,/, `result: classification.result,
        notes: classification.notes || formData.get("notes")?.toString(),`);

fs.writeFileSync("src/app/api/v1/tests/route.ts", code);
