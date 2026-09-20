import { describe, it, expect } from "vitest";
import { GENESIS, RecordFields, checkLogin, computeRecordHash, createSession, publicKeyPem, readSession, signHash, verifySignature } from "./record";

const base: RecordFields = {
  id: "11111111-1111-1111-1111-111111111111", operator_id: "NCB-OP-109", image_hash: "a".repeat(64),
  gps_lat: 28.6139, gps_lng: 77.209, captured_at: "2026-09-20T10:00:00.000Z", recorded_at: "2026-09-20T10:00:03.000Z",
  result: "positive", confidence: "high", calibration_status: "calibrated", reagent: "Marquis", notes: null,
};

describe("signed record", () => {
  it("signature verifies for the untouched record", () => {
    const h = computeRecordHash(base, GENESIS);
    expect(verifySignature(h, signHash(h))).toBe(true);
  });
  it.each([
    ["result", { result: "negative" }],
    ["operator", { operator_id: "NCB-OP-999" }],
    ["gps", { gps_lat: 12.9 }],
    ["timestamp", { recorded_at: "2026-09-21T10:00:03.000Z" }],
    ["image hash", { image_hash: "b".repeat(64) }],
    ["notes", { notes: "edited" }],
  ])("changing %s changes the record hash so the old signature fails", (_n, change) => {
    const h = computeRecordHash(base, GENESIS);
    const sig = signHash(h);
    const h2 = computeRecordHash({ ...base, ...change } as RecordFields, GENESIS);
    expect(h2).not.toBe(h);
    expect(verifySignature(h2, sig)).toBe(false);
  });
  it("chain: changing an earlier record breaks the next record's prev_hash", () => {
    const h1 = computeRecordHash(base, GENESIS);
    const h2 = computeRecordHash({ ...base, id: "22222222-2222-2222-2222-222222222222" }, h1);
    const tampered = computeRecordHash({ ...base, result: "negative" }, GENESIS);
    expect(tampered).not.toBe(h1);
    expect(computeRecordHash({ ...base, id: "22222222-2222-2222-2222-222222222222" }, tampered)).not.toBe(h2);
  });
  it("a forged signature is rejected", () => {
    const h = computeRecordHash(base, GENESIS);
    expect(verifySignature(h, Buffer.from("x".repeat(64)).toString("base64"))).toBe(false);
    expect(publicKeyPem()).toContain("BEGIN PUBLIC KEY");
  });
});

describe("operator session", () => {
  it("round-trips", () => {
    expect(readSession(createSession("NCB-OP-109", "Demo"))).toEqual({ op: "NCB-OP-109", name: "Demo" });
  });
  it("rejects tampered and expired tokens", () => {
    const t = createSession("NCB-OP-109", "Demo");
    const [body, mac] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ op: "ADMIN", name: "x", exp: Date.now() + 1e9 })).toString("base64url");
    expect(readSession(`${forged}.${mac}`)).toBeNull();
    expect(readSession(`${body}.bad`)).toBeNull();
    expect(readSession(t, Date.now() + 13 * 3600 * 1000)).toBeNull();
    expect(readSession(undefined)).toBeNull();
  });
  it("login checks id and PIN", () => {
    expect(checkLogin("NCB-OP-109", "123456")?.id).toBe("NCB-OP-109");
    expect(checkLogin("NCB-OP-109", "000000")).toBeNull();
    expect(checkLogin("nobody", "123456")).toBeNull();
  });
});
