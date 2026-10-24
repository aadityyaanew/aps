"use client";
/**
 * app/admin/centers/page.js — Admin: Manage Centers
 */
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import CentersTable from "@/components/centers/CentersTable";
import AddCenterDialog from "@/components/centers/AddCenterDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCenters } from "@/hooks/useCenters";

export default function AdminCentersPage() {
  const { centers, isLoading, createCenter, deleteCenter } = useCenters();
  const [addOpen, setAddOpen]     = useState(false);
  const [deleteTarget, setDelete] = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centers"
        description={`${centers.length} center${centers.length !== 1 ? "s" : ""} registered`}
        action={
          <Button onClick={() => setAddOpen(true)} className="bg-[#8B0000] hover:bg-[#a01515] text-white gap-2">
            <Plus size={16} /> Add Center
          </Button>
        }
      />

      <CentersTable
        centers={centers}
        isLoading={isLoading}
        onDelete={(c) => setDelete(c)}
      />

      <AddCenterDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={createCenter}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDelete(null)}
        onConfirm={() => deleteCenter(deleteTarget?.id)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the center and all associated data. This action cannot be undone."
        confirmLabel="Delete Center"
      />
    </div>
  );
}
