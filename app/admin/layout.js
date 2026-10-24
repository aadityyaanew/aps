/**
 * app/admin/layout.js — Admin panel layout with sidebar + header.
 * Server component that protects route and renders shell.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata = { title: "Admin — Compare Degree APS" };

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role="admin" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Admin Panel" session={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
