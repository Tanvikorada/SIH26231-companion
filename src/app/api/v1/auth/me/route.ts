import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/record";

export async function GET(req: NextRequest) {
  const s = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!s) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ operator_id: s.op, name: s.name });
}
