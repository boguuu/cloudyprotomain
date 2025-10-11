import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { connectDB } from "@/util/database";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token || token.accessToken;
        token.refreshToken = account.refresh_token || token.refreshToken;
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : token.expiresAt;
        token.provider = account.provider || token.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token?.accessToken ?? null;
      session.refreshToken = token?.refreshToken ?? null;
      session.expiresAt = token?.expiresAt ?? null;
      session.provider = token?.provider ?? null;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(connectDB),
};

export default NextAuth(authOptions);
