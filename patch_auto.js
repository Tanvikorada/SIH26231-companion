const fs = require("fs");
const db = JSON.parse(fs.readFileSync("src/lib/color_library.json", "utf8"));

// The green line from the old lateral flow mock was roughly 59, 125, 59.
// The blank background was roughly 217, 164, 65 or white.
db.push({
  reagent: "Auto-Detect (Lateral Flow)",
  drug: "General Narcotic",
  positive_rgb: [59, 125, 59],
  negative_rgb: [217, 164, 65]
});

fs.writeFileSync("src/lib/color_library.json", JSON.stringify(db, null, 2));
