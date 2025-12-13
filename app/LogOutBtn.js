"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogOutBtn() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 백엔드에 로그아웃 요청 (쿠키 삭제)
      await fetch("https://api.cloudify.lol/api/auth/logout", {
        method: "POST",
        credentials: "include", // 쿠키 전송 필수
      });
      // 성공 여부와 상관없이 로그인 페이지로 이동
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/login");
    }
  };

  return (
    <button onClick={handleLogout} aria-label="Sign out">
      <LogOut size={24} />
    </button>
  );
}
