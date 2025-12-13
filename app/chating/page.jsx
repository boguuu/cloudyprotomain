"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import Sidebar from "../components/Sidebar";
// [수정됨] 이제 같은 폴더에 있으므로 ./AiChat 입니다.
import AiChat from "./AiChat";

export default function ChatPage() {
  const router = useRouter();

  // 인증 및 세션 상태
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [session, setSession] = useState(null);

  // UI 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 1. 인증 체크
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("https://api.cloudify.lol/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        } else {
          router.replace("/login");
        }
      } catch (error) {
        router.replace("/login");
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // 2. 반응형 체크
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

  // 3. 추천 완료 시 핸들러
  const handleRecommendation = (newPlaylist) => {
    if (newPlaylist && newPlaylist.length > 0) {
      localStorage.setItem("cloudify_playlist", JSON.stringify(newPlaylist));
      router.push("/");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        <header className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu size={24} />
          </button>
          <div className="font-semibold text-lg text-brand-600 dark:text-brand-400">
            AI Chat
          </div>
          <div className="w-8"></div>
        </header>

        <div className="flex-1 flex overflow-hidden p-4 md:p-6">
          <div className="w-full max-w-4xl mx-auto h-full">
            <AiChat session={session} onRecommend={handleRecommendation} />
          </div>
        </div>
      </main>
    </div>
  );
}
