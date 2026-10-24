"use client";
/**
 * app/providers.js — Client-side providers wrapper.
 * Keeps layout.js as a server component.
 */
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </SessionProvider>
  );
}
