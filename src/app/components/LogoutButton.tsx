"use client";

import { logout } from "@/app/login/actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full text-left py-2 px-3 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-150"
      >
        Logout
      </button>
    </form>
  );
}
