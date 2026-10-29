/**
 * app/subcenter/layout.js — Subcenter panel layout with responsive shell
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Associate Dashboard — Compare Degree APS",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function SubcenterLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "subcenter") redirect("/login");

  return (
    <DashboardShell
      role="subcenter"
      title={session.user.organizationName ?? "Associate Dashboard"}
      session={session}
    >
      {children}
    </DashboardShell>
  );
}
