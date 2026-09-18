const fs = require("fs");
const data = JSON.parse(fs.readFileSync("logs.json", "utf8"));
data.data.slice(0, 5).forEach(t => {
  console.log(`ID: ${t.id} | Reagent: ${t.reagent} | Result: ${t.result} | Notes: ${t.notes} | Captured At: ${t.captured_at}`);
});
