import { connectDB } from "@/util/database";
import { fetchGeniusDataForSong } from "@/util/geniusApiServer"; // 1단계에서 만든 함수
import MusicPlayerClient from "@/app/components/MusicPlayerClient"; // 클라이언트 컴포넌트

export default async function PlaylistPage() {
  // 1. DB에서 재생 목록을 가져옵니다.
  const db = (await connectDB).db("cloudytest");
  const initialPlaylist = await db.collection("playlist").find().toArray();

  // 2. 각 노래에 대해 Genius API를 병렬로 호출합니다. (Promise.all로 성능 최적화)
  const geniusDataPromises = initialPlaylist.map((song) =>
    fetchGeniusDataForSong(song.title, song.artist)
  );
  const geniusResults = await Promise.all(geniusDataPromises);

  // 3. 기존 재생 목록 데이터에 Genius 데이터를 합칩니다.
  const enrichedPlaylist = initialPlaylist.map((song, index) => {
    const geniusData = geniusResults[index];
    return {
      ...song, // 기존 DB 데이터 (_id, videoId 등)
      _id: song._id.toString(), // _id 직렬화
      genius: geniusData, // 해당 노래의 Genius 정보 (없으면 null)
    };
  });

  // 4. 모든 정보가 합쳐진 최종 데이터를 클라이언트 컴포넌트에 prop으로 전달합니다.
  return <MusicPlayerClient initialPlaylist={enrichedPlaylist} />;
}
