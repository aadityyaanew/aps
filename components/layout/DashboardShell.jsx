"use client";
/**
 * DashboardShell.jsx — Responsive shell for all authenticated dashboards.
 * Handles desktop sidebar collapsing and mobile drawer navigation seamlessly.
 */
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";

export default function DashboardShell({ role, title, session, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile navigation drawer whenever the page route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar — Only visible on md screens and larger */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar role={role} />
      </div>

      {/* Mobile Navigation Drawer — Only rendered when opened on mobile screens */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        role={role}
        session={session}
      />

      {/* Main Scrollable Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          title={title}
          session={session}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

