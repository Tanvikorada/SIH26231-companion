const fs = require("fs");
let code = fs.readFileSync("src/app/capture/page.tsx", "utf8");

code = code.replace(/<option value="Marquis">Marquis Reagent<\/option>/, `
                    <option value="Auto-Detect (Lateral Flow)">Auto-Detect (Lateral Flow Cassette)</option>
                    <option value="Marquis">Marquis Reagent</option>`);

// Also change the default state to Auto-Detect so it just works for them instantly
code = code.replace(/const \[reagent, setReagent\] = useState\("Marquis"\);/, 'const [reagent, setReagent] = useState("Auto-Detect (Lateral Flow)");');

fs.writeFileSync("src/app/capture/page.tsx", code);
