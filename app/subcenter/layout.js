/**
 * app/subcenter/layout.js — Subcenter panel layout
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role="subcenter" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={session.user.organizationName ?? "Associate Dashboard"} session={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
