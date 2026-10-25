"use client";
/**
 * Sidebar.jsx — Main sidebar shell.
 * Renders the logo, nav items (from config), and a sign-out button.
 * Thin shell — delegates nav rendering to SidebarNav.jsx.
 */
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SidebarNav from "./SidebarNav";

export default function Sidebar({ role }) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-[#1a0a0a] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <Image src="/logo.png" alt="Compare Degree" width={36} height={36} className="h-9 w-auto object-contain rounded-md" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Compare Degree</p>
          <p className="text-[10px] text-white/50 uppercase tracking-wider">{role} panel</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <SidebarNav role={role} />
      </div>

      <Separator className="bg-white/10" />

      {/* Sign out */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
