"use client";
/**
 * MobileNav.jsx — Slide-out mobile navigation drawer.
 * Provides full responsive access to all portal navigation, user details, and logout on mobile devices.
 */
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { X, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/config/roles";
import SidebarNav from "./SidebarNav";

export default function MobileNav({ open, onClose, role, session }) {
  // Lock body scroll when mobile navigation is active
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="fixed inset-y-0 left-0 flex w-[285px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out animate-in slide-in-from-left"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image
              src="/logored.png"
              alt="Compare Degree"
              width={160}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Pill Banner */}
        <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Portal Access
          </span>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 text-[11px] font-semibold gap-1 py-0.5"
          >
            <Shield size={11} />
            {roleLabel}
          </Badge>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav role={role} onNavigate={onClose} />
        </div>

        <Separator className="bg-slate-100" />

        {/* User Info & Sign Out Footer */}
        <div className="p-3 bg-slate-50/50 space-y-2">
          {session?.user && (
            <div className="px-3 py-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {session.user.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {session.user.email}
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-slate-600 hover:text-red-700 hover:bg-red-50 transition-all text-xs font-medium h-10"
            onClick={() => {
              onClose();
              signOut({ callbackUrl: "/login" });
            }}
          >
            <LogOut size={16} className="shrink-0 text-slate-400 group-hover:text-red-600" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

