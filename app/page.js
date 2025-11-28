"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// jsconfig.json의 경로 별칭(@/...)을 사용합니다.
import MusicPlayerClient from "@/app/components/MusicPlayerClient";
import LoginPage from "@/app/components/LoginPage";
import HomePage from "@/app/components/HomePage";

// 검색 후 보여줄 임시 플레이리스트 데이터
const mockSongs = [
    { _id: '1', videoId: 'UaGBz_Y_iUI', title: '밤편지', artist: '아이유 (IU)' },
    { _id: '2', videoId: '0s1pneO-p3Y', title: '위로', artist: '권진아' },
    { _id: '3', videoId: 'D4fbh_s_i50', title: '그대라는 사치', artist: '한동근' },
    { _id: '4', videoId: 'Fq5H61D0OQY', title: '수고했어, 오늘도', artist: '옥상달빛' },
    { _id: '5', videoId: 'Dic22_k_e3U', title: '걱정말아요 그대', artist: '이적' },
    { _id: '6', videoId: '5J6e4h3A34s', title: '숨', artist: '박효신' },
];

export default function Home() {
    const { data: session, status } = useSession();
    const [searchQuery, setSearchQuery] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    // 페이지 상태: 'loading' | 'login' | 'home' | 'player'
    const [pageState, setPageState] = useState('loading'); 

    useEffect(() => {
        // body의 클래스를 동적으로 변경하여 배경을 관리합니다.
        // (globals.css에 정의된 클래스 활용)
        document.body.classList.remove('auth-background', 'player-background');
        
        if (pageState === 'player') {
            document.body.classList.add('player-background');
        } else {
            // 로그인, 홈 화면 등은 밝은/어두운 배경 사용
            document.body.classList.add('auth-background');
        }
    }, [pageState]);
    
    useEffect(() => {
        if (status === "loading") {
            setPageState('loading');
        } else if (status === "unauthenticated") {
            setPageState('login');
        } else if (status === "authenticated") {
            // 로그인 된 상태
            if (searchQuery) {
                // 검색어가 있으면 플레이어 화면
                setPageState('player');
            } else {
                // 검색어가 없으면 홈(검색) 화면
                setPageState('home');
            }
        }
    }, [status, searchQuery]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        // 실제 앱에서는 여기서 검색어(query)를 기반으로 API를 호출하여 플레이리스트를 가져옵니다.
        // 지금은 임시 데이터를 사용합니다.
        setPlaylist(mockSongs);
    };
    
    // 페이지 상태에 따라 적절한 컴포넌트를 렌더링합니다.
    const renderContent = () => {
        switch (pageState) {
            case 'login':
                return <LoginPage />;
            case 'home':
                return <HomePage onSearch={handleSearch} session={session} />;
            case 'player':
                return (
                    <div className="w-full max-w-6xl h-[600px] flex gap-4 text-white">
                        <MusicPlayerClient initialPlaylist={playlist} />
                    </div>
                );
            case 'loading':
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
