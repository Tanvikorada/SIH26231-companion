const fs = require("fs");
const data = JSON.parse(fs.readFileSync("logs.json", "utf8"));
console.log(JSON.stringify(data.data.slice(0, 3), null, 2));
