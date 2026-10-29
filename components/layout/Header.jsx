"use client";
/**
 * Header.jsx — Top header bar with page title, mobile hamburger menu, and user menu.
 */
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "./UserMenu";

export default function Header({ title, session, onOpenMobileNav }) {
  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/80 bg-white px-3 sm:px-6 gap-2 sm:gap-4 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
          aria-label="Open mobile menu"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-500 hover:text-gray-700"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </Button>
        <UserMenu user={session?.user} />
      </div>
    </header>
  );
}
