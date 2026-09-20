import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, checkLogin, createSession } from "@/lib/record";

// Best-effort per-instance throttle; the PIN space is small, so this is a prototype-level control.
const attempts = new Map<string, { n: number; t: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && now - a.t < WINDOW_MS && a.n >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });
  }

  let body: any = {};
  try { body = await req.json(); } catch { /* handled below */ }
  const entry = checkLogin(body.operator_id ?? "", body.pin ?? "");
  if (!entry) {
    attempts.set(ip, a && now - a.t < WINDOW_MS ? { n: a.n + 1, t: a.t } : { n: 1, t: now });
    return NextResponse.json({ error: "Invalid operator ID or PIN" }, { status: 401 });
  }
  attempts.delete(ip);

  const res = NextResponse.json({ success: true, operator_id: entry.id, name: entry.name });
  res.cookies.set(SESSION_COOKIE, createSession(entry.id, entry.name), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return res;
}
