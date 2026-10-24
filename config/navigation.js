/**
 * Navigation config for each role's sidebar.
 * Keeps Sidebar.jsx thin — it just maps over this.
 */
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  UserSquare2,
} from "lucide-react";

/** @type {Record<string, Array<{label: string, href: string, icon: any}>>} */
export const NAV_ITEMS = {
  admin: [
    { label: "Dashboard",   href: "/admin",             icon: LayoutDashboard },
    { label: "Centers",     href: "/admin/centers",     icon: Building2       },
    { label: "Sub Centers", href: "/admin/subcenters",  icon: Users           },
    { label: "All Leads",   href: "/admin/leads",       icon: ClipboardList   },
  ],
  center: [
    { label: "Dashboard",   href: "/center",            icon: LayoutDashboard },
    { label: "Leads",       href: "/center/leads",      icon: ClipboardList   },
    { label: "Sub Centers", href: "/center/subcenters", icon: Users           },
  ],
  subcenter: [
    { label: "Dashboard",   href: "/subcenter",         icon: LayoutDashboard },
    { label: "My Leads",    href: "/subcenter/leads",   icon: ClipboardList   },
  ],
};
