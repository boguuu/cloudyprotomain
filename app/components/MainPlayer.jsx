"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Play,
  Shuffle,
  Repeat,
  Share2,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";

const glassmorphismStyle =
  "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg";

export default function MainPlayer(props) {
  // --- Props 처리 ---
  // 부모로부터 받은 props를 안전하게 처리합니다. 값이 없으면 기본값을 사용합니다.
  const track = props.track || [];
  const externalIndex =
    typeof props.currentTrackIndex === "number" ? props.currentTrackIndex : 0;
  const onTrackData = props.onTrackData || (() => {}); // YouTube 영상의 실제 메타데이터를 부모에게 전달하는 콜백
  const onNextTrack = props.onNextTrack || (() => {}); // 다음 곡 재생을 부모에게 요청하는 콜백
  const onPrevTrack = props.onPrevTrack || (() => {}); // 이전 곡 재생을 부모에게 요청하는 콜백
  const albumArt = props.albumArt || null; // 기존 폴백
  const geniusData = props.geniusData || null; // Genius 데이터 전체

  // --- 내부 UI 상태 관리 (useState) ---
  // 이 컴포넌트 안에서만 사용되는 UI 관련 상태들입니다.
  const [videoTitle, setVideoTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 재생 바를 사용자가 드래그하는지 여부

  // --- Refs ---
  // 렌더링과 상관없이 값을 유지해야 할 때 사용합니다. (불필요한 리렌더링 방지)
  const playerRef = useRef(null); // 실제 YouTube 플레이어 인스턴스를 저장
  const animationFrameRef = useRef(null); // requestAnimationFrame의 ID를 저장
  const lastReportedTimeRef = useRef(0); // 재생 시간 업데이트 최적화를 위한 마지막 시간 저장

  // --- 상태 파생 및 동기화 ---
  // 부모가 관리하는 재생목록/인덱스로부터 현재 videoId를 파생시킵니다.
  const currentVideoIdDerived =
    track && track[externalIndex] ? track[externalIndex].videoId : "";
  const [currentVideoId, setCurrentVideoId] = useState(
    () => currentVideoIdDerived
  );

  // 부모가 인덱스나 트랙을 변경했을 때, 내부 videoId 상태를 동기화합니다.
  useEffect(() => {
    if (currentVideoIdDerived && currentVideoIdDerived !== currentVideoId) {
      setCurrentVideoId(currentVideoIdDerived);
    }
  }, [currentVideoIdDerived, currentVideoId]);

  // --- YouTube 플레이어 초기화 및 API 로드 ---
  // YouTube 플레이어 인스턴스를 생성하는 함수. useCallback으로 불필요한 재생성을 방지합니다.
  const initializePlayer = useCallback(() => {
    // 플레이어가 이미 생성되었거나, videoId가 없거나, 마운트할 div가 없으면 실행하지 않습니다.
    if (
      playerRef.current ||
      !currentVideoId ||
      !document.getElementById("player")
    )
      return;

    const p = new window.YT.Player("player", {
      height: "0",
      width: "0",
      videoId: currentVideoId,
      playerVars: { rel: 0, controls: 0, autoplay: 0, playsinline: 1 }, // 자동재생은 로드 후 별도 제어
      events: {
        onReady: (e) => {
          // playerRef에 생성된 플레이어 인스턴스를 저장. (useState가 아닌 useRef 사용으로 리렌더링 방지)
          playerRef.current = e.target;
        },
        onStateChange: (e) => onPlayerStateChange(e), // 상태 변경 시 호출될 함수 연결
      },
    });
    playerRef.current = p;
  }, [currentVideoId]);

  // YouTube IFrame API 스크립트를 로드하는 useEffect. 컴포넌트 마운트 시 한 번만 실행되도록 관리합니다.
  useEffect(() => {
    // API가 이미 로드되었다면 바로 플레이어를 초기화합니다.
    if (
      typeof window === "undefined" ||
      (typeof window.YT !== "undefined" &&
        typeof window.YT.Player !== "undefined")
    ) {
      initializePlayer();
      return;
    }
    // API 스크립트가 없다면 동적으로 생성하여 페이지에 추가합니다.
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 스크립트 로드가 완료되면 YouTube API가 이 전역 함수를 호출합니다.
    window.onYouTubeIframeAPIReady = () => initializePlayer();

    // 컴포넌트가 언마운트될 때 정리(cleanup) 함수
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      window.onYouTubeIframeAPIReady = null;
    };
  }, [initializePlayer]);

  // --- 핵심 비디오 제어 로직 ---
  // currentVideoId가 (부모에 의해) 변경되었고 플레이어가 존재하면, 새 비디오를 로드합니다.
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !currentVideoId) return;
    if (typeof p.loadVideoById === "function") {
      try {
        p.loadVideoById(currentVideoId);
      } catch (e) {
        console.warn("loadVideoById 실패:", e);
      }
    }
  }, [currentVideoId]);

  // 플레이어 상태 변경 이벤트 핸들러. (재생, 종료, 일시정지 등)
  const onPlayerStateChange = (event) => {
    const p = playerRef.current;
    if (!p) return;

    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      const vd = p.getVideoData?.() || {};
      setTotalTime(p.getDuration ? p.getDuration() : 0);
      setVideoTitle(vd.title || "");
      setArtist(vd.author || "");
      // 부모로 실제 YT 메타 전달 → 부모가 Genius 호출
      onTrackData?.(vd);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      onNextTrack?.(); // 다음 곡 재생 요청
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    }
  };

  // --- 재생 바(Progress Bar) 업데이트 로직 ---
  // requestAnimationFrame을 사용하여 부드럽고 효율적으로 재생 바를 업데이트합니다.
  const updateProgressBar = useCallback(() => {
    const p = playerRef.current;
    if (p && typeof p.getCurrentTime === "function" && !isDragging) {
      const current = p.getCurrentTime();
      // 0.25초 이상 차이가 날 때만 상태를 업데이트하여 불필요한 렌더링을 줄입니다 (Throttling).
      if (Math.abs(current - lastReportedTimeRef.current) > 0.25) {
        lastReportedTimeRef.current = current;
        setCurrentTime(current);
      }
    }
    animationFrameRef.current = requestAnimationFrame(updateProgressBar);
  }, [isDragging]);

  // isPlaying 상태에 따라 updateProgressBar 애니메이션 루프를 시작하거나 중지합니다.
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgressBar);
    } else {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, updateProgressBar]);

  // --- 사용자 컨트롤 함수 ---
  // 재생/일시정지 버튼 클릭 핸들러
  const togglePlayPause = () => {
    const p = playerRef.current;
    if (!p) return;
    if (isPlaying) {
      if (typeof p.pauseVideo === "function") p.pauseVideo();
    } else {
      if (typeof p.playVideo === "function") p.playVideo();
    }
  };

  // 다음/이전 버튼 클릭 시, 부모에게 상태 변경을 요청
  const playNextTrackLocal = () => onNextTrack();
  const playPrevTrackLocal = () => onPrevTrack();

  // 재생 바를 직접 클릭하거나 드래그하여 탐색하는 핸들러
  const handleSeek = (e) => {
    const p = playerRef.current;
    if (!p || !p.seekTo) return;
    const percent = Number(e.target.value);
    const newTime = (percent / 100) * totalTime;
    setCurrentTime(newTime); // UI 즉시 업데이트
    p.seekTo(newTime, true); // 플레이어 실제 시간 이동
  };

  // 재생 바 드래그 시작/종료 핸들러
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  // 초(seconds)를 mm:ss 형식의 문자열로 변환
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- 렌더링을 위한 값 계산 ---
  const progressPercent = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;
  // 앨범 아트가 있으면 그것을, 없으면 YouTube 썸네일을 사용
  const ytThumb = currentVideoId
    ? `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`
    : undefined;
  const displayAlbumArt = geniusData?.albumArt || albumArt || ytThumb;
  const displayTitle = geniusData?.songTitle || videoTitle || "Loading...";
  const displayArtist = geniusData?.artistName || artist || "";

  return (
    <main
      className={`${glassmorphismStyle} p-8 flex-1 flex flex-col items-center justify-center text-white/90`}
    >
      <div id="player" style={{ display: "none" }}></div>

      <div className="w-52 h-52 rounded-lg shadow-2xl overflow-hidden mb-6">
        {displayAlbumArt ? (
          <img
            src={displayAlbumArt}
            alt={displayTitle}
            className="w-full h-full object-cover bg-gray-800"
          />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}
      </div>

      <h2 className="text-3xl font-bold">{displayTitle}</h2>
      <p className="text-white/60 mb-6">{displayArtist || "..."}</p>

      <div className="w-full max-w-md mb-4 mt-2">
        <div className="h-1.5 bg-white/20 rounded-full relative group">
          <div
            className={`h-1.5 rounded-full ${
              isDragging ? "bg-blue-500" : "bg-white/80"
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercent}
            onChange={handleSeek}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 bg-transparent appearance-none cursor-pointer"
            style={{ WebkitAppearance: "none" }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/50 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <button className="absolute right-8 text-white/70 hover:text-white transition-colors">
          <Share2 size={20} />
        </button>
        <button
          onClick={playPrevTrackLocal}
          className="text-white/70 hover:text-white transition-colors"
        >
          <SkipBack size={20} />
        </button>
        <button
          aria-label="play/pause"
          onClick={togglePlayPause}
          className="m-0 w-16 h-16 bg-white/90 text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-transform transform hover:scale-105"
        >
          {isPlaying ? (
            <Pause size={28} />
          ) : (
            <Play size={28} className="ml-1" />
          )}
        </button>
        <button
          onClick={playNextTrackLocal}
          className="text-white/70 hover:text-white transition-colors"
        >
          <SkipForward size={20} />
        </button>
        <button className="text-white/70 hover:text-white transition-colors">
          <Repeat size={20} />
        </button>
      </div>
    </main>
  );
}
