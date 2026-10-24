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

  const admitted   = leads.filter((l) => l.status === "admitted").length;
  const primary    = leads.filter((l) => l.lead_type === "primary").length;
  const secondary  = leads.filter((l) => l.lead_type === "secondary").length;

  const stats = [
    { label: "Total Leads",     value: leads.length,       icon: ClipboardList, color: "crimson", description: "All leads you've added" },
    { label: "Primary Leads",   value: primary,             icon: UserCheck,     color: "blue",    description: "Unique leads"           },
    { label: "Secondary Leads", value: secondary,           icon: TrendingUp,    color: "orange",  description: "Duplicate leads"         },
    { label: "Sub Centers",     value: subcenters.length,   icon: Users,         color: "purple",  description: "Your sub centers"        },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner
        name={session?.user?.name ?? "Center"}
        subtitle="Monitor all your leads and sub centers in one place."
      />
      <StatCardGrid items={stats} isLoading={ll || ls} />
    </div>
  );
}
