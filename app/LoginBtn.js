"use client";
import { LogIn } from "lucide-react";

export default function LoginBtn() {
  const handleLogin = () => {
    // 로그인 성공 후 /chating으로 리다이렉트
    const redirectUri = `${window.location.origin}/chating`;
    const url = `https://api.cloudify.lol/oauth2/authorization/google?redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
    window.location.assign(url);
  };

  return (
    <button onClick={handleLogin} aria-label="Sign in">
      <LogIn size={24} />
    </button>
  );
}
