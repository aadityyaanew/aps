"use client";
/**
 * app/admin/page.js — Admin Dashboard.
 * Shows system-wide stats: total centers, subcenters, and leads.
 */
import { Users, Building2, ClipboardList, TrendingUp } from "lucide-react";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCardGrid from "@/components/dashboard/StatCardGrid";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { data: centers,    isLoading: lc } = useSWR("/api/admin/centers",    fetcher);
  const { data: subcenters, isLoading: ls } = useSWR("/api/admin/subcenters", fetcher);
  const { data: leads,      isLoading: ll } = useSWR("/api/admin/leads",      fetcher);

  const stats = [
    { label: "Total Centers",    value: centers?.length    ?? 0, icon: Building2,    color: "crimson", description: "Active center accounts"   },
    { label: "Total Sub Centers",value: subcenters?.length ?? 0, icon: Users,        color: "blue",    description: "Across all centers"         },
    { label: "Total Leads",      value: leads?.length      ?? 0, icon: ClipboardList, color: "green",  description: "All student applications"   },
    { label: "Admission Approved", value: leads?.filter((l) => l.status === "Admission Approved").length ?? 0, icon: TrendingUp, color: "purple", description: "Successfully admitted" },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner
        name={session?.user?.name ?? "Admin"}
        subtitle="Here's a system-wide overview of all centers and leads."
      />
      <StatCardGrid items={stats} isLoading={lc || ls || ll} />
    </div>
  );
}
