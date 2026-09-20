import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GENESIS, RecordFields, computeRecordHash, sha256Hex, verifySignature } from "@/lib/record";

export interface VerifyChecks {
  signature: boolean;
  record_hash: boolean;
  image_hash: boolean;
  chain_link: boolean | null;
  chain_note: string;
}

/** Public, read-only: anyone can check a record id (or its record hash) without signing in. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await prisma.test.findFirst({ where: { OR: [{ id }, { record_hash: id }] } });
  if (!t) return NextResponse.json({ error: "Record not found" }, { status: 404 });

  const summary = {
    id: t.id, seq: t.seq, operator_id: t.operator_id, result: t.result, confidence: t.confidence,
    captured_at: t.captured_at, recorded_at: t.recorded_at, gps_lat: t.gps_lat, gps_lng: t.gps_lng,
    image_hash: t.image_hash, record_hash: t.record_hash, prev_hash: t.prev_hash,
  };

  if (!t.record_hash || !t.signature || !t.prev_hash) {
    return NextResponse.json({ status: "unsigned", message: "Legacy record created before signing was introduced. Not tamper-evident.", record: summary });
  }

  const fields: RecordFields = {
    id: t.id, operator_id: t.operator_id, image_hash: t.image_hash, gps_lat: t.gps_lat, gps_lng: t.gps_lng,
    captured_at: t.captured_at.toISOString(), recorded_at: t.recorded_at.toISOString(), result: t.result,
    confidence: t.confidence, calibration_status: t.calibration_status, reagent: t.reagent, notes: t.notes,
  };

  const recomputed = computeRecordHash(fields, t.prev_hash);
  const imageBytes = Buffer.from(t.image_path.replace(/^data:image\/jpeg;base64,/, ""), "base64");

  let chainLink: boolean | null = null;
  let chainNote = "";
  if (t.prev_hash === GENESIS) {
    chainLink = true;
    chainNote = "First record in the signed chain.";
  } else {
    const prev = await prisma.test.findFirst({ where: { record_hash: t.prev_hash }, select: { seq: true } });
    chainLink = !!prev && prev.seq < t.seq;
    chainNote = chainLink ? "Previous record exists and precedes this one." : "Previous record is missing or out of order: the chain was altered.";
  }

  const checks: VerifyChecks = {
    signature: verifySignature(t.record_hash, t.signature),
    record_hash: recomputed === t.record_hash,
    image_hash: sha256Hex(imageBytes) === t.image_hash,
    chain_link: chainLink,
    chain_note: chainNote,
  };
  const ok = checks.signature && checks.record_hash && checks.image_hash && checks.chain_link === true;
  return NextResponse.json({ status: ok ? "valid" : "invalid", checks, record: summary });
}
