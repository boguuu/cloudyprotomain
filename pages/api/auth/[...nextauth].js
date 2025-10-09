import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { connectDB } from "@/util/database";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:
        "664719290061-1qjm6s4kc3koiltokb7rv3e3o660kg2n.apps.googleusercontent.com",
      clientSecret: "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",
    }),
  ],
  secret: "qwertyuiopasdfghjklzxcvbnm123456",
  adapter: MongoDBAdapter(connectDB),
};

export default NextAuth(authOptions);
