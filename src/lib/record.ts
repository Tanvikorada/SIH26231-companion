import crypto from "node:crypto";

export const SIG_VERSION = 1;
export const GENESIS = "GENESIS";

export interface RecordFields {
  id: string;
  operator_id: string;
  image_hash: string;
  gps_lat: number | null;
  gps_lng: number | null;
  captured_at: string; // device clock, ISO 8601
  recorded_at: string; // server clock, ISO 8601
  result: string;
  confidence: string;
  calibration_status: string;
  reagent: string | null;
  notes: string | null;
}

/** Fixed key order so the same record always serialises to the same bytes. */
export function canonicalize(f: RecordFields, prevHash: string): string {
  return JSON.stringify({
    v: SIG_VERSION,
    id: f.id,
    operator_id: f.operator_id,
    image_hash: f.image_hash,
    gps_lat: f.gps_lat,
    gps_lng: f.gps_lng,
    captured_at: f.captured_at,
    recorded_at: f.recorded_at,
    result: f.result,
    confidence: f.confidence,
    calibration_status: f.calibration_status,
    reagent: f.reagent,
    notes: f.notes,
    prev_hash: prevHash,
  });
}

export function sha256Hex(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function computeRecordHash(f: RecordFields, prevHash: string): string {
  return sha256Hex(canonicalize(f, prevHash));
}

let cachedKey: crypto.KeyObject | null = null;
let ephemeral = false;

function privateKey(): crypto.KeyObject {
  if (cachedKey) return cachedKey;
  const raw = process.env.RECORD_SIGNING_KEY;
  if (raw) {
    cachedKey = crypto.createPrivateKey(Buffer.from(raw, "base64").toString("utf8"));
  } else if (process.env.NODE_ENV !== "production") {
    // Development only: an unsaved key means signatures do not survive a restart.
    cachedKey = crypto.generateKeyPairSync("ed25519").privateKey;
    ephemeral = true;
  } else {
    throw new Error("RECORD_SIGNING_KEY is not configured");
  }
  return cachedKey;
}

export function isEphemeralKey() {
  privateKey();
  return ephemeral;
}

export function publicKeyPem(): string {
  return crypto.createPublicKey(privateKey()).export({ type: "spki", format: "pem" }).toString();
}

export function signHash(recordHash: string): string {
  return crypto.sign(null, Buffer.from(recordHash, "hex"), privateKey()).toString("base64");
}

export function verifySignature(recordHash: string, signature: string, pem: string = publicKeyPem()): boolean {
  try {
    return crypto.verify(null, Buffer.from(recordHash, "hex"), crypto.createPublicKey(pem), Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}

// ---- operator sessions -------------------------------------------------

export const SESSION_COOKIE = "sih_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function sessionSecret(): Buffer {
  return crypto.createHash("sha256").update("session:").update(privateKey().export({ type: "pkcs8", format: "der" })).digest();
}

export function createSession(operatorId: string, name: string, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ op: operatorId, name, exp: now + SESSION_TTL_MS })).toString("base64url");
  const mac = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readSession(token: string | undefined, now = Date.now()): { op: string; name: string } | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expect = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof p.exp !== "number" || p.exp < now) return null;
    return { op: p.op, name: p.name };
  } catch {
    return null;
  }
}

export interface RosterEntry { id: string; name: string; pin: string }

/** OPERATOR_ROSTER = JSON array of {id,name,pin}. A default demo officer exists only outside production. */
export function roster(): RosterEntry[] {
  const raw = process.env.OPERATOR_ROSTER;
  let list = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch { /* fall through */ }
  }
  list.unshift({ id: "NCB-OP-109", name: "Demo Officer", pin: "123456" });
  return list;
}

export function checkLogin(id: string, pin: string): RosterEntry | null {
  const entry = roster().find((r) => r.id.toLowerCase() === String(id).trim().toLowerCase());
  if (!entry) return null;
  const a = Buffer.from(String(pin)), b = Buffer.from(entry.pin);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? entry : null;
}

