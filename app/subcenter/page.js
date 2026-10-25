"use client";
/**
 * app/subcenter/page.js — Subcenter Dashboard
 */
import { ClipboardList, UserCheck, TrendingUp, CheckCircle } from "lucide-react";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCardGrid from "@/components/dashboard/StatCardGrid";
import { useSession } from "next-auth/react";
import { useLeads } from "@/hooks/useLeads";

export default function SubcenterDashboard() {
  const { data: session } = useSession();
  const { leads, isLoading } = useLeads("subcenter");

  const admitted   = leads.filter((l) => l.status === "Admission Approved").length;
  const primary    = leads.filter((l) => l.lead_type === "Primary").length;
  const duplicate  = leads.filter((l) => l.lead_type === "Duplicate").length;
  const review     = leads.filter((l) => l.lead_type === "Under Review").length;

  const stats = [
    { label: "My Total Leads",   value: leads.length, icon: ClipboardList, color: "crimson", description: "All leads you've added"   },
    { label: "Primary Leads",    value: primary,      icon: UserCheck,     color: "green",   description: "Successfully pushed leads" },
    { label: "Duplicate Leads",  value: duplicate,    icon: TrendingUp,    color: "orange",  description: "Matched phone, email & university" },
    { label: "Under Review",     value: review,       icon: CheckCircle,   color: "blue",    description: "Pending verification / push"},
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner
        name={session?.user?.name ?? "Associate"}
        subtitle="Track your leads and monitor their admission status."
      />
      <StatCardGrid items={stats} isLoading={isLoading} />
    </div>
  );
}
