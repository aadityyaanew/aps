"use client";
/**
 * UserMenu.jsx — Avatar + dropdown with user info and sign-out.
 */
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, KeyRound, UserCheck } from "lucide-react";
import { ROLE_LABELS } from "@/config/roles";
import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";
import AdminProfileDialog from "@/components/auth/AdminProfileDialog";

export default function UserMenu({ user }) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none">
          <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-[#8B0000]/30 hover:ring-[#8B0000] transition-all">
            <AvatarFallback className="bg-[#8B0000] text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <p className="text-xs text-[#8B0000] font-medium mt-0.5">
              {ROLE_LABELS[user?.role] ?? user?.role}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {user?.role === "admin" && (
            <DropdownMenuItem
              className="cursor-pointer text-slate-700"
              onClick={() => setProfileOpen(true)}
            >
              <UserCheck size={14} className="mr-2 text-slate-500" />
              Edit Admin Profile
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="cursor-pointer text-slate-700"
            onClick={() => setPasswordOpen(true)}
          >
            <KeyRound size={14} className="mr-2 text-slate-500" />
            Change Password
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={14} className="mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />

      {user?.role === "admin" && (
        <AdminProfileDialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
        />
      )}
    </>
  );
}
