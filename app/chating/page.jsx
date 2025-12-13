"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import Sidebar from "../components/Sidebar";

const glassmorphismStyle =
  "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg";

export default function ChatPage() {
  const router = useRouter();
  const chatContainerRef = useRef(null);

  // ★ 디버깅용 에러 상태
  const [debugError, setDebugError] = useState(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 백엔드로 직접 요청 (인증 정보 포함)
        const res = await fetch("https://api.cloudify.lol/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // ★ 에러 발생 시 자동 이동을 막고, 내용을 화면에 표시합니다.
          const errorText = await res.text();
          console.error("인증 실패:", res.status, errorText);
          setDebugError(
            `[인증 실패]\n상태코드: ${res.status}\n내용: ${errorText}`
          );
          // router.replace("/login"); // 자동 이동 끔
        }
      } catch (err) {
        // ★ 네트워크/CORS 에러 발생 시
        console.error("네트워크 에러:", err);
        setDebugError(
          `[네트워크 에러]\n브라우저 차단 (CORS) 또는 서버 다운\n메시지: ${err.message}`
        );
        // router.replace("/login"); // 자동 이동 끔
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // ★ 에러 발생 시 화면에 붉게 표시 (이 화면을 캡처하세요)
  if (debugError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-10 z-50 absolute inset-0">
        <h1 className="text-4xl text-red-500 font-bold mb-6">
          🚨 에러 발생 (자동 이동 중지됨)
        </h1>
        <div className="bg-gray-800 p-8 rounded-xl border-2 border-red-500 text-lg whitespace-pre-wrap leading-relaxed max-w-4xl w-full">
          {debugError}
        </div>
        <div className="mt-8 text-gray-400">
          * 이 화면이 뜬다면 백엔드 개발자에게 내용을 보여주세요.
        </div>
        <button
          onClick={() => router.replace("/login")}
          className="mt-8 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition"
        >
          로그인 페이지로 수동 이동
        </button>
      </div>
    );
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-xl">로그인 확인 중... (잠시만 기다려주세요)</div>
      </div>
    );
  }

  // (아래는 기존 채팅 화면 - 성공 시에만 보임)
  return (
    <div className="flex flex-row h-[70vh] w-full max-w-5xl p-6 gap-6">
      <Sidebar />
      <main
        className={`${glassmorphismStyle} p-6 flex-1 flex flex-col text-white/90`}
      >
        <div className="flex-grow flex items-center justify-center">
          <h1 className="text-2xl font-bold">인증 성공! 채팅이 가능합니다.</h1>
        </div>
      </main>
    </div>
  );
}
