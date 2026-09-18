const https = require("https");
https.get("https://sih26231-companion.vercel.app/api/v1/tests", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log(JSON.stringify(JSON.parse(data), null, 2)));
});
