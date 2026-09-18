const fs = require("fs");
const path = require("path");

async function testApi() {
  const runTest = async (filename, expectedLabel) => {
    console.log(`\nTesting: ${filename} (Expecting: ${expectedLabel})`);
    
    const filePath = path.join("C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9", filename);
    const fileBuffer = fs.readFileSync(filePath);
    
    // In Node < 18 we'd need form-data package, but let's assume global fetch is available (Node 18+).
    // Node fetch requires Blob/File.
    const file = new File([fileBuffer], filename, { type: "image/png" });
    
    const formData = new FormData();
    formData.append("image", file);
    formData.append("operator_id", "AI_TEST_AGENT");
    formData.append("captured_at", new Date().toISOString());
    formData.append("gps_lat", "13.0827");
    formData.append("gps_lng", "80.2707");

    try {
      const res = await fetch("http://localhost:3001/api/v1/tests", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      console.log(`-> HTTP Status: ${res.status}`);
      console.log(`-> Calibration: ${data.calibration_status}`);
      console.log(`-> Result:      ${data.result.toUpperCase()}`);
      console.log(`-> Confidence:  ${data.confidence.toUpperCase()}`);
      
      if (data.result === expectedLabel) {
         console.log(`-> ✅ PASS`);
      } else {
         console.log(`-> ❌ FAIL`);
      }
    } catch (e) {
      console.error(`-> Error:`, e.message);
    }
  };

  await runTest("mock_positive.png", "positive");
  await runTest("mock_negative.png", "negative");
  await runTest("mock_positive_dim.png", "positive");
  await runTest("mock_inconclusive.png", "inconclusive");
}

testApi();
