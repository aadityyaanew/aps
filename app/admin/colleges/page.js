"use client";
/**
 * app/admin/colleges/page.js — Admin: Manage Colleges & Courses
 */
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import CollegesTable from "@/components/colleges/CollegesTable";
import AddCollegeDialog from "@/components/colleges/AddCollegeDialog";
import EditCollegeDialog from "@/components/colleges/EditCollegeDialog";
import ManageCoursesDialog from "@/components/colleges/ManageCoursesDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useColleges } from "@/hooks/useColleges";

export default function AdminCollegesPage() {
  const { colleges, isLoading, createCollege, updateCollege, deleteCollege } = useColleges();
  const [addOpen, setAddOpen]             = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [courseTarget, setCourseTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCollege(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colleges & Courses"
        description={`${colleges.length} college${colleges.length !== 1 ? "s" : ""} registered`}
        action={
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-[#8B0000] hover:bg-[#a01515] text-white gap-2"
          >
            <Plus size={16} /> Add College
          </Button>
        }
      />

      <CollegesTable
        colleges={colleges}
        isLoading={isLoading}
        onEdit={setEditTarget}
        onManageCourses={setCourseTarget}
        onDelete={setDeleteTarget}
      />

      <AddCollegeDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={createCollege}
      />

      <EditCollegeDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={updateCollege}
        college={editTarget}
      />

      <ManageCoursesDialog
        open={!!courseTarget}
        onClose={() => setCourseTarget(null)}
        college={courseTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the college and all its associated courses. Existing leads with this college will lose the association."
        confirmLabel="Delete College"
      />
    </div>
  );
}
