/**
 * app/page.js — Root redirect: send users to their panel based on role.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROLE_HOME } from "@/config/roles";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role] ?? "/login");
  }
  redirect("/login");
}
