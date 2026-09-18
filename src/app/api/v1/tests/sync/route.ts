import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const testRecord = await prisma.test.create({
      data: {
        operator_id: data.operator_id || "NCB-OP-109",
        image_path: data.base64Image,
        image_hash: data.image_hash,
        gps_lat: data.gps_lat ? parseFloat(data.gps_lat) : null,
        gps_lng: data.gps_lng ? parseFloat(data.gps_lng) : null,
        captured_at: new Date(data.captured_at),
        result: data.result,
        confidence: data.confidence,
        calibration_status: "calibrated",
        notes: data.notes || `Reagent: ${data.reagent}`
      }
    });

    return NextResponse.json({ success: true, id: testRecord.id }, { status: 201 });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync" }, { status: 500 });
  }
}
