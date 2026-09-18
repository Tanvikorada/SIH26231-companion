const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const seed_tests = [
  { operator_id: "OFC-104", result: "negative", confidence: "high", captured_at: "2026-09-14T09:12:00+05:30", gps_lat: 13.0827, gps_lng: 80.2707, notes: "Chennai Central Checkpoint" },
  { operator_id: "OFC-104", result: "positive", confidence: "high", captured_at: "2026-09-14T10:40:00+05:30", gps_lat: 13.0674, gps_lng: 80.2376, notes: "T. Nagar Patrol" },
  { operator_id: "OFC-211", result: "inconclusive", confidence: "estimated", captured_at: "2026-09-15T08:05:00+05:30", gps_lat: 13.0500, gps_lng: 80.2121, notes: "Guindy Checkpoint" },
  { operator_id: "OFC-211", result: "negative", confidence: "high", captured_at: "2026-09-15T11:22:00+05:30", gps_lat: 13.0067, gps_lng: 80.2206, notes: "Adyar Junction" },
  { operator_id: "OFC-317", result: "positive", confidence: "high", captured_at: "2026-09-16T14:15:00+05:30", gps_lat: 13.0358, gps_lng: 80.2297, notes: "Mylapore Checkpoint" },
  { operator_id: "OFC-317", result: "negative", confidence: "high", captured_at: "2026-09-16T16:50:00+05:30", gps_lat: 13.0475, gps_lng: 80.2824, notes: "Perambur Patrol" },
  { operator_id: "OFC-104", result: "negative", confidence: "high", captured_at: "2026-09-17T09:30:00+05:30", gps_lat: 12.9950, gps_lng: 80.2200, notes: "Velachery Checkpoint" }
];

async function main() {
  await prisma.test.deleteMany(); // clear existing for a fresh demo

  for (const t of seed_tests) {
    const hashSum = crypto.createHash("sha256");
    hashSum.update(t.captured_at + t.result + Math.random().toString());
    const image_hash = hashSum.digest("hex");
    
    await prisma.test.create({
      data: {
        operator_id: t.operator_id,
        image_path: `/uploads/demo_cassette_${t.result}.png`,
        image_hash: image_hash,
        gps_lat: t.gps_lat,
        gps_lng: t.gps_lng,
        captured_at: new Date(t.captured_at),
        recorded_at: new Date(t.captured_at), // matching recorded_at
        result: t.result,
        confidence: t.confidence,
        calibration_status: "calibrated",
        notes: t.notes
      }
    });
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
