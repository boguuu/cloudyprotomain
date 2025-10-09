"use client";

import React, { useEffect, useState } from "react";
import { SkipBack, SkipForward, Play, Pause, Volume2 } from "lucide-react";

export default function MusicController() {
  const [player, setPlayer] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag?.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  const initializePlayer = () => {
    setPlayer(
      new window.YT.Player("player", {
        height: "0",
        width: "0",
        videoId: "JGwWNGJdvx8",
        playerVars: {
          rel: 0,
          controls: 0,
          autoplay: 1,
          loop: 1,
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      })
    );
  };

  const onPlayerReady = (event) => {
    setVideoTitle(event.target.getVideoData().title);
    setTotalTime(event.target.getDuration());
    setInterval(updateProgressBar, 1000);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const updateProgressBar = () => {
    if (player) {
      const current = player.getCurrentTime();
      const duration = player.getDuration();
      setProgress((current / duration) * 100);
      setCurrentTime(current);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const seekToTime = (value) => {
    if (!player) return;
    const duration = player.getDuration();
    const seekTime = (value / 100) * duration;
    player.seekTo(seekTime);
  };

  const changeVolume = (newVolume) => {
    if (!player) return;
    player.setVolume(newVolume);
    setVolume(newVolume);
  };

  return (
    <>
      <div id="player"></div>

      <div className="flex flex-col items-center bg-transparent text-white rounded-xl p-3 shadow-lg">
        {/* 제목 */}
        <div className="text-center mb-2 text-sm truncate max-w-[200px]">
          {videoTitle || "Loading..."}
        </div>

        {/* 진행 바 */}
        <div className="w-[200px] mb-1">
          <input
            type="range"
            value={progress}
            onChange={(e) => seekToTime(e.target.value)}
            className="w-full accent-white cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalTime)}</span>
          </div>
        </div>

        {/* 볼륨 */}
        <div className="flex items-center gap-2 w-[200px] mb-2">
          <Volume2 size={18} />
          <input
            type="range"
            value={volume}
            onChange={(e) => changeVolume(e.target.value)}
            min="0"
            max="100"
            className="w-full accent-white cursor-pointer"
          />
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-center gap-5 mt-1">
          <button
            aria-label="previous"
            className="hover:text-gray-400 transition"
          >
            <SkipBack size={28} />
          </button>

          <button
            aria-label="play/pause"
            onClick={togglePlayPause}
            className="hover:text-gray-400 transition"
          >
            {isPlaying ? (
              <Pause size={38} strokeWidth={2} />
            ) : (
              <Play size={38} strokeWidth={2} />
            )}
          </button>

          <button aria-label="next" className="hover:text-gray-400 transition">
            <SkipForward size={28} />
          </button>
        </div>
      </div>
    </>
  );
}
