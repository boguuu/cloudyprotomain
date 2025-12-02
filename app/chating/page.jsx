"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import Sidebar from "../components/Sidebar";

const glassmorphismStyle =
  "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg";

// --- ChatPage Component ---
export default function ChatPage() {
  const router = useRouter();
  const chatContainerRef = useRef(null);

  // --- Auth State ---
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Chat State ---
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "안녕하세요! 오늘 어떤 음악을 듣고 싶으신가요? 기분이나 상황을 알려주세요. 🎵",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Auth Effect (HttpOnly 쿠키 기반) ---
  useEffect(() => {
    let aborted = false;

    const checkAuth = async () => {
      try {
        const res = await fetch("https://api.cloudify.lol/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (aborted) return;

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.replace("/login");
        }
      } catch {
        if (!aborted) router.replace("/login");
      } finally {
        if (!aborted) setIsAuthLoading(false);
      }
    };

    checkAuth();
    return () => {
      aborted = true;
    };
  }, [router]);

  // --- Scroll Effect ---
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // --- Functions ---
  const addMessageToChat = (text, sender = "bot") => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const userInput = inputValue.trim();
    if (!userInput) return;

    addMessageToChat(userInput, "user");
    setInputValue("");
    setIsLoading(true);

    // Simulate bot response
    setTimeout(() => {
      addMessageToChat(
        "알겠습니다. 요청을 처리 중입니다. 잠시 후 메인 페이지로 이동합니다."
      );
      setIsLoading(false);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 1000);
  };

  // --- Render ---
  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/50">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-row h-[70vh] w-full max-w-5xl p-6 gap-6">
      <Sidebar />

      {/* --- 중앙 (채팅) --- */}
      <main
        className={`${glassmorphismStyle} p-6 flex-1 flex flex-col text-white/90`}
      >
        {/* Chat Window */}
        <div
          ref={chatContainerRef}
          className="flex-grow p-2 space-y-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }} // Firefox 스크롤바 숨김
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-full flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-2xl shadow-md max-w-xl fade-in ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white/20 text-white/90 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start max-w-md">
              <div className="bg-white/20 rounded-2xl rounded-bl-none p-3 flex items-center">
                <div className="typing-indicator">
                  <span className="bg-white/50"></span>
                  <span className="bg-white/50"></span>
                  <span className="bg-white/50"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleChatSubmit}
          className="flex items-center space-x-3 pt-4"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="오늘 좀 힘들었어..."
            className="flex-grow p-3 bg-white/10 border border-white/20 rounded-full focus:ring-2 focus:ring-white/50 focus:outline-none transition text-white placeholder-white/50"
            autoComplete="off"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-white/90 text-slate-800 rounded-full w-12 h-12 flex items-center justify-center hover:bg-white transition shadow-lg disabled:opacity-50"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </form>
      </main>
    </div>
  );
}
