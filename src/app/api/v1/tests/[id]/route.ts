import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await prisma.test.findUnique({
    where: { id },
  });

  if (!test) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(test);
}
