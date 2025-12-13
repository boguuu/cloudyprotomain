"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import MusicPlayerClient from "@/app/components/MusicPlayerClient";
import LoginPage from "@/app/login/LoginPage";
import HomePage from "@/app/homepage/HomePage";

// 검색 후 보여줄 임시 플레이리스트 데이터
const mockSongs = [
  { _id: "1", videoId: "UaGBz_Y_iUI", title: "밤편지", artist: "아이유 (IU)" },
  { _id: "2", videoId: "0s1pneO-p3Y", title: "위로", artist: "권진아" },
  {
    _id: "3",
    videoId: "D4fbh_s_i50",
    title: "그대라는 사치",
    artist: "한동근",
  },
  {
    _id: "4",
    videoId: "Fq5H61D0OQY",
    title: "수고했어, 오늘도",
    artist: "옥상달빛",
  },
  {
    _id: "5",
    videoId: "Dic22_k_e3U",
    title: "걱정말아요 그대",
    artist: "이적",
  },
  { _id: "6", videoId: "5J6e4h3A34s", title: "숨", artist: "박효신" },
];

export default function Home() {
  const router = useRouter();

  // 기존 useSession 대신 직접 관리하는 상태
  const [userData, setUserData] = useState(null);

  const [searchQuery, setSearchQuery] = useState(null);
  const [playlist, setPlaylist] = useState([]);

  // 페이지 상태: 'loading' | 'login' | 'home' | 'player'
  const [pageState, setPageState] = useState("loading");

  // 1. 인증 확인 로직 (페이지 로드 시 1회 실행)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 백엔드에 쿠키를 보내 유효한 유저인지 확인
        const res = await fetch("https://api.cloudify.lol/api/auth/me", {
          method: "GET",
          credentials: "include", // 쿠키 포함 필수
        });

        if (res.ok) {
          const data = await res.json();
          setUserData(data); // 유저 정보 저장 (session 대체)

          // 이미 플레이어 상태가 아니라면 홈으로 이동
          setPageState((prev) => (prev === "player" ? "player" : "home"));
        } else {
          // 인증 실패 시 로그인 화면으로
          setPageState("login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setPageState("login");
      }
    };

    checkAuth();
  }, []);

  // 2. 배경 스타일 관리 로직
  useEffect(() => {
    // body의 클래스를 동적으로 변경하여 배경을 관리합니다.
    document.body.classList.remove("auth-background", "player-background");

    if (pageState === "player") {
      document.body.classList.add("player-background");
    } else {
      // 로그인, 홈 화면 등은 밝은/어두운 배경 사용
      document.body.classList.add("auth-background");
    }
  }, [pageState]);

  // 3. 검색 핸들러
  const handleSearch = (query) => {
    setSearchQuery(query);
    // 실제 앱에서는 여기서 검색어(query)를 기반으로 API를 호출하여 플레이리스트를 가져옵니다.
    // 지금은 임시 데이터를 사용합니다.
    setPlaylist(mockSongs);
    setPageState("player"); // 검색 시 플레이어 화면으로 전환
  };

  // 4. 화면 렌더링 로직
  const renderContent = () => {
    switch (pageState) {
      case "login":
        return <LoginPage />;
      case "home":
        // session prop에 백엔드에서 받아온 userData를 전달
        return <HomePage onSearch={handleSearch} session={userData} />;
      case "player":
        return (
          <div className="w-full max-w-6xl h-[600px] flex gap-4 text-white">
            <MusicPlayerClient initialPlaylist={playlist} />
          </div>
        );
      case "loading":
      default:
        return (
          <div className="flex items-center justify-center min-h-screen text-gray-800 dark:text-white">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4"></div>
              <p>Loading session...</p>
            </div>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
}
