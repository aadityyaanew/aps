"use client";
/**
 * app/admin/centers/page.js — Admin: Manage Units (Centers)
 */
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import CentersTable from "@/components/centers/CentersTable";
import AddCenterDialog from "@/components/centers/AddCenterDialog";
import EditCenterDialog from "@/components/centers/EditCenterDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCenters } from "@/hooks/useCenters";

export default function AdminCentersPage() {
  const { centers, isLoading, createCenter, updateCenter, toggleCenterActive, deleteCenter } = useCenters();
  const [addOpen, setAddOpen]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [toggleTarget, setToggle]     = useState(null);
  const [deleteTarget, setDelete]     = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description={`${centers.length} unit${centers.length !== 1 ? "s" : ""} registered`}
        action={
          <Button onClick={() => setAddOpen(true)} className="bg-[#8B0000] hover:bg-[#a01515] text-white gap-2">
            <Plus size={16} /> Add Unit
          </Button>
        }
      />

      <CentersTable
        centers={centers}
        isLoading={isLoading}
        onEdit={(c) => setEditTarget(c)}
        onToggleActive={(c) => setToggle(c)}
        onDelete={(c) => setDelete(c)}
      />

      <AddCenterDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={createCenter}
      />

      <EditCenterDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={updateCenter}
        center={editTarget}
      />

      {/* Confirmation for Deactivating / Activating Unit */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggle(null)}
        onConfirm={() => toggleCenterActive(toggleTarget?.id, !toggleTarget?.is_active)}
        title={toggleTarget?.is_active ? `Deactivate "${toggleTarget?.name}"?` : `Activate "${toggleTarget?.name}"?`}
        description={
          toggleTarget?.is_active
            ? "Deactivating this unit disables user login. All leads punched by this unit or its associates will NOT be affected and remain safe."
            : "Activating this unit will restore login access immediately."
        }
        confirmLabel={toggleTarget?.is_active ? "Deactivate Unit" : "Activate Unit"}
        variant={toggleTarget?.is_active ? "destructive" : "default"}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDelete(null)}
        onConfirm={() => deleteCenter(deleteTarget?.id)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently remove the unit record. Caution: Any leads with foreign keys may be impacted."
        confirmLabel="Delete Unit"
      />
    </div>
  );
}
