import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const total = await prisma.test.count();
  
  const positive = await prisma.test.count({ where: { result: "positive" } });
  const negative = await prisma.test.count({ where: { result: "negative" } });
  const inconclusive = await prisma.test.count({ where: { result: "inconclusive" } });
  const failed_calibration = await prisma.test.count({ where: { calibration_status: "failed_no_reference_card" } });

  return NextResponse.json({
    total_tests: total,
    by_result: { positive, negative, inconclusive },
    failed_calibration_count: failed_calibration,
  });
}
