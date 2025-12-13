import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 정적 파일 및 로그인 페이지 제외
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // 백엔드 통신 없이 쿠키 헤더 존재 여부만 확인
  const hasCookie =
    req.headers.get("cookie") && req.headers.get("cookie").length > 0;

  if (hasCookie) {
    return NextResponse.next();
  }

  // 쿠키 없으면 로그인 페이지로
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
