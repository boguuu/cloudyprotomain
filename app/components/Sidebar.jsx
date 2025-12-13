"use client";

import Link from "next/link";
import { Home, MessageCircle, Music, User } from "lucide-react";
import LogOutBtn from "../LogOutBtn";
// import { useSession } from "next-auth/react"; // <-- 삭제됨

const glassmorphismStyle =
  "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg";

export default function Sidebar() {
  // const { data: session } = useSession(); // <-- 삭제됨

  return (
    <aside
      className={`w-20 lg:w-64 flex flex-col items-center py-8 ${glassmorphismStyle}`}
    >
      {/* 로고 영역 */}
      <div className="mb-8 p-3 bg-white/10 rounded-full">
        <Music size={32} className="text-white" />
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 w-full flex flex-col gap-4 px-4">
        <NavItem href="/" icon={<Home size={24} />} label="홈" />
        <NavItem
          href="/chating"
          icon={<MessageCircle size={24} />}
          label="AI 채팅"
        />
        {/* 필요한 메뉴 추가 가능 */}
      </nav>

      {/* 하단 유저/로그아웃 영역 */}
      <div className="mt-auto flex flex-col gap-4 items-center w-full px-4">
        <div className="p-2 rounded-xl hover:bg-white/10 transition cursor-pointer">
          <User size={24} className="text-white/70" />
        </div>

        {/* 로그아웃 버튼 (이미 만든 백엔드 통신용 버튼 사용) */}
        <LogOutBtn />
      </div>
    </aside>
  );
}

// 네비게이션 아이템 컴포넌트
function NavItem({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all group"
    >
      <div className="group-hover:scale-110 transition">{icon}</div>
      <span className="hidden lg:block font-medium">{label}</span>
    </Link>
  );
}
