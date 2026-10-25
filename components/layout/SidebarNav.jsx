"use client";
/**
 * SidebarNav.jsx — Renders navigation items for a given role.
 * Includes Billing section with access control and notification bell beside it.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/navigation";
import BillingNotificationsDialog from "@/components/billing/BillingNotificationsDialog";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SidebarNav({ role, isCollapsed = false }) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  // Fetch billing status if role is center
  const { data: billingData, mutate: mutateBilling } = useSWR(
    role === "center" ? "/api/billing/status" : null,
    fetcher,
    { refreshInterval: 20000, revalidateOnFocus: true }
  );

  const rawItems = NAV_ITEMS[role] ?? [];
  const hasBillingAccess = billingData?.data?.hasAccess;
  const unreadCount = billingData?.data?.unreadCount || 0;

  // For center: only show billing if authorized
  const items = rawItems.filter((item) => {
    if (role === "center" && item.requiresBillingAccess) {
      return Boolean(hasBillingAccess);
    }
    return true;
  });

  return (
    <>
      <nav className="space-y-1.5">
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const isBilling = href.includes("/billing");

          return (
            <div key={href} className="relative group">
              <Link
                href={href}
                title={isCollapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
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
                {!isCollapsed && <span className="truncate flex-1">{label}</span>}

                {/* Notification bell beside Billing */}
                {isBilling && !isCollapsed && role === "center" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setNotifOpen(true);
                    }}
                    title="Billing Notifications"
                    className="relative flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-100/60 transition-colors cursor-pointer"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {role === "center" && (
        <BillingNotificationsDialog
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          onReadUpdated={() => mutateBilling()}
        />
      )}
    </>
  );
}
