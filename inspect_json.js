const fs = require("fs");
const data = JSON.parse(fs.readFileSync("spot_test_library.json"));
console.log(data.slice(0, 10));
