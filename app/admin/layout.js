/**
 * app/admin/layout.js — Admin panel layout with responsive shell.
 * Server component that protects route and renders DashboardShell.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Admin — Compare Degree APS",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  return (
    <DashboardShell role="admin" title="Admin Panel" session={session}>
      {children}
    </DashboardShell>
  );
}
