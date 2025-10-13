import Image from "next/image";
import React from "react";
import { connectDB } from "@/util/database";
import LoginBtn from "./LoginBtn";
import MusicPlayerClient from "./components/MusicPlayerClient";

export default async function Home() {
  const client =
    typeof connectDB === "function" ? await connectDB() : await connectDB;
  const db = client.db("cloudytest");
  const initialPlaylist = await db.collection("playlist").find().toArray();

  // plain object 배열로 강제 변환
  const safePlaylist = initialPlaylist.map((item) => ({
    _id: item._id ? item._id.toString() : null,
    videoId: item.videoId ? String(item.videoId) : null,
    title: item.title ?? null,
    artist: item.artist ?? null,
    // 필요한 다른 필드도 추가 변환
  }));

  // 서버 로그(터미널)
  // console.log("server safePlaylist[0].videoId:", safePlaylist[0]?.videoId);

  return (
    <div className="w-full max-w-6xl h-[600px] flex gap-4 text-white">
      <MusicPlayerClient initialPlaylist={safePlaylist} />
    </div>
  );
}
