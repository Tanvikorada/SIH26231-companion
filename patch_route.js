const fs = require("fs");
let code = fs.readFileSync("src/app/api/v1/tests/route.ts", "utf8");

code = code.replace(/import \{ calibrateColor, classifyResult, RGB \} from "@\/lib\/engine";/, 'import { calibrateColor, classifySpotTest, RGB } from "@/lib/engine";');
code = code.replace(/const resultStats = classifyResult\(calibrated\);/, `
    const reagent = formData.get("reagent")?.toString() || "Marquis";
    const resultStats = classifySpotTest(calibrated, reagent);
`);
code = code.replace(/result: resultStats\.result,/, `result: resultStats.result,
        notes: resultStats.notes || formData.get("notes")?.toString(),`);

fs.writeFileSync("src/app/api/v1/tests/route.ts", code);
