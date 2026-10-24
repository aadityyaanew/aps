"use client";
/**
 * app/subcenter/leads/page.js — Subcenter: View and add own leads
 */
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import LeadsTable from "@/components/leads/LeadsTable";
import AddLeadDialog from "@/components/leads/AddLeadDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";

export default function SubcenterLeadsPage() {
  const { leads, isLoading, addLead } = useLeads("subcenter");
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leads"
        description={`${leads.length} leads submitted by you`}
        action={
          <Button onClick={() => setAddOpen(true)} className="bg-[#8B0000] hover:bg-[#a01515] text-white gap-2">
            <Plus size={16} /> Add Lead
          </Button>
        }
      />

      <LeadsTable leads={leads} isLoading={isLoading} />

      <AddLeadDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={addLead}
      />
    </div>
  );
}
