import { describe, it, expect } from "vitest";
import sharp from "sharp";
import path from "node:path";
import { analyzeLateralFlow } from "./lateralflow";

const dir = path.resolve(__dirname, "../../test-images");
async function run(name: string) {
  const { data, info } = await sharp(path.join(dir, `${name}.jpg`)).raw().toBuffer({ resolveWithObject: true });
  return analyzeLateralFlow({ data, width: info.width, height: info.height, channels: info.channels });
}
const verdicts = (r: Awaited<ReturnType<typeof run>>) => r!.panels.map((p) => p.verdict);

describe("lateral flow line reading", () => {
  it("all C+T => all negative", async () => {
    const r = await run("cup_all_negative");
    expect(verdicts(r)).toEqual(Array(5).fill("negative"));
    expect(r!.result).toBe("negative");
  });
  it("control-only panels => positive", async () => {
    const r = await run("cup_cocaine_thc_positive");
    expect(verdicts(r)).toEqual(["positive", "negative", "positive", "negative", "negative"]);
    expect(r!.result).toBe("positive");
  });
  it("faint test line still counts as a line (negative)", async () => {
    expect(verdicts(await run("cup_faint_test_lines_negative"))).toEqual(Array(5).fill("negative"));
  });
  it("missing control line => invalid", async () => {
    const r = await run("cup_invalid_no_control");
    expect(r!.panels[1].verdict).toBe("invalid");
    expect(r!.result).toBe("inconclusive");
  });
  it("dim warm light still reads correctly", async () => {
    expect(verdicts(await run("cup_opiates_positive_dim_warm"))).toEqual(["negative", "positive", "negative", "negative", "negative"]);
  });
  it("photo rotated so C is on the left still reads correctly", async () => {
    const r = await run("cup_amphetamine_positive_landscape");
    expect(r!.orientation).toBe("horizontal");
    expect(r!.result).toBe("positive");
    expect(r!.panels.filter((p) => p.verdict === "positive")).toHaveLength(1);
  });
  it("returns null when there are no lines", async () => {
    const img = await sharp({ create: { width: 640, height: 480, channels: 3, background: { r: 200, g: 200, b: 200 } } }).raw().toBuffer({ resolveWithObject: true });
    expect(analyzeLateralFlow({ data: img.data, width: 640, height: 480, channels: 3 })).toBeNull();
  });
});

describe("control line position (C must be at the top end)", () => {
  async function rotated(name: string, deg: number) {
    const { data, info } = await sharp(path.join(dir, `${name}.jpg`)).rotate(deg).raw().toBuffer({ resolveWithObject: true });
    return analyzeLateralFlow({ data, width: info.width, height: info.height, channels: info.channels })!;
  }
  it("reports a control line near the top of the window for a positive panel", async () => {
    const r = (await run("cup_cocaine_thc_positive"))!;
    const pos = r.panels.filter((p) => p.verdict === "positive");
    expect(pos).toHaveLength(2);
    for (const p of pos) expect(p.firstLinePos).toBeGreaterThan(0.15);
    for (const p of pos) expect(p.firstLinePos).toBeLessThan(0.45);
  });
  it("upside-down cup: single lines sit at the bottom => invalid, never positive", async () => {
    const r = await rotated("cup_cocaine_thc_positive", 180);
    expect(r.panels.filter((p) => p.verdict === "positive")).toHaveLength(0);
    expect(r.panels.filter((p) => p.verdict === "invalid")).toHaveLength(2);
  });
  it("panel with only a test-position line is invalid", async () => {
    const r = (await run("cup_invalid_no_control"))!;
    expect(r.panels[1].firstLinePos).toBeGreaterThan(0.5);
  });
});
