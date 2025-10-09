"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogOutBtn() {
  return (
    <button
      // className=" rounded hover:bg-white/10 w-6 h-6 flex items-center justify-center"
      onClick={() => {
        signOut();
      }}
      aria-label="Sign out"
    >
      <LogOut size={24} />
    </button>
  );
}
