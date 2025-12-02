"use client";
import React, { useEffect, useState } from "react";
import { Home, Library, Settings, Cloud } from "lucide-react";
import LoginBtn from "../LoginBtn";
import LogOutBtn from "../LogOutBtn";

const glassmorphismStyle =
  "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg";

export default function Sidebar() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch("https://api.cloudify.lol/api/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!aborted) setIsAuth(res.ok);
      } catch (_) {
        if (!aborted) setIsAuth(false);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  return (
    <aside
      className={`${glassmorphismStyle} p-4 flex flex-col items-center space-y-8`}
    >
      <Cloud size={32} className="text-white/80" />

      <nav className="flex flex-col items-center space-y-6">
        <div className="p-2 pb-1 rounded-lg text-white/80 hover:bg-white/20 transition-colors">
          {!loading && (isAuth ? <LogOutBtn /> : <LoginBtn />)}
        </div>
        <a
          href="#"
          className="p-2 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
        >
          <Home size={24} />
        </a>
        <a
          href="#"
          className="p-2 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
        >
          <Library size={24} />
        </a>
        <a
          href="#"
          className="p-2 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
        >
          <Settings size={24} />
        </a>
      </nav>
    </aside>
  );
}
