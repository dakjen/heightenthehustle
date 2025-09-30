"use client";

import { logout } from "@/app/login/actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
        Logout
      </button>
    </form>
  );
}
