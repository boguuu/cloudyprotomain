import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 퍼블릭 경로 패스
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // 로컬 개발은 우회
  const host = req.headers.get("host") || "";
  if (host.startsWith("localhost")) {
    return NextResponse.next();
  }

  // 백엔드 세션 확인
  try {
    const meRes = await fetch("https://api.cloudify.lol/api/me", {
      method: "GET",
      headers: { cookie: req.headers.get("cookie") || "" },
      cache: "no-store",
    });
    if (meRes.ok) return NextResponse.next();
  } catch (_) {
    // ignore
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/chating/:path*"],
};
