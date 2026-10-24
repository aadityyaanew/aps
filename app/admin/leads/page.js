"use client";
/**
 * app/admin/leads/page.js — Admin: View all leads across system
 */
import PageHeader from "@/components/common/PageHeader";
import LeadsTable from "@/components/leads/LeadsTable";
import { useLeads } from "@/hooks/useLeads";

export default function AdminLeadsPage() {
  const { leads, isLoading } = useLeads("admin");

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Leads"
        description={`${leads.length} total leads across all centers`}
      />
      <LeadsTable leads={leads} isLoading={isLoading} showCenter showSubcenter />
    </div>
  );
}
