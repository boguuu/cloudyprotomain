"use client";

import React from "react";
import { Cloud } from "lucide-react";

const glassmorphismStyle =
  "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    const redirectUri = `${window.location.origin}/chating`;
    const url = `https://api.cloudify.lol/oauth2/authorization/google?redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
    window.location.assign(url);
  };

  return (
    <div className={`${glassmorphismStyle} w-full max-w-sm p-10 text-white/90`}>
      <div className="flex flex-col items-center space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-4 space-y-3">
            <Cloud size={52} className="text-white/80" />
            <h1 className="text-4xl font-bold text-white">Cloudify</h1>
          </div>
          <p className="text-white/60">음악, 대화로 발견하다</p>
        </div>

        {/* 로그인 버튼 */}
        <div className="w-full pt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white/90 text-slate-800 py-3 rounded-lg font-semibold hover:bg-white transition-all shadow-md transform hover:scale-105 duration-300"
          >
            Google 계정으로 로그인
          </button>
        </div>

        {/* 푸터 */}
        <div className="text-center text-xs text-white/40 pt-4">
          <p>&copy; 2025 Cloudify. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
