import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/record";

// Everything except these is for signed-in operators only.
const PUBLIC = [/^\/$/, /^\/login$/, /^\/verify(\/.*)?$/, /^\/api\/v1\/auth\/(login|logout|me)$/, /^\/api\/v1\/verify\/.+/, /^\/api\/v1\/public-key$/, /^\/api\/v1\/alerts$/];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((re) => re.test(pathname))) return NextResponse.next();
  if (readSession(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const url = new URL("/login", req.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|swe-worker.*|icons/.*|.*\.(?:png|jpg|jpeg|svg|ico|webp|json|txt|js|css|woff2?)$).*)"],
};
