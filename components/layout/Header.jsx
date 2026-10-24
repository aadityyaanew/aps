"use client";
/**
 * Header.jsx — Top header bar with page title and user menu.
 */
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "./UserMenu";

export default function Header({ title, session }) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 gap-4">
      <h1 className="text-lg font-semibold text-gray-800 truncate">{title}</h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </Button>
        <UserMenu user={session?.user} />
      </div>
    </header>
  );
}
