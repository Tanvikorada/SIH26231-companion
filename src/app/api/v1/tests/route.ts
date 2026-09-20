import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LIST_FIELDS = {
  id: true, seq: true, operator_id: true, image_hash: true, gps_lat: true, gps_lng: true, captured_at: true,
  recorded_at: true, result: true, confidence: true, calibration_status: true, notes: true, reagent: true,
  record_hash: true, prev_hash: true, signature: true,
} satisfies Prisma.TestSelect;

/** Search: q (id / operator / hash prefix / notes / reagent), result, operator, from, to (YYYY-MM-DD), limit, offset. */
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const limit = Math.min(200, Math.max(1, parseInt(sp.get("limit") || "10") || 10));
    const offset = Math.max(0, parseInt(sp.get("offset") || "0") || 0);
    const and: Prisma.TestWhereInput[] = [];

    const q = (sp.get("q") || "").trim().slice(0, 100);
    if (q) {
      and.push({
        OR: [
          { id: { startsWith: q } },
          { operator_id: { contains: q, mode: "insensitive" } },
          { image_hash: { startsWith: q.toLowerCase() } },
          { record_hash: { startsWith: q.toLowerCase() } },
          { notes: { contains: q, mode: "insensitive" } },
          { reagent: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    const result = sp.get("result");
    if (result && ["positive", "negative", "inconclusive"].includes(result)) and.push({ result });
    const operator = (sp.get("operator") || "").trim();
    if (operator) and.push({ operator_id: { equals: operator, mode: "insensitive" } });
    const from = sp.get("from"), to = sp.get("to");
    const range: Prisma.DateTimeFilter = {};
    if (from && !Number.isNaN(Date.parse(from))) range.gte = new Date(from);
    if (to && !Number.isNaN(Date.parse(to))) range.lt = new Date(new Date(to).getTime() + 24 * 3600 * 1000);
    if (range.gte || range.lt) and.push({ captured_at: range });

    const where: Prisma.TestWhereInput = and.length ? { AND: and } : {};
    const [data, total] = await Promise.all([
      prisma.test.findMany({ where, orderBy: { captured_at: "desc" }, take: limit, skip: offset, select: LIST_FIELDS }),
      prisma.test.count({ where }),
    ]);
    return NextResponse.json({ data, total, limit, offset });
  } catch (error: any) {
    console.error("List API Error:", error);
    return NextResponse.json({ error: "Failed to load records" }, { status: 500 });
  }
}
