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
        // 메인플레이어에 데이터 전달
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
