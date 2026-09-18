import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    
    const tests = await prisma.test.findMany({
      orderBy: { captured_at: "desc" },
      take: limit,
    });
    
    return NextResponse.json({ data: tests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
