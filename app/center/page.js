"use client";
/**
 * app/center/page.js — Center Dashboard
 */
import { ClipboardList, Users, TrendingUp, UserCheck } from "lucide-react";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCardGrid from "@/components/dashboard/StatCardGrid";
import { useSession } from "next-auth/react";
import { useLeads } from "@/hooks/useLeads";
import { useSubcenters } from "@/hooks/useSubcenters";

export default function CenterDashboard() {
  const { data: session } = useSession();
  const { leads, isLoading: ll }          = useLeads("center");
  const { subcenters, isLoading: ls }     = useSubcenters("center");

  const admitted   = leads.filter((l) => l.status === "Admission Approved").length;
  const primary    = leads.filter((l) => l.lead_type === "Primary").length;
  const duplicate  = leads.filter((l) => l.lead_type === "Duplicate").length;
  const review     = leads.filter((l) => l.lead_type === "Under Review").length;

  const stats = [
    { label: "Total Leads",     value: leads.length,       icon: ClipboardList, color: "crimson", description: "All leads you've added" },
    { label: "Primary Leads",   value: primary,            icon: UserCheck,     color: "green",    description: "Successfully pushed leads" },
    { label: "Duplicate Leads", value: duplicate,          icon: TrendingUp,    color: "orange",  description: "Duplicate phone matches"  },
    { label: "Under Review",    value: review,             icon: Users,         color: "blue",    description: "Pending verification / push" },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner
        name={session?.user?.name ?? "Unit"}
        subtitle="Monitor all your leads and associates in one place."
      />
      <StatCardGrid items={stats} isLoading={ll || ls} />
    </div>
  );
}
