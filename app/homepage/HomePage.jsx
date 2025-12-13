"use client";

import { useState, useEffect } from "react";
import { Menu, Music } from "lucide-react";

// 하위 컴포넌트 임포트
import Sidebar from "../components/Sidebar";
import MainPlayer from "../components/MainPlayer";
import Playlist from "../components/Playlist";

export default function HomePage({ session }) {
  // UI 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 데이터 상태 관리
  const [playlist, setPlaylist] = useState([]); // 재생할 노래 목록
  const [currentSong, setCurrentSong] = useState(null); // 현재 재생 중인 노래
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. 페이지 로드 시: 채팅방에서 저장한 플레이리스트가 있는지 확인
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("cloudify_playlist");
    if (savedPlaylist) {
      try {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylist(parsed);
        // 저장된 노래가 있다면 첫 곡 자동 선택 (원하시면 주석 해제)
        // if (parsed.length > 0) setCurrentSong(parsed[0]);
      } catch (e) {
        console.error("플레이리스트 로드 실패", e);
      }
    }
  }, []);

  // 2. 반응형 처리
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 노래 선택 핸들러
  const handleSongSelect = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* 1. Sidebar Section */}
      <aside
        className={`
          fixed md:relative z-30 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "w-64 translate-x-0"
              : "w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden"
          }
        `}
      >
        <Sidebar
          session={session}
          isMobile={isMobile}
          closeSidebar={() => isMobile && setIsSidebarOpen(false)}
        />
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Main Content Section */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu size={24} />
          </button>

          <div className="font-semibold text-lg text-brand-600 dark:text-brand-400">
            Cloudify Player
          </div>
          <div className="w-8"></div>
        </header>

        {/* Content Body: Player View */}
        <div className="flex-1 flex overflow-hidden p-6 justify-center">
          {playlist.length > 0 ? (
            <div className="w-full max-w-5xl flex gap-6 h-full">
              {/* 왼쪽: 플레이리스트 목록 */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <Playlist
                  songs={playlist}
                  currentSong={currentSong}
                  onSongSelect={handleSongSelect}
                />
              </div>
            </div>
          ) : (
            // 노래가 없을 때 표시할 안내 문구
            <div className="flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-full">
                <Music size={48} />
              </div>
              <p className="text-xl font-medium">재생할 노래가 없습니다.</p>
              <p>AI 채팅 메뉴에서 기분에 맞는 노래를 추천받아보세요!</p>
            </div>
          )}
        </div>

        {/* 3. Player Bar (하단 고정) */}
        {currentSong && (
          <div className="h-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 animate-slide-up shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <MainPlayer
              currentSong={currentSong}
              playlist={playlist}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              onNext={() => {}}
              onPrev={() => {}}
            />
          </div>
        )}
      </main>
    </div>
  );
}
