// "use client";

// import React, { useState, useEffect } from "react";
// import MainPlayer from "./MainPlayer";
// import Playlist from "./Playlist";
// import Sidebar from "./Sidebar";
// import { getSongDetailsFromGenius } from "../../util/geniusClient.js";

// // 이 컴포넌트가 기존 page.js의 모든 클라이언트 사이드 역할을 담당합니다.
// export default function MusicPlayerClient(props) {
//   console.log(props.initialPlaylist);

//   // initialPlaylist를 안전하게 변환하여 초기 상태로 사용
//   const [playlist, setPlaylist] = useState(() => {
//     // 컴포넌트가 처음 마운트될 때 한 번만 실행되도록 함수형으로 초기화
//     if (!props.initialPlaylist) return []; // initialPlaylist가 없으면 빈 배열 반환

//     return props.initialPlaylist.map((item) => ({
//       _id: item._id ? item._id.toString() : null,
//       videoId: item.videoId ? String(item.videoId).split("?")[0] : null, // ?si= 같은 파라미터 제거
//       title: item.title ?? "제목 없음",
//       artist: item.artist ?? "아티스트 정보 없음",
//     }));
//   });

//   // 현재 재생할 곡의 인덱스를 상태로 관리
//   const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

//   const [geniusData, setGeniusData] = useState(null);
//   const currentTrack = playlist[currentTrackIndex];

//   // API 호출 로직 (필요하다면)
//   // useEffect(() => {
//   //   // 예시: async function fetchPlaylist() { ... }
//   //   // 여기서는 초기 데이터를 그냥 사용합니다.
//   // }, []);
//   useEffect(() => {
//     if (currentTrack && currentTrack.title && currentTrack.artist) {
//       // 새 노래가 시작되면 이전 데이터를 초기화
//       setGeniusData(null);

//       getSongDetailsFromGenius(currentTrack.title, currentTrack.artist).then(
//         (data) => {
//           if (data) {
//             setGeniusData(data);
//             console.log("Genius 데이터:", data);
//           }
//         }
//       );
//     }
//   }, [currentTrack]); // currentTrack이 바뀔 때마다 이 효과가 실행됩니다.

//   // 현재 재생할 곡 정보

//   const handleTrackSelect = (index) => {
//     setCurrentTrackIndex(index);
//   };

//   return (
//     // MainPlayer와 Playlist를 함께 렌더링
//     <>
//       <Sidebar />
//       <div className="flex flex-col flex-grow gap-4">
//         {currentTrack && <MainPlayer track={playlist} />}
//       </div>
//       <Playlist
//         track={playlist}
//         currentTrackIndex={currentTrackIndex}
//         onTrackSelect={handleTrackSelect}
//       />
//     </>
//   );
// }

// MusicPlayerClient.jsx

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import MainPlayer from "./MainPlayer";
import Playlist from "./Playlist";
import Sidebar from "./Sidebar";
import { getSongDetailsFromGenius } from "../../util/geniusClient.js";

// 제목/아티스트 정제 유틸
const stripBrackets = (s) =>
  String(s || "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*\)/g, "");
const normalizeSpaces = (s) =>
  String(s || "")
    .replace(/\s{2,}/g, " ")
    .trim();

const sanitizeTitle = (raw) => {
  let t = stripBrackets(raw);
  // 불필요한 키워드 제거
  t = t.replace(
    /\b(official|music\s*video|mv|lyric(s)?|audio|teaser|trailer|live|performance|ver\.?|version)\b/gi,
    ""
  );
  // feat. 이후 제거(선택)
  t = t.replace(/\b(feat|ft)\.?.*$/i, "");
  t = normalizeSpaces(t);
  return t || String(raw || "").trim();
};

const sanitizeArtist = (raw) => {
  let a = stripBrackets(raw);
  a = a.replace(/\s*-\s*topic\b/gi, ""); // "- Topic" 제거
  a = a.replace(/\b(vevo|official)\b/gi, ""); // VEVO/Official 제거
  a = normalizeSpaces(a);
  return a;
};

const buildGeniusQuery = (videoData, fallbackTrack) => {
  const rawTitle = videoData?.title ?? fallbackTrack?.title ?? "";
  const rawArtist = videoData?.author ?? fallbackTrack?.artist ?? "";
  const title = sanitizeTitle(rawTitle);
  const artist = sanitizeArtist(rawArtist);
  return {
    title: title || fallbackTrack?.title || "",
    artist: artist || fallbackTrack?.artist || "",
  };
};

// 응답이 혹시 다른 스키마여도 평탄화 보정(보호막)
const normalizeGenius = (res) => {
  if (!res) return null;
  // 이미 평탄화된 형태
  if (res.songTitle || res.artistName || res.albumArt) return res;
  // 혹시 { ok, data } 형태가 들어오면 data만
  if (res.data) return res.data;
  return null;
};

export default function MusicPlayerClient(props) {
  const [playlist, setPlaylist] = useState(() => {
    if (!props.initialPlaylist) return [];
    return props.initialPlaylist.map((item) => ({
      _id: item._id ? item._id.toString() : null,
      videoId: item.videoId ? String(item.videoId).split("?")[0] : null,
      title: item.title ?? "제목 없음",
      artist: item.artist ?? "아티스트 정보 없음",
    }));
  });

  const [geniusData, setGeniusData] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // 레이스 방지용 요청 id
  const lastReqIdRef = useRef(0);

  const handleYoutubeData = useCallback(
    (videoData) => {
      setGeniusData(null);
      const reqId = ++lastReqIdRef.current;

      const fallbackTrack = playlist[currentTrackIndex];
      const { title, artist } = buildGeniusQuery(videoData, fallbackTrack);
      const expectedVideoId = fallbackTrack?.videoId;

      getSongDetailsFromGenius(title, artist).then((raw) => {
        // 요청 id가 최신이 아니면 무시(이전 트랙의 늦게 온 응답 방지)
        if (reqId !== lastReqIdRef.current) return;

        const normalized = normalizeGenius(raw);
        // 트랙이 바뀌었거나 데이터가 없으면 무시
        if (!normalized) return;
        // 현재 선택된 트랙의 videoId가 여전히 동일할 때만 반영
        if (expectedVideoId !== playlist[currentTrackIndex]?.videoId) return;

        setGeniusData(normalized);
        console.log("Genius 데이터(정규화):", normalized);
      });
    },
    [playlist, currentTrackIndex]
  );

  return (
    <>
      <Sidebar />
      <div className="flex flex-col flex-grow gap-4">
        {playlist.length > 0 && (
          <MainPlayer
            track={playlist}
            currentTrackIndex={currentTrackIndex}
            onTrackData={handleYoutubeData}
            onNextTrack={() =>
              setCurrentTrackIndex((i) => (i + 1) % playlist.length)
            }
            onPrevTrack={() =>
              setCurrentTrackIndex(
                (i) => (i - 1 + playlist.length) % playlist.length
              )
            }
            albumArt={geniusData?.albumArt}
            geniusData={geniusData} // ✅ Genius 데이터 전체 전달
          />
        )}
      </div>
      <Playlist
        track={playlist}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={setCurrentTrackIndex}
      />
    </>
  );
}
