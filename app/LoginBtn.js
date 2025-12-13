"use client";
import { LogIn } from "lucide-react";

export default function LoginBtn() {
  const handleLogin = () => {
    // 백엔드 주소로 리다이렉트 (로그인 후 돌아올 주소는 백엔드에 설정됨)
    // 리다이렉트 URI 파라미터가 필요하다면 백엔드 스펙에 맞게 추가
    window.location.href =
      "https://api.cloudify.lol/oauth2/authorization/google?redirect_uri=https://dev.cloudify.lol:3000/";
  };

  return (
    <button onClick={handleLogin} aria-label="Sign in">
      <LogIn size={24} />
    </button>
  );
}
