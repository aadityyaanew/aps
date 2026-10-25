"use client";
/**
 * Sidebar.jsx — Main sidebar shell.
 * Renders the logo, nav items (from config), and a sign-out button.
 * Thin shell — delegates nav rendering to SidebarNav.jsx.
 */
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import SidebarNav from "./SidebarNav";

export default function Sidebar({ role }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync preference with localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-slate-200 bg-white text-slate-800 shadow-xs transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-18" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3.5 top-6 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-slate-100 transition-all", isCollapsed ? "justify-center px-2" : "px-5")}>
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          {isCollapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700 font-bold text-lg">
              CD
            </div>
          ) : (
            <Image
              src="/logored.png"
              alt="Compare Degree"
              width={180}
              height={45}
              className="h-10 w-auto max-w-full object-contain"
              priority
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className={cn("flex-1 overflow-y-auto py-4 transition-all", isCollapsed ? "px-2" : "px-3")}>
        <SidebarNav role={role} isCollapsed={isCollapsed} />
      </div>

      <Separator className="bg-slate-100" />

      {/* Sign out */}
      <div className="p-3">
        <Button
          variant="ghost"
          title={isCollapsed ? "Sign Out" : undefined}
          className={cn(
            "w-full gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
