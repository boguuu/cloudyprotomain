"use client";

import React, { useState } from "react";
import { GripVertical } from "lucide-react";

const glassmorphismStyle =
  "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg";

export default function Playlist({
  track = [],
  currentTrackIndex = 0,
  onTrackSelect = () => {},
  geniusById = {}, // 아이템별 Genius 데이터 { [videoId]: { songTitle, artistName, albumArt, lyrics, ... } }
  metaById = {}, // 아이템별 oEmbed 메타 { [videoId]: { title, artist } }
}) {
  const safeList = Array.isArray(track) ? track : [];

  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태 추가
  const [showLyrics, setShowLyrics] = useState(false); // 가사 토글

  // 현재 트랙 기준 표시값
  const current = safeList[currentTrackIndex] || null;
  const currentVideoId = current?.videoId;
  const gd = currentVideoId ? geniusById[currentVideoId] : null;
  const meta = currentVideoId ? metaById[currentVideoId] : null;
  const currentTitle =
    gd?.songTitle || current?.title || meta?.title || "제목 없음";
  const currentArtist = gd?.artistName || current?.artist || meta?.artist || "";
  // 다양한 키 후보를 지원(프로젝트 정규화 스키마에 맞게 하나만 써도 됨)
  const currentLyrics =
    gd?.lyrics || gd?.lyric || gd?.lyricsText || gd?.lyrics_text || null;

  const handleSavePlaylist = async () => {
    setIsSaving(true);
    const playlistName = prompt(
      "Enter a name for your new YouTube playlist:",
      "My Cloudy Playlist"
    );

    if (!playlistName) {
      setIsSaving(false);
      return;
    }

    const videoIds = safeList.map((song) => song.videoId).filter(Boolean);

    try {
      const response = await fetch("/api/playlist/saveToYoutube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistName, videoIds }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      alert(
        `Playlist "${playlistName}" created successfully! You can view it at: \n${result.playlistUrl}`
      );
    } catch (error) {
      console.error("Failed to save playlist:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className={`${glassmorphismStyle} p-6 flex flex-col w-80`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white/90">Next Up</h3>
        {/* <button
          type="button"
          onClick={() => setShowLyrics((v) => !v)}
          className={`font-semibold text-sm px-2 py-1 rounded ${
            showLyrics
              ? "text-slate-900 bg-white"
              : "text-white/90 hover:text-white"
          }`}
          aria-pressed={showLyrics}
        >
          lyric
        </button> */}
        <p className="text-sm text-white/50">{safeList.length} songs</p>
      </div>

      {showLyrics ? (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-sm text-white/60 mb-2">
              {currentArtist
                ? `${currentArtist} - ${currentTitle}`
                : currentTitle}
            </p>
            <pre className="text-sm text-white/90 whitespace-pre-wrap break-words leading-6">
              {currentLyrics
                ? currentLyrics
                : gd
                ? "가사를 찾을 수 없습니다."
                : "Genius 데이터를 불러오는 중..."}
            </pre>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {safeList.map((song, index) => {
            const key = song?._id ?? song?.videoId ?? index;
            const gdItem = song?.videoId ? geniusById[song.videoId] : null;
            const metaItem = song?.videoId ? metaById[song.videoId] : null;
            const title =
              gdItem?.songTitle ||
              song?.title ||
              metaItem?.title ||
              "제목 없음";
            const artist =
              gdItem?.artistName ||
              song?.artist ||
              metaItem?.artist ||
              "아티스트 없음";
            const thumb = gdItem?.albumArt || (song?.videoId ? null : null); // 썸네일 대신 앨범 아트만 사용
            return (
              <div
                key={key}
                onClick={() => onTrackSelect(index)}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                  index === currentTrackIndex
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                <div className="w-10 h-10 rounded overflow-hidden mr-4 flex-shrink-0 bg-gray-700">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white/90 text-sm truncate">
                    {title}
                  </p>
                  {artist ? (
                    <p className="text-xs text-white/50 truncate">{artist}</p>
                  ) : null}
                </div>
                <button className="text-white/50 hover:text-white">
                  <GripVertical size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Save 버튼은 그대로 유지 */}
      {/* <button
        onClick={handleSavePlaylist}
        disabled={isSaving}
        className="mt-4 w-full bg-white/90 text-slate-800 py-2.5 rounded-lg font-semibold hover:bg-white transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save Playlist to YouTube"}
      </button> */}
    </aside>
  );
}
