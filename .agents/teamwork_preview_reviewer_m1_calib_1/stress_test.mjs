import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

async function runStressTests() {
  const { createServer } = await import("vite");
  const server = await createServer({
    root: PROJECT_ROOT,
    logLevel: "silent",
    server: { middlewareMode: true },
  });

  try {
    const enginePath = path.resolve(PROJECT_ROOT, "src/lib/engine.ts");
    const engine = await server.ssrLoadModule(enginePath);
    console.log("Vite loaded engine successfully.");

    let allPassed = true;
    function assert(condition, name) {
      if (condition) {
        console.log(`  PASS: ${name}`);
      } else {
        console.error(`  FAIL: ${name}`);
        allPassed = false;
      }
    }

    console.log("\n--- Stress Testing rgb2lab ---");
    const labBlack = engine.rgb2lab([0, 0, 0]);
    assert(!isNaN(labBlack[0]) && !isNaN(labBlack[1]) && !isNaN(labBlack[2]), "rgb2lab([0,0,0]) produces no NaN");
    assert(Math.abs(labBlack[0]) < 0.1, "rgb2lab([0,0,0]) lightness is ~0");

    const labWhite = engine.rgb2lab([255, 255, 255]);
    assert(!isNaN(labWhite[0]) && !isNaN(labWhite[1]) && !isNaN(labWhite[2]), "rgb2lab([255,255,255]) produces no NaN");
    assert(Math.abs(labWhite[0] - 100) < 0.5, "rgb2lab([255,255,255]) lightness is ~100");

    console.log("\n--- Stress Testing deltaE00 Math & Edge Cases ---");
    const dZero = engine.deltaE00([50, 0, 0], [50, 0, 0]);
    assert(dZero === 0, "deltaE00 identical achromatics is exactly 0");

    const dZeroC = engine.deltaE00([0, 0, 0], [100, 0, 0]);
    assert(!isNaN(dZeroC) && dZeroC > 0, `deltaE00 pure black to pure white is valid number (${dZeroC})`);

    // Zero chroma guard: C1' * C2' === 0
    const dZeroGuard = engine.deltaE00([50, 0, 0], [50, 20, 30]);
    assert(!isNaN(dZeroGuard) && dZeroGuard > 0, `deltaE00 with one achromatic sample evaluates without NaN (${dZeroGuard})`);

    // Angle wrap test around 180 degrees
    const dWrap1 = engine.deltaE00([50, 20, 1], [50, -20, -1]);
    const dWrap2 = engine.deltaE00([50, -20, -1], [50, 20, 1]);
    assert(Math.abs(dWrap1 - dWrap2) < 1e-9, `deltaE00 symmetry across 180 deg boundary (${dWrap1} vs ${dWrap2})`);

    // Effect of kL = 1.5 vs kL = 1.0
    const dLightness10 = engine.deltaE00([50, 20, 20], [60, 20, 20], 1.0);
    const dLightness15 = engine.deltaE00([50, 20, 20], [60, 20, 20], 1.5);
    assert(dLightness15 < dLightness10, `kL=1.5 dampens lightness difference (${dLightness15.toFixed(3)} < ${dLightness10.toFixed(3)})`);

    console.log("\n--- Stress Testing calibrateColor Boundary & Noise Rejection ---");
    // Boundary lumaWhite < 20
    const calNoise1 = engine.calibrateColor([100, 150, 200], [0, 0, 0]);
    assert(calNoise1[0] === 100 && calNoise1[1] === 150 && calNoise1[2] === 200, "calibrateColor with [0,0,0] white returns raw spot unchanged");

    const calNoise2 = engine.calibrateColor([100, 150, 200], [10, 10, 10]);
    assert(calNoise2[0] === 100 && calNoise2[1] === 150 && calNoise2[2] === 200, "calibrateColor with [10,10,10] (luma 10 < 20) returns raw spot unchanged");

    const calNoise19 = engine.calibrateColor([100, 150, 200], [19, 19, 19]);
    assert(calNoise19[0] === 100 && calNoise19[1] === 150 && calNoise19[2] === 200, "calibrateColor with [19,19,19] (luma 19 < 20) returns raw spot unchanged");

    const calActive20 = engine.calibrateColor([10, 15, 20], [20, 20, 20]);
    assert(calActive20[0] > 10 && calActive20[1] > 15 && calActive20[2] > 20, `calibrateColor activates at luma=20 (${JSON.stringify(calActive20)})`);

    // Clamping to 255
    const calClamp = engine.calibrateColor([200, 200, 200], [50, 50, 50]);
    assert(calClamp[0] === 255 && calClamp[1] === 255 && calClamp[2] === 255, "calibrateColor clamps overflow to 255");

    console.log("\n--- Stress Testing classifySpotTest ---");
    const resEmpty = engine.classifySpotTest([100, 100, 100], "NonExistent");
    assert(resEmpty.result === "inconclusive" && resEmpty.distance === 999, "classifySpotTest with unknown reagent returns inconclusive/999");

    const resMarquisPos = engine.classifySpotTest([16, 6, 13], "Marquis");
    assert(resMarquisPos.result === "positive" && resMarquisPos.distance < 8.0, `Marquis positive classified correctly (${resMarquisPos.result}, d=${resMarquisPos.distance.toFixed(2)})`);

    const resMarquisNeg = engine.classifySpotTest([215, 209, 199], "Marquis");
    assert(resMarquisNeg.result === "negative" && resMarquisNeg.distance < 12.0, `Marquis negative classified correctly (${resMarquisNeg.result}, d=${resMarquisNeg.distance.toFixed(2)})`);

    const resUnrelated = engine.classifySpotTest([0, 0, 255], "Marquis");
    assert(resUnrelated.result === "inconclusive", `Unrelated blue against Marquis is inconclusive (${resUnrelated.result})`);

    console.log("\n--- Stress Testing generateSHA256 ---");
    const testBuf = new TextEncoder().encode("NCB-EVIDENCE").buffer;
    const hash = await engine.generateSHA256(testBuf);
    assert(hash === "8aa06e253f8047776bfa4cfaa39e749c6088506012f5bb799bf907024494cce6", `SHA256 matches test vector (${hash})`);

    console.log(`\nOverall Stress Test Verdict: ${allPassed ? "ALL TESTS PASSED" : "FAILURES DETECTED"}`);
  } finally {
    await server.close();
  }
}

runStressTests().catch((e) => {
  console.error("Stress test runner error:", e);
  process.exit(1);
});
