const https = require("https");
https.get("https://sih26231-companion.vercel.app/api/v1/tests?limit=3", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    const json = JSON.parse(data);
    json.data.forEach(t => {
      console.log(`ID: ${t.id} | Reagent: ${t.reagent || t.notes} | Result: ${t.result} | Captured At: ${t.captured_at}`);
    });
  });
});
