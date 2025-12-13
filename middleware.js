import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. 퍼블릭 경로 및 정적 파일 패스 (로그인 페이지, 이미지 등은 제외)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // 2. 쿠키 존재 여부만 확인 (Lightweight Check)
  // 백엔드 통신 없이, 쿠키 헤더가 있는지만 빠르게 보고 통과시킵니다.
  const hasCookie =
    req.headers.get("cookie") && req.headers.get("cookie").length > 0;

  if (hasCookie) {
    // 쿠키가 있으면 일단 통과! (진짜 유효성 검사는 채팅 페이지에서 브라우저가 수행)
    return NextResponse.next();
  }

  // 3. 쿠키 없으면 로그인 페이지로 튕겨냄
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // 채팅 경로 하위의 모든 페이지에 미들웨어 적용
  matcher: ["/chating/:path*"],
};
