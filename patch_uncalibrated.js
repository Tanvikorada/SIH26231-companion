const fs = require("fs");
let code = fs.readFileSync("src/app/api/v1/tests/route.ts", "utf8");

// We need to change the logic for calibration_status and calibrateColor
const target = `    let calibration_status = detected ? "calibrated" : "calibrated_fallback";
    if (capturedRef.r < 10 && capturedRef.g < 10 && capturedRef.b < 10) {
      calibration_status = "failed_no_reference_card";
    }

    let result = "inconclusive";
    let confidence = "low";

    if (calibration_status.startsWith("calibrated")) {
      const calibratedTest = calibrateColor(capturedTest, capturedRef);
      
      const reagent = formData.get("reagent")?.toString() || "Marquis";
      const classification = classifySpotTest(calibratedTest, reagent);

      result = classification.result;
      confidence = classification.confidence;
    }`;

const replacement = `    let calibration_status = (detected && detected.orientation !== "unknown") ? "calibrated" : "uncalibrated";
    
    let result = "inconclusive";
    let confidence = "low";
    let notes = formData.get("notes")?.toString() || "";

    const reagent = formData.get("reagent")?.toString() || "Marquis";
    
    // If no card is found, do NOT corrupt the color by calibrating against a random background pixel.
    // Use the raw color, but cap the confidence since lighting might skew the reading.
    const finalTestColor = calibration_status === "calibrated" ? calibrateColor(capturedTest, capturedRef) : capturedTest;
    
    const classification = classifySpotTest(finalTestColor, reagent);
    result = classification.result;
    
    // Downgrade confidence if uncalibrated
    if (calibration_status === "uncalibrated" && classification.result !== "inconclusive") {
      confidence = "low";
      notes = "[WARNING: No color card detected. Raw uncalibrated color used.] " + (classification.notes || notes);
    } else {
      confidence = classification.confidence;
      notes = (classification.notes || "") + (notes ? " - " + notes : "");
    }`;

code = code.replace(target, replacement);

fs.writeFileSync("src/app/api/v1/tests/route.ts", code);
