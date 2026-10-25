"use client";
/**
 * app/admin/leads/page.js — Admin: View & Manage all leads across system
 * Super Admin can add leads and edit Lead Type, Status, and ADM Status.
 */
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import LeadsTable from "@/components/leads/LeadsTable";
import AddLeadDialog from "@/components/leads/AddLeadDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";

export default function AdminLeadsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const { leads, isLoading, addLead, updateStatus, updateAdmStatus, updateType } = useLeads("admin");

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Leads"
        description={`${leads.length} total leads across all units.`}
        action={
          <Button
            onClick={() => setOpenAdd(true)}
            className="gap-2 bg-[#800000] hover:bg-[#6c0000] text-white shadow-sm"
          >
            <UserPlus size={16} />
            Add Lead
          </Button>
        }
      />

      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        showCenter
        showSubcenter
        isAdmin={true}
        onUpdateStatus={updateStatus}
        onUpdateAdmStatus={updateAdmStatus}
        onUpdateType={updateType}
      />

      <AddLeadDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={addLead}
        isAdmin={true}
      />
    </div>
  );
}
