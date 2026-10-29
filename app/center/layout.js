/**
 * app/center/layout.js — Center panel layout with responsive shell
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Unit Dashboard — Compare Degree APS",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function CenterLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "center") redirect("/login");

  return (
    <DashboardShell
      role="center"
      title={session.user.organizationName ?? "Unit Dashboard"}
      session={session}
    >
      {children}
    </DashboardShell>
  );
}
