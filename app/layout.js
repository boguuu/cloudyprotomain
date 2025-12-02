import localFont from "next/font/local";
import "./globals.css";
import React from "react";
import { connectDB } from "@/util/database";
import Providers from "./providers";
import { Cloud } from "lucide-react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "cloudify", // 앱 이름으로 변경
  description: "대화형 음악 추천 서비스", // 앱 설명으로 변경
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="aurora-bg" aria-hidden="true" />
        <Providers>{children}</Providers>
        <div />
      </body>
    </html>
  );
}
