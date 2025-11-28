export { default } from "next-auth/middleware";

export const config = {
  // 로그인 페이지, API, 정적 파일 등을 제외한 모든 경로를 보호합니다.
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};