// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import MainPlayer from "./MainPlayer";
// import Playlist from "./Playlist";
// import Sidebar from "./Sidebar";
// import { getSongDetailsFromGenius } from "../../util/geniusClient.js";

// // 제목/아티스트 정제 유틸
// const stripBrackets = (s) =>
//   String(s || "")
//     .replace(/\[[^\]]*\]/g, "")
//     .replace(/\([^)]*\)/g, "");
// const normalizeSpaces = (s) =>
//   String(s || "")
//     .replace(/\s{2,}/g, " ")
//     .trim();

// const sanitizeTitle = (raw) => {
//   let t = stripBrackets(raw);
//   t = t.replace(
//     /\b(official|music\s*video|mv|lyric(s)?|audio|teaser|trailer|live|performance|ver\.?|version)\b/gi,
//     ""
//   );
//   t = t.replace(/\b(feat|ft)\.?.*$/i, "");
//   t = normalizeSpaces(t);
//   return t || String(raw || "").trim();
// };

// const sanitizeArtist = (raw) => {
//   let a = stripBrackets(raw);
//   a = a.replace(/\s*-\s*topic\b/gi, "");
//   a = a.replace(/\b(vevo|official)\b/gi, "");
//   a = normalizeSpaces(a);
//   return a;
// };

// const buildGeniusQuery = (videoData, fallbackTrack) => {
//   const rawTitle = videoData?.title ?? fallbackTrack?.title ?? "";
//   const rawArtist = videoData?.author ?? fallbackTrack?.artist ?? "";
//   const title = sanitizeTitle(rawTitle);
//   const artist = sanitizeArtist(rawArtist);
//   return {
//     title: title || fallbackTrack?.title || "",
//     artist: artist || fallbackTrack?.artist || "",
//   };
// };

// const normalizeGenius = (res) => {
//   if (!res) return null;
//   if (res.songTitle || res.artistName) return res;

//   if (res.title || res.artist) {
//     return {
//       songTitle: res.title,
//       artistName: res.artist,
//       albumArt: res.albumArt,
//       lyrics: res.lyrics,
//     };
//   }

//   if (res.data) return normalizeGenius(res.data);
//   return null;
// };

// export default function MusicPlayerClient(props) {
//   const [playlist, setPlaylist] = useState(() => {
//     if (!props.initialPlaylist) return [];
//     return props.initialPlaylist.map((item) => ({
//       _id: item._id ? item._id.toString() : null,
//       videoId: item.videoId ? String(item.videoId).split("?")[0] : null,
//       title: item.title ?? "제목 없음",
//       artist: item.artist ?? "아티스트 정보 없음",
//     }));
//   });
//   console.log("client playlist:", playlist);

//   const [geniusDataById, setGeniusDataById] = useState({});
//   const [youtubeMetaById, setYoutubeMetaById] = useState({});
//   const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

//   // --- 1. 최신 인덱스 추적을 위한 useRef 추가 ---
//   const trackIndexRef = useRef(currentTrackIndex);
//   useEffect(() => {
//     trackIndexRef.current = currentTrackIndex;
//   }, [currentTrackIndex]);

//   const lastReqIdRef = useRef(0);

//   // --- 2. handleYoutubeData 로직 수정 ---
//   const handleYoutubeData = useCallback(
//     (videoData) => {
//       // useCallback의 클로저 문제를 해결하기 위해 ref에서 최신 인덱스를 가져옵니다.
//       const latestTrackIndex = trackIndexRef.current;
//       const currentTrack = playlist[latestTrackIndex];

//       if (!currentTrack || !currentTrack.videoId) return;

//       const videoId = currentTrack.videoId;

//       setYoutubeMetaById((prev) => ({
//         ...prev,
//         [videoId]: { title: videoData.title, artist: videoData.author },
//       }));

//       if (geniusDataById[videoId]) return;

//       const reqId = ++lastReqIdRef.current;
//       const { title, artist } = buildGeniusQuery(videoData, currentTrack);

//       getSongDetailsFromGenius(title, artist).then((raw) => {
//         if (reqId !== lastReqIdRef.current) return;

//         const normalized = normalizeGenius(raw);
//         if (!normalized) return;

//         // API 응답이 왔을 때도 ref의 최신 인덱스와 비교하여 정확성을 높입니다.
//         if (videoId === playlist[trackIndexRef.current]?.videoId) {
//           setGeniusDataById((prev) => ({ ...prev, [videoId]: normalized }));
//           console.log(`Genius 데이터 [${videoId}] 저장:`, normalized);
//         }
//       });
//     },
//     [playlist, geniusDataById] // 종속성 배열에서 currentTrackIndex 제거
//   );

//   const currentTrackVideoId = playlist[currentTrackIndex]?.videoId;
//   const currentGeniusData = currentTrackVideoId
//     ? geniusDataById[currentTrackVideoId]
//     : null;

//   return (
//     <>
//       <Sidebar />
//       <div className="flex flex-col flex-grow gap-4">
//         {playlist.length > 0 && (
//           <MainPlayer
//             track={playlist}
//             currentTrackIndex={currentTrackIndex}
//             onTrackData={handleYoutubeData}
//             onNextTrack={() =>
//               setCurrentTrackIndex((i) => (i + 1) % playlist.length)
//             }
//             onPrevTrack={() =>
//               setCurrentTrackIndex(
//                 (i) => (i - 1 + playlist.length) % playlist.length
//               )
//             }
//             geniusData={currentGeniusData}
//           />
//         )}
//       </div>
//       <Playlist
//         track={playlist}
//         currentTrackIndex={currentTrackIndex}
//         onTrackSelect={setCurrentTrackIndex}
//         geniusById={geniusDataById}
//         metaById={youtubeMetaById}
//       />
//     </>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import MainPlayer from "./MainPlayer";
import Playlist from "./Playlist";
import Sidebar from "./Sidebar";

// 백엔드 API를 호출하는 함수
async function fetchAllSongDetails(videoIds) {
  // videoId가 없으면 요청하지 않음
  if (!videoIds || videoIds.length === 0) {
    return {};
  }
  const response = await fetch(`/api/getSongDetails?ids=${videoIds.join(",")}`);
  if (!response.ok) {
    throw new Error("백엔드 서버에서 곡 정보들을 가져오는데 실패했습니다.");
  }
  return response.json();
}

export default function MusicPlayerClient(props) {
  const [playlist, setPlaylist] = useState(() => {
    if (!props.initialPlaylist) return [];
    return props.initialPlaylist.map((item) => ({
      _id: item._id ? item._id.toString() : null,
      videoId: item.videoId ? String(item.videoId).split("?")[0] : null,
      // 초기 데이터는 videoId만 있어도 충분
    }));
  });

  // YouTube와 Genius 데이터를 통합하여 관리
  const [songDataById, setSongDataById] = useState({});
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 데이터 로딩 useEffect ---
  useEffect(() => {
    const loadInitialData = async () => {
      if (!playlist || playlist.length === 0) {
        setIsLoading(false);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const videoIds = playlist.map((p) => p.videoId);
        const allData = await fetchAllSongDetails(videoIds);
        setSongDataById(allData);
        console.log("모든 곡 정보 로딩 완료:", allData);
      } catch (err) {
        console.error("곡 정보 로딩 중 에러 발생:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [playlist]); // playlist가 처음 설정될 때 한 번만 실행

  const currentTrackVideoId = playlist[currentTrackIndex]?.videoId;
  const currentSongData = currentTrackVideoId
    ? songDataById[currentTrackVideoId]
    : {};

  // geniusData와 youtubeMeta를 songDataById에서 추출
  const geniusDataById = {};
  const youtubeMetaById = {};
  Object.keys(songDataById).forEach((videoId) => {
    geniusDataById[videoId] = songDataById[videoId]?.genius;
    youtubeMetaById[videoId] = songDataById[videoId]?.youtube;
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>플레이리스트 정보를 불러오는 중입니다...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>오류: {error}</p>
        </div>
      );
    }
    if (playlist.length > 0) {
      return (
        <MainPlayer
          track={playlist}
          currentTrackIndex={currentTrackIndex}
          onNextTrack={() =>
            setCurrentTrackIndex((i) => (i + 1) % playlist.length)
          }
          onPrevTrack={() =>
            setCurrentTrackIndex(
              (i) => (i - 1 + playlist.length) % playlist.length
            )
          }
          geniusData={currentSongData?.genius} // 현재 곡의 Genius 데이터
          youtubeData={currentSongData?.youtube} // 현재 곡의 YouTube 데이터
        />
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        <p>플레이리스트가 비어있습니다.</p>
      </div>
    );
  };

  return (
    <>
      <Sidebar />
      <div className="flex flex-col flex-grow gap-4">{renderContent()}</div>
      <Playlist
        track={playlist}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={setCurrentTrackIndex}
        geniusById={geniusDataById}
        metaById={youtubeMetaById}
      />
    </>
  );
}
