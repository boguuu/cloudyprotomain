"use client";
import { LogOut } from "lucide-react";

export default function LogOutBtn() {
  const handleLogout = async () => {
    try {
      await fetch("https://api.cloudify.lol/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {
      // ignore
    } finally {
      window.location.replace("/login");
    }
  };

  return (
    <button onClick={handleLogout} aria-label="Sign out">
      <LogOut size={24} />
    </button>
  );
}
