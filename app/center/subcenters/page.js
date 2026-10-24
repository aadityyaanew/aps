"use client";
/**
 * app/center/subcenters/page.js — Center: Manage own subcenters
 */
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import SubcentersTable from "@/components/subcenters/SubcentersTable";
import AddSubcenterDialog from "@/components/subcenters/AddSubcenterDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSubcenters } from "@/hooks/useSubcenters";

export default function CenterSubcentersPage() {
  const { subcenters, isLoading, createSubcenter } = useSubcenters("center");
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sub Centers"
        description={`${subcenters.length} sub center${subcenters.length !== 1 ? "s" : ""} under your center`}
        action={
          <Button onClick={() => setAddOpen(true)} className="bg-[#8B0000] hover:bg-[#a01515] text-white gap-2">
            <Plus size={16} /> Add Sub Center
          </Button>
        }
      />

      <SubcentersTable subcenters={subcenters} isLoading={isLoading} />

      <AddSubcenterDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={createSubcenter}
      />
    </div>
  );
}
