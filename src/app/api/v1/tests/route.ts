import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import sharp from "sharp";
import { calibrateColor, classifyResult, RGB } from "@/lib/engine";

// Helper to find the 18% Gray patch by first finding the pure Red patch of the calibration card
function findReferenceGray(buffer: Buffer, width: number, height: number): {x: number, y: number} | null {
  // Scan for the Red patch (high R, low G, low B)
  let redPixels = [];
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      if (r > 180 && g < 70 && b < 70) {
        redPixels.push({x, y});
      }
    }
  }

  if (redPixels.length === 0) return null;

  // Find center of Red blob
  const avgRedX = Math.floor(redPixels.reduce((sum, p) => sum + p.x, 0) / redPixels.length);
  const avgRedY = Math.floor(redPixels.reduce((sum, p) => sum + p.y, 0) / redPixels.length);

  // The Gray patch is always to the left of the Red patch on the SIH26231 v1 card (and AI images)
  // We'll scan leftwards from the red center until we hit neutral gray (R~G~B)
  for (let x = avgRedX - 10; x > 0; x -= 5) {
    const idx = (avgRedY * width + x) * 3;
    const r = buffer[idx];
    const g = buffer[idx+1];
    const b = buffer[idx+2];
    
    // Check if neutral and in gray range (e.g., not white, not black)
    const isNeutral = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
    const isMidTone = r > 60 && r < 200; // Not black, not white

    if (isNeutral && isMidTone) {
       // We found the gray patch center
       return { x, y: avgRedY };
    }
  }

  return null; 
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const operator_id = formData.get("operator_id") as string;
    const captured_at = formData.get("captured_at") as string;
    const gps_lat = formData.get("gps_lat") as string;
    const gps_lng = formData.get("gps_lng") as string;

    if (!imageFile || !operator_id || !captured_at) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const hashSum = crypto.createHash("sha256");
    hashSum.update(imageBuffer);
    const image_hash = hashSum.digest("hex");

    const image = sharp(imageBuffer).removeAlpha();
    const metadata = await image.metadata();
    const width = metadata.width || 640;
    const height = metadata.height || 480;

    const rawBuffer = await image.raw().toBuffer();
    
    // 1. SMART AUTO-DETECT REFERENCE CARD
    let refX = Math.floor(width * 0.12); // fallback
    let refY = Math.floor(height * 0.40); // fallback
    const detectedGray = findReferenceGray(rawBuffer, width, height);
    
    if (detectedGray) {
      refX = detectedGray.x;
      refY = detectedGray.y;
      console.log(`Auto-detected Gray Reference at X:${refX}, Y:${refY}`);
    } else {
      console.log("Auto-detect failed, using fallback coordinates.");
    }

    // 2. TEST STRIP TARGETING
    // In real-world rapid test readers (like FDA-approved COVID apps), 
    // finding a completely missing test line (Negative result) via code is impossible without YOLO ML. 
    // The industry standard is fixed-guide alignment for the cassette.
    const testX = Math.floor(width * 0.70);
    const testY = Math.floor(height * 0.30);

    const refStats = await image.extract({ left: refX - 5, top: refY - 5, width: 10, height: 10 }).stats();
    const testStats = await image.extract({ left: testX - 5, top: testY - 5, width: 10, height: 10 }).stats();

    const capturedRef: RGB = { r: refStats.channels[0].mean, g: refStats.channels[1].mean, b: refStats.channels[2].mean };
    const capturedTest: RGB = { r: testStats.channels[0].mean, g: testStats.channels[1].mean, b: testStats.channels[2].mean };

    let calibration_status = detectedGray ? "calibrated" : "calibrated_fallback";
    if (capturedRef.r < 10 && capturedRef.g < 10 && capturedRef.b < 10) {
      calibration_status = "failed_no_reference_card";
    }

    let result = "inconclusive";
    let confidence = "low";

    if (calibration_status.startsWith("calibrated")) {
      const calibratedTest = calibrateColor(capturedTest, capturedRef);
      const classification = classifyResult(calibratedTest);
      result = classification.result;
      confidence = classification.confidence;
    }

    // In Vercel serverless, we cannot write to disk. 
    // We'll compress the image and store it as a Base64 string directly in the database.
    const compressedBuffer = await sharp(imageBuffer)
      .resize({ width: 800 }) // compress for DB storage
      .jpeg({ quality: 75 })
      .toBuffer();
    const base64Image = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;

    const testRecord = await prisma.test.create({
      data: {
        operator_id,
        image_path: base64Image,
        image_hash,
        gps_lat: gps_lat ? parseFloat(gps_lat) : null,
        gps_lng: gps_lng ? parseFloat(gps_lng) : null,
        captured_at: new Date(captured_at),
        result,
        confidence,
        calibration_status,
      }
    });

    return NextResponse.json(testRecord);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const result = searchParams.get("result");
  const operator_id = searchParams.get("operator_id");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const where: any = {};
  if (result) where.result = result;
  if (operator_id) where.operator_id = operator_id;

  const tests = await prisma.test.findMany({
    where,
    orderBy: { captured_at: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.test.count({ where });

  return NextResponse.json({
    data: tests,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
