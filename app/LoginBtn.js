"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function LoginBtn() {
  return (
    <button
      // className="p-1 rounded hover:bg-white/10 w-6 h-6 flex items-center justify-center"
      onClick={() => {
        // provider 명시: 'google'
        signIn("google");
      }}
      aria-label="Sign in"
    >
      <LogIn size={24} />
    </button>
  );
}
