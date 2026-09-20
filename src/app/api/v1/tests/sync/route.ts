import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { GENESIS, RecordFields, SESSION_COOKIE, SIG_VERSION, computeRecordHash, readSession, sha256Hex, signHash } from "@/lib/record";

const RESULTS = ["positive", "negative", "inconclusive"];
const CONFIDENCE = ["high", "estimated", "low"];
const CALIBRATION = ["calibrated", "estimated", "uncalibrated"];
const MAX_IMAGE_BYTES = 3_500_000;
const CLOCK_SKEW_FLAG_MS = 5 * 60 * 1000;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const session = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return bad("Not signed in", 401);

  let data: any;
  try {
    data = await req.json();
  } catch {
    return bad("Invalid JSON");
  }

  if (!RESULTS.includes(data.result)) return bad("Invalid result");
  if (!CONFIDENCE.includes(data.confidence)) return bad("Invalid confidence");
  const calibration = CALIBRATION.includes(data.calibration_status) ? data.calibration_status : "calibrated";

  // The image bytes we sign are the bytes we received: recompute the hash server-side.
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(data.base64Image || ""));
  if (!m) return bad("Evidence image must be a base64 JPEG data URL");
  const bytes = Buffer.from(m[1], "base64");
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) return bad("Evidence image size out of range");
  const imageHash = sha256Hex(bytes);
  if (data.image_hash !== imageHash) return bad("Image hash does not match the uploaded image", 422);

  const capturedAt = new Date(data.captured_at);
  if (Number.isNaN(capturedAt.getTime())) return bad("Invalid captured_at");

  const lat = data.gps_lat == null || data.gps_lat === "" ? null : Number(data.gps_lat);
  const lng = data.gps_lng == null || data.gps_lng === "" ? null : Number(data.gps_lng);
  if ((lat !== null && !(Math.abs(lat) <= 90)) || (lng !== null && !(Math.abs(lng) <= 180))) return bad("Invalid GPS coordinates");

  const recordedAt = new Date();
  const skew = recordedAt.getTime() - capturedAt.getTime();
  const noteParts = [typeof data.notes === "string" ? data.notes.slice(0, 500) : ""];
  if (Math.abs(skew) > CLOCK_SKEW_FLAG_MS) noteParts.push(`CLOCK-SKEW: device time differs from server by ${Math.round(skew / 1000)}s`);
  if (lat === null || lng === null) noteParts.push("GPS-UNAVAILABLE");
  const notes = noteParts.filter(Boolean).join(" | ") || null;

  const id = crypto.randomUUID();
  const fields: RecordFields = {
    id,
    operator_id: session.op, // identity comes from the session, never from the client body
    image_hash: imageHash,
    gps_lat: lat,
    gps_lng: lng,
    captured_at: capturedAt.toISOString(),
    recorded_at: recordedAt.toISOString(),
    result: data.result,
    confidence: data.confidence,
    calibration_status: calibration,
    reagent: typeof data.reagent === "string" ? data.reagent.slice(0, 80) : null,
    notes,
  };

  try {
    let created: { id: string; record_hash: string | null; seq: number } | null = null;
    for (let attempt = 0; attempt < 4 && !created; attempt++) {
      try {
        created = await prisma.$transaction(
          async (tx) => {
            const last = await tx.test.findFirst({ where: { record_hash: { not: null } }, orderBy: { seq: "desc" }, select: { record_hash: true } });
            const prev = last?.record_hash ?? GENESIS;
            const recordHash = computeRecordHash(fields, prev);
            return tx.test.create({
              data: {
                id,
                operator_id: fields.operator_id,
                image_path: m[0],
                image_hash: imageHash,
                gps_lat: lat,
                gps_lng: lng,
                captured_at: capturedAt,
                recorded_at: recordedAt,
                result: fields.result,
                confidence: fields.confidence,
                calibration_status: calibration,
                notes,
                reagent: fields.reagent,
                prev_hash: prev,
                record_hash: recordHash,
                signature: signHash(recordHash),
                sig_version: SIG_VERSION,
              },
              select: { id: true, record_hash: true, seq: true },
            });
          },
          { isolationLevel: "Serializable" }
        );
      } catch (e: any) {
        if (e?.code !== "P2034" && e?.code !== "P2002") throw e; // retry only chain-race conflicts
      }
    }
    if (!created) return bad("Could not append to the record chain, retry", 503);
    return NextResponse.json({ success: true, id: created.id, record_hash: created.record_hash, seq: created.seq }, { status: 201 });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return bad("Failed to save record", 500);
  }
}
