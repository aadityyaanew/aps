"use client";
/**
 * app/admin/subcenters/page.js — Admin: View & Manage all Associates across units
 */
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import SubcentersTable from "@/components/subcenters/SubcentersTable";
import AddSubcenterDialog from "@/components/subcenters/AddSubcenterDialog";
import EditSubcenterDialog from "@/components/subcenters/EditSubcenterDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSubcenters } from "@/hooks/useSubcenters";

export default function AdminSubcentersPage() {
  const { subcenters, isLoading, createSubcenter, updateSubcenter, toggleSubcenterActive, deleteSubcenter } =
    useSubcenters("admin");

  const [addOpen, setAddOpen]       = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toggleTarget, setToggle]   = useState(null);
  const [deleteTarget, setDelete]   = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Associates"
        description={`${subcenters.length} associate${subcenters.length !== 1 ? "s" : ""} across all units`}
        action={
          <Button onClick={() => setAddOpen(true)} className="bg-[#8B0000] hover:bg-[#a01515] text-white gap-2">
            <Plus size={16} /> Add Associate
          </Button>
        }
      />

      <SubcentersTable
        subcenters={subcenters}
        isLoading={isLoading}
        showCenter
        onEdit={(s) => setEditTarget(s)}
        onToggleActive={(s) => setToggle(s)}
        onDelete={(s) => setDelete(s)}
      />

      <AddSubcenterDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={createSubcenter}
        isAdmin={true}
      />

      <EditSubcenterDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={updateSubcenter}
        subcenter={editTarget}
        isAdmin={true}
      />

      {/* Confirmation for Deactivating / Activating Associate */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggle(null)}
        onConfirm={() => toggleSubcenterActive(toggleTarget?.id, !toggleTarget?.is_active)}
        title={toggleTarget?.is_active ? `Deactivate "${toggleTarget?.name}"?` : `Activate "${toggleTarget?.name}"?`}
        description={
          toggleTarget?.is_active
            ? "Deactivating this associate disables their login access. All leads punched by this associate will NOT be affected and remain intact in the system."
            : "Activating this associate will restore login access immediately."
        }
        confirmLabel={toggleTarget?.is_active ? "Deactivate Associate" : "Activate Associate"}
        variant={toggleTarget?.is_active ? "destructive" : "default"}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDelete(null)}
        onConfirm={() => deleteSubcenter(deleteTarget?.id)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the associate record."
        confirmLabel="Delete Associate"
      />
    </div>
  );
}
