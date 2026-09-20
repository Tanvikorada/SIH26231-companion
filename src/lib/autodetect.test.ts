import { describe, it, expect } from "vitest";
import sharp from "sharp";
import path from "node:path";
import { autoDetectSpot } from "./autodetect";
import { classifySpotTest, calibrateColor } from "./engine";

const dir = path.resolve(__dirname, "../../test-images");
const cases: [string, string, string][] = [
  ["marquis_heroin_positive", "Marquis", "positive"],
  ["marquis_heroin_negative", "Marquis", "negative"],
  ["marquis_amphetamine_positive", "Marquis", "positive"],
  ["cobalt_cocaine_positive", "Cobalt", "positive"],
  ["cobalt_cocaine_negative", "Cobalt", "negative"],
  ["wagner_cocaine_positive", "Wagner", "positive"],
  ["marquis_heroin_positive_dim_light", "Marquis", "positive"],
  ["cobalt_cocaine_positive_warm_light", "Cobalt", "positive"],
];

async function load(file: string) {
  const { data, info } = await sharp(path.join(dir, file)).raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

describe("reference-free spot detection", () => {
  it.each(cases)("%s classifies correctly without a reference card", async (name, reagent, expected) => {
    const det = autoDetectSpot(await load(`${name}.jpg`));
    expect(det).not.toBeNull();
    // spot should be found near the drawn drop (65% / 50%)
    expect(Math.abs(det!.spotX / 1600 - 0.65)).toBeLessThan(0.05);
    expect(Math.abs(det!.spotY / 1067 - 0.5)).toBeLessThan(0.05);
    const res = classifySpotTest(calibrateColor(det!.spot, det!.white), reagent);
    expect(res.result).toBe(expected);
  });

  it("returns null for an image with no spot", async () => {
    const img = await sharp({ create: { width: 800, height: 600, channels: 3, background: { r: 120, g: 100, b: 80 } } }).raw().toBuffer({ resolveWithObject: true });
    expect(autoDetectSpot({ data: img.data, width: 800, height: 600, channels: 3 })).toBeNull();
  });
});

describe("reference-free robustness", () => {
  it("still works when the card is cropped out (spot + plate only)", async () => {
    const { data, info } = await sharp(path.join(dir, "cobalt_cocaine_positive.jpg")).extract({ left: 560, top: 200, width: 1040, height: 700 }).raw().toBuffer({ resolveWithObject: true });
    const det = autoDetectSpot({ data, width: info.width, height: info.height, channels: info.channels });
    expect(det).not.toBeNull();
    expect(classifySpotTest(calibrateColor(det!.spot, det!.white), "Cobalt").result).toBe("positive");
  });

  it("works on a phone-sized (12MP) image", async () => {
    const { data, info } = await sharp(path.join(dir, "marquis_heroin_positive.jpg")).resize(4000, 3000, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
    const t0 = Date.now();
    const det = autoDetectSpot({ data, width: info.width, height: info.height, channels: info.channels });
    expect(Date.now() - t0).toBeLessThan(3000);
    expect(det).not.toBeNull();
    expect(classifySpotTest(calibrateColor(det!.spot, det!.white), "Marquis").result).toBe("positive");
  });

  it("does not report a spot on a blurry low-contrast gray scene", async () => {
    const { data, info } = await sharp({ create: { width: 800, height: 600, channels: 3, noise: { type: "gaussian", mean: 200, sigma: 25 } } }).blur(4).raw().toBuffer({ resolveWithObject: true });
    expect(autoDetectSpot({ data, width: info.width, height: info.height, channels: 3 })).toBeNull();
  });
});
