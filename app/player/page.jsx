import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectDB } from "@/util/database";
import MusicPlayerClient from "@/app/components/MusicPlayerClient";
import Sidebar from "@/app/components/Sidebar";

export default async function PlayerPage() {
  //   const cookieStore = cookies();
  //   const authToken = cookieStore.get("authToken");

  //   if (!authToken) {
  //     redirect("/login");
  //   }

  // MongoDB에서 플레이리스트 가져오기
  const client =
    typeof connectDB === "function" ? await connectDB() : await connectDB;
  const db = client.db("cloudytest");
  const initialPlaylist = await db.collection("playlist").find().toArray();

  const safePlaylist = initialPlaylist.map((item) => ({
    _id: item._id ? item._id.toString() : null,
    videoId: item.videoId ? String(item.videoId) : null,
    title: item.title ?? null,
    artist: item.artist ?? null,
  }));

  return (
    <div className="w-full max-w-7xl flex gap-4">
      <MusicPlayerClient initialPlaylist={safePlaylist} />
    </div>
  );
}
