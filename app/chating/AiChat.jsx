"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

export default function AiChat({ session, onRecommend }) {
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `안녕하세요, ${
        session?.name || "사용자"
      }님! 오늘 기분은 어떠신가요? 이야기해 주시면 딱 맞는 노래를 추천해 드릴게요. 🎵`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    // [시뮬레이션 로직]
    setTimeout(() => {
      const mockPlaylist = [
        {
          _id: "1",
          videoId: "UaGBz_Y_iUI",
          title: "밤편지",
          artist: "아이유 (IU)",
        },
        { _id: "2", videoId: "0s1pneO-p3Y", title: "위로", artist: "권진아" },
        {
          _id: "3",
          videoId: "D4fbh_s_i50",
          title: "그대라는 사치",
          artist: "한동근",
        },
      ];

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "이야기를 들어보니 차분한 위로가 필요하신 것 같아요. 이 노래들을 들어보세요.",
        },
      ]);

      onRecommend(mockPlaylist);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center gap-3">
        <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-full">
          <Sparkles className="text-brand-600 dark:text-brand-400" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            AI 뮤직 카운슬러
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            감정을 분석하여 음악을 추천합니다
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm flex gap-2 items-center">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="w-full pl-5 pr-12 py-3.5 rounded-full bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-all shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
