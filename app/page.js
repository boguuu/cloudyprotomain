import Image from "next/image";
import React from "react";
import { connectDB } from "@/util/database";
import LoginBtn from "./LoginBtn";
import MusicPlayerClient from "./components/MusicPlayerClient";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  // 인증 쿠키 체크는 개발 단계에서 비활성화
  // const cookieStore = cookies();
  // const authToken = cookieStore.get("authToken");
  // if (!authToken) {
  //   redirect("/login");
  // }
  // redirect("/chating");

  // 개발 단계: 항상 /login으로 이동
  redirect("/login");
}
