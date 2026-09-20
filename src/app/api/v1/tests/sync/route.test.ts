import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import { NextRequest } from "next/server";

// In-memory stand-in for the Prisma Test table (just the calls the routes make).
const { rows, tx, counter } = vi.hoisted(() => {
const rows: any[] = [];
const counter = { seq: 0 };
const tx = {
  test: {
    findFirst: async ({ where }: any) => {
      if (where?.OR) return rows.find((r) => where.OR.some((c: any) => (c.id && r.id === c.id) || (c.record_hash && r.record_hash === c.record_hash))) ?? null;
      if (where?.record_hash?.not === null) return [...rows].filter((r) => r.record_hash).sort((a, b) => b.seq - a.seq)[0] ?? null;
      if (typeof where?.record_hash === "string") return rows.find((r) => r.record_hash === where.record_hash) ?? null;
      return null;
    },
    create: async ({ data }: any) => {
      const row = { ...data, seq: ++counter.seq };
      rows.push(row);
      return { id: row.id, record_hash: row.record_hash, seq: row.seq };
    },
  },
};
return { rows, tx, counter };
});
vi.mock("@/lib/prisma", () => ({ prisma: { ...tx, $transaction: async (fn: any) => fn(tx) } }));

import { POST } from "./route";
import { GET as verify } from "../../verify/[id]/route";
import { SESSION_COOKIE, createSession } from "@/lib/record";

const jpeg = () => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), crypto.randomBytes(200)]);
function body(over: any = {}) {
  const bytes = jpeg();
  return {
    base64Image: "data:image/jpeg;base64," + bytes.toString("base64"),
    image_hash: crypto.createHash("sha256").update(bytes).digest("hex"),
    captured_at: new Date().toISOString(),
    result: "positive", confidence: "high", calibration_status: "calibrated", reagent: "Marquis",
    gps_lat: 28.6, gps_lng: 77.2,
    ...over,
  };
}
const post = (b: any, cookie = createSession("NCB-OP-109", "Demo Officer")) =>
  POST(new NextRequest("http://x/api/v1/tests/sync", { method: "POST", body: JSON.stringify(b), headers: { cookie: `${SESSION_COOKIE}=${cookie}`, "content-type": "application/json" } }));
const check = async (id: string) => (await verify(new Request("http://x"), { params: Promise.resolve({ id }) })).json();

beforeEach(() => { rows.length = 0; counter.seq = 0; });

describe("POST /tests/sync", () => {
  it("rejects requests without a valid session", async () => {
    const res = await POST(new NextRequest("http://x", { method: "POST", body: JSON.stringify(body()) }));
    expect(res.status).toBe(401);
    expect((await post(body(), "forged.token")).status).toBe(401);
  });
  it("rejects an image whose hash does not match the uploaded bytes", async () => {
    expect((await post(body({ image_hash: "0".repeat(64) }))).status).toBe(422);
  });
  it("takes the operator from the session, ignoring any client-supplied id", async () => {
    const res = await post(body({ operator_id: "SPOOFED" }));
    expect(res.status).toBe(201);
    expect(rows[0].operator_id).toBe("NCB-OP-109");
  });
  it("rejects invalid enums and coordinates", async () => {
    expect((await post(body({ result: "maybe" }))).status).toBe(400);
    expect((await post(body({ gps_lat: 999 }))).status).toBe(400);
  });
  it("flags missing GPS and device clock skew inside the signed notes", async () => {
    const res = await post(body({ gps_lat: null, gps_lng: null, captured_at: new Date(Date.now() - 3600_000).toISOString() }));
    expect(res.status).toBe(201);
    expect(rows[0].notes).toContain("GPS-UNAVAILABLE");
    expect(rows[0].notes).toContain("CLOCK-SKEW");
  });
});

describe("chain + verification", () => {
  it("chains records and verifies as valid", async () => {
    const a = await (await post(body())).json();
    const b = await (await post(body())).json();
    expect(rows[0].prev_hash).toBe("GENESIS");
    expect(rows[1].prev_hash).toBe(a.record_hash);
    expect((await check(a.id)).status).toBe("valid");
    expect((await check(b.id)).status).toBe("valid");
    expect((await check(b.record_hash)).status).toBe("valid"); // lookup by record hash too
  });
  it("detects an edited result", async () => {
    const a = await (await post(body())).json();
    rows[0].result = "negative";
    const v = await check(a.id);
    expect(v.status).toBe("invalid");
    expect(v.checks.record_hash).toBe(false);
  });
  it("detects a swapped evidence image", async () => {
    const a = await (await post(body())).json();
    rows[0].image_path = "data:image/jpeg;base64," + jpeg().toString("base64");
    const v = await check(a.id);
    expect(v.status).toBe("invalid");
    expect(v.checks.image_hash).toBe(false);
  });
  it("detects an edited record even if the attacker recomputes its hash (signature fails)", async () => {
    const a = await (await post(body())).json();
    rows[0].result = "negative";
    rows[0].record_hash = crypto.randomBytes(32).toString("hex");
    const v = await check(rows[0].id);
    expect(v.checks.signature).toBe(false);
    expect(v.status).toBe("invalid");
    void a;
  });
  it("detects a deleted earlier record", async () => {
    await post(body());
    const b = await (await post(body())).json();
    rows.shift();
    const v = await check(b.id);
    expect(v.status).toBe("invalid");
    expect(v.checks.chain_link).toBe(false);
  });
  it("reports legacy unsigned rows honestly and 404s unknown ids", async () => {
    rows.push({ id: "legacy-1", seq: 99, record_hash: null, signature: null, prev_hash: null, operator_id: "X", result: "negative", confidence: "high", captured_at: new Date(), recorded_at: new Date(), image_hash: "", image_path: "" });
    expect((await check("legacy-1")).status).toBe("unsigned");
    const res = await verify(new Request("http://x"), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});
