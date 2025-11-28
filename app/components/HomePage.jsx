"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";

// 하위 컴포넌트 임포트 (파일 구조에 맞춤)
import Sidebar from "./Sidebar";
import AiChat from "./AiChat";
import MainPlayer from "./MainPlayer";
import Playlist from "./Playlist";

export default function HomePage() {
  const { data: session } = useSession();
  
  // UI 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 데스크탑 기본 열림
  const [isMobile, setIsMobile] = useState(false);

  // 데이터 상태 관리
  const [playlist, setPlaylist] = useState([]); // AI가 추천한 노래 목록
  const [currentSong, setCurrentSong] = useState(null); // 현재 재생 중인 노래
  const [isPlaying, setIsPlaying] = useState(false);

  // 반응형 처리: 화면 크기에 따라 사이드바 상태 자동 조정
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
    
    // 초기 실행 및 이벤트 리스너 등록
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // AI 추천 결과 업데이트 핸들러 (AiChat 컴포넌트에서 호출)
  const handleRecommendation = (newPlaylist) => {
    setPlaylist(newPlaylist);
    if (newPlaylist.khlength > 0) {
      // 첫 번째 곡 자동 선택 (선택 사항)
      // setCurrentSong(newPlaylist[0]);
    }
  };

  // 노래 선택 핸들러
  const handleSongSelect = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      
      {/* 1. Sidebar Section */}
      {/* 모바일에서는 오버레이 방식, 데스크탑에서는 공간 차지 방식 */}
      <aside 
        className={`
          fixed md:relative z-30 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden"}
        `}
      >
        <Sidebar session={session} isMobile={isMobile} closeSidebar={() => isMobile && setIsSidebarOpen(false)} />
      </aside>

      {/* Mobile Overlay Background */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Main Content Section */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Top Header (Mobile Hamburger & User Info) */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu size={24} />
          </button>
          
          <div className="font-semibold text-lg text-brand-600 dark:text-brand-400">
            Cloudify
          </div>
          
          {/* 우측 공간 확보 (프로필 등은 Sidebar나 별도 Header 컴포넌트로 분리 가능) */}
          <div className="w-8"></div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Chat Interface (Center Stage) */}
          <div className="flex-1 h-full relative">
            <AiChat 
              session={session} 
              onRecommend={handleRecommendation} 
            />
          </div>

          {/* Right: Playlist Panel (Desktop Only - Optional) */}
          {/* 플레이리스트가 있을 때만 표시 */}
          {playlist.length > 0 && (
            <div className="hidden lg:block w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full overflow-y-auto">
              <Playlist 
                songs={playlist} 
                currentSong={currentSong} 
                onSongSelect={handleSongSelect} 
              />
            </div>
          )}
        </div>

        {/* 3. Player Section (Bottom Sticky) */}
        {/* 노래가 선택되었을 때만 플레이어 표시 */}
        {currentSong && (
          <div className="h-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 animate-slide-up shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <MainPlayer 
              currentSong={currentSong}
              playlist={playlist}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              onNext={() => {/* 다음 곡 로직 */}}
              onLxrev={() => {/* 이전 곡 로직 */}}
            />
          </div>
        )}
      </main>
    </div>
  );
}