import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import sharp from "sharp";
import { calibrateColor, classifySpotTest, RGB } from "@/lib/engine";

// Helper to find the 18% Gray patch by first finding the pure Red patch of the calibration card
function findReferenceGray(buffer: Buffer, width: number, height: number): { x: number, y: number, refX: number, refY: number, orientation: string } | null {
  let redPixels = [];
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      // Find the bright red patch
      if (r > 150 && g < 80 && b < 80) {
        redPixels.push({x, y});
      }
    }
  }

  if (redPixels.length === 0) return null;

  const avgRedX = Math.floor(redPixels.reduce((sum, p) => sum + p.x, 0) / redPixels.length);
  const avgRedY = Math.floor(redPixels.reduce((sum, p) => sum + p.y, 0) / redPixels.length);

  // Scan for Gray in all 4 directions
  const directions = [
    { dx: -1, dy: 0, name: "left" },
    { dx: 1, dy: 0, name: "right" },
    { dx: 0, dy: -1, name: "up" },
    { dx: 0, dy: 1, name: "down" }
  ];

  for (const dir of directions) {
    for (let step = 20; step < Math.max(width, height) / 2; step += 10) {
      const x = avgRedX + (dir.dx * step);
      const y = avgRedY + (dir.dy * step);
      if (x < 0 || x >= width || y < 0 || y >= height) break;
      
      const idx = (y * width + x) * 3;
      const r = buffer[idx];
      const g = buffer[idx+1];
      const b = buffer[idx+2];
      
      const isNeutral = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
      const isMidTone = r > 80 && r < 180; 

      if (isNeutral && isMidTone) {
         return { x: avgRedX, y: avgRedY, refX: x, refY: y, orientation: dir.name };
      }
    }
  }
  return { x: avgRedX, y: avgRedY, refX: avgRedX, refY: avgRedY, orientation: "unknown" }; 
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
    let refX = Math.floor(width * 0.12);
    let refY = Math.floor(height * 0.40);
    let testX = Math.floor(width * 0.70);
    let testY = Math.floor(height * 0.50);

    const detected = findReferenceGray(rawBuffer, width, height);
    
    if (detected && detected.orientation !== "unknown") {
      refX = detected.refX;
      refY = detected.refY;
      
      // Dynamic Spatial Cassette Targeting!
      // If the color card (Red) is on the right side of the image, the cassette is on the left.
      if (detected.x > width / 2) {
         testX = Math.floor(width * 0.35); // Target left side
      } else {
         testX = Math.floor(width * 0.65); // Target right side
      }
      
      // The Test 'T' line is generally right in the middle
      testY = Math.floor(height * 0.50);
      
      console.log(`Auto-detected Gray at ${refX},${refY} (Cassette at ${testX},${testY})`);
    } else {
      console.log("Auto-detect failed, using fallback coordinates.");
    }

    const refStats = await image.extract({ left: refX - 10, top: refY - 10, width: 20, height: 20 }).stats();
    const testStats = await image.extract({ left: testX - 10, top: testY - 10, width: 20, height: 20 }).stats();
    
    const capturedRef: RGB = { r: refStats.channels[0].mean, g: refStats.channels[1].mean, b: refStats.channels[2].mean };
    const capturedTest: RGB = { r: testStats.channels[0].mean, g: testStats.channels[1].mean, b: testStats.channels[2].mean };

    let calibration_status = detected ? "calibrated" : "calibrated_fallback";
    if (capturedRef.r < 10 && capturedRef.g < 10 && capturedRef.b < 10) {
      calibration_status = "failed_no_reference_card";
    }

    let result = "inconclusive";
    let confidence = "low";

    if (calibration_status.startsWith("calibrated")) {
      const calibratedTest = calibrateColor(capturedTest, capturedRef);
      
      const reagent = formData.get("reagent")?.toString() || "Marquis";
      const classification = classifySpotTest(calibratedTest, reagent);

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
