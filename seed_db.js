const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

process.env.DATABASE_URL = "postgresql://postgres.ryfctbavghpypvngqjeb:DrugTestingHackathon123%21@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
process.env.DIRECT_URL = "postgresql://postgres.ryfctbavghpypvngqjeb:DrugTestingHackathon123%21@aws-0-us-east-1.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient();

const datasetStr = fs.readFileSync('C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789729959638.json', 'utf8');
const dataset = JSON.parse(datasetStr).seed_tests;

async function seed() {
  for (const item of dataset) {
    await prisma.test.create({
      data: {
        operator_id: item.operator_id,
        result: item.result,
        confidence: item.confidence,
        gps_lat: item.gps_lat,
        gps_lng: item.gps_lng,
        notes: item.location_note,
        captured_at: new Date(item.captured_at),
        recorded_at: new Date(),
        calibration_status: "calibrated",
        image_hash: "seed_hash_" + Math.random().toString(36).substring(7),
        image_path: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
      }
    });
  }
  console.log(`Successfully seeded ${dataset.length} records into the live database!`);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
