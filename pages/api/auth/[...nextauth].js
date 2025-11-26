import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/util/database"; // 수정됨: { connectDB } -> clientPromise (default import)

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // YouTube API 사용을 위한 필수 권한들
          scope: "openid email profile https://www.googleapis.com/auth/youtube",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  // MongoDB를 사용하더라도 JWT 세션을 강제하여 로그인 속도를 높이고 Google 토큰을 토큰 내부에 저장합니다.
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // 1. JWT 생성 시: Google이 준 Access Token을 우리 쪽 토큰에 저장
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token; // refresh token은 없을 수도 있음
      }
      return token;
    },
    // 2. 세션 조회 시: 클라이언트(프론트엔드)가 토큰에 접근할 수 있도록 세션에 포함
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise), // 수정됨: 올바른 DB 연결 객체 전달
};

export default NextAuth(authOptions);
