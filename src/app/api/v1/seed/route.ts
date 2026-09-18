import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedData = [
  { "operator_id": "OFC-104", "result": "negative", "confidence": "high", "captured_at": "2026-09-14T09:12:00+05:30", "gps_lat": 13.0827, "gps_lng": 80.2707, "notes": "Chennai Central Checkpoint" },
  { "operator_id": "OFC-104", "result": "positive", "confidence": "high", "captured_at": "2026-09-14T10:40:00+05:30", "gps_lat": 13.0674, "gps_lng": 80.2376, "notes": "T. Nagar Patrol" },
  { "operator_id": "OFC-211", "result": "inconclusive", "confidence": "estimated", "captured_at": "2026-09-15T08:05:00+05:30", "gps_lat": 13.0500, "gps_lng": 80.2121, "notes": "Guindy Checkpoint" },
  { "operator_id": "OFC-211", "result": "negative", "confidence": "high", "captured_at": "2026-09-15T11:22:00+05:30", "gps_lat": 13.0067, "gps_lng": 80.2206, "notes": "Adyar Junction" },
  { "operator_id": "OFC-317", "result": "positive", "confidence": "high", "captured_at": "2026-09-16T14:15:00+05:30", "gps_lat": 13.0358, "gps_lng": 80.2297, "notes": "Mylapore Checkpoint" },
  { "operator_id": "OFC-317", "result": "negative", "confidence": "high", "captured_at": "2026-09-16T16:50:00+05:30", "gps_lat": 13.0475, "gps_lng": 80.2824, "notes": "Perambur Patrol" },
  { "operator_id": "OFC-104", "result": "negative", "confidence": "high", "captured_at": "2026-09-17T09:30:00+05:30", "gps_lat": 12.9950, "gps_lng": 80.2200, "notes": "Velachery Checkpoint" }
];

export async function GET() {
  try {
    for (const item of seedData) {
      await prisma.test.create({
        data: {
          operator_id: item.operator_id,
          result: item.result,
          confidence: item.confidence,
          gps_lat: item.gps_lat,
          gps_lng: item.gps_lng,
          notes: item.notes,
          captured_at: new Date(item.captured_at),
          recorded_at: new Date(),
          calibration_status: "calibrated",
          image_hash: "seed_hash_" + Math.random().toString(36).substring(7),
          image_path: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
        }
      });
    }
    return NextResponse.json({ success: true, count: seedData.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
