"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface TabLinkProps {
  href: string;
  activeTab: string;
  children: React.ReactNode;
}

export default function TabLink({ href, activeTab, children }: TabLinkProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createTabQueryString = useCallback(
    (tabName: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabName);
      return params.toString();
    },
    [searchParams]
  );

  const isActive = activeTab === href;

  return (
    <Link
      href={`/dashboard/admin/users?${createTabQueryString(href)}`}
      className={`${
        isActive
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
