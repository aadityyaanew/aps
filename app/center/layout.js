/**
 * app/center/layout.js — Center panel layout
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata = { title: "Unit Dashboard — Compare Degree APS" };

export default async function CenterLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "center") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role="center" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={session.user.organizationName ?? "Unit Dashboard"} session={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
