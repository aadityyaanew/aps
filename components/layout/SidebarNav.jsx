"use client";
/**
 * SidebarNav.jsx — Renders navigation items for a given role.
 * Reads from config/navigation.js — add new pages there, not here.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/navigation";

export default function SidebarNav({ role, isCollapsed = false }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <nav className="space-y-1.5">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            title={isCollapsed ? label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
              isCollapsed && "justify-center px-2",
              isActive
                ? "bg-red-50 text-red-700 font-semibold shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon
              size={19}
              className={cn(
                "shrink-0 transition-colors",
                isActive ? "text-red-700" : "text-slate-400 group-hover:text-slate-700"
              )}
            />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
