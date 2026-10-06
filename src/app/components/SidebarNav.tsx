"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  /** Indented sub-item (e.g. an individual business under "Businesses") */
  sub?: boolean;
  /** Unread / pending count shown as a small red pill on the right. Hidden when 0 or undefined. */
  badge?: number;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

interface SidebarNavProps {
  items: NavItem[];
  /** Grouped staff links, e.g. Admin Tools / Team Tools / Education. */
  sections?: NavSection[];
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const base = item.sub
    ? "flex items-center justify-between gap-2 py-1.5 pl-8 pr-3 text-sm rounded-md transition-colors duration-150"
    : "flex items-center justify-between gap-2 py-2 px-3 rounded-md transition-colors duration-150 font-medium";
  const state = active
    ? "bg-[#910000] text-white shadow-sm"
    : "text-gray-300 hover:bg-white/10 hover:text-white";

  return (
    <Link href={item.href} className={`${base} ${state}`} aria-current={active ? "page" : undefined}>
      <span className="truncate">{item.label}</span>
      {item.badge ? (
        <span
          className={`inline-flex min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
            active ? "bg-white text-[#910000]" : "bg-[#910000] text-white"
          }`}
          aria-label={`${item.badge} unread`}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function SidebarNav({ items, sections = [] }: SidebarNavProps) {
  const adminItems = sections.flatMap((s) => s.items);
  const pathname = usePathname();

  // Prefix match so nested pages (e.g. /dashboard/businesses/3/edit) keep their
  // parent lit, but only the LONGEST matching link is active, so a child link
  // like /admin/hth-class/cohorts doesn't also light up /admin/hth-class.
  const matches = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  const activeHref = [...items, ...adminItems]
    .filter((i) => matches(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const isActive = (href: string) => href === activeHref;

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item.href)} />
      ))}

      {sections.map((section) => (
        <div key={section.label}>
          <p className="pt-6 pb-2 px-3 text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
            {section.label}
          </p>
          {section.items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      ))}
    </nav>
  );
}
