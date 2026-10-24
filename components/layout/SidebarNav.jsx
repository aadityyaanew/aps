"use client";
/**
 * SidebarNav.jsx — Renders navigation items for a given role.
 * Reads from config/navigation.js — add new pages there, not here.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/navigation";

export default function SidebarNav({ role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <nav className="space-y-1">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-[#8B0000] text-white shadow-sm"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={18} className={isActive ? "text-white" : "text-white/50"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
