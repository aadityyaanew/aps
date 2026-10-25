"use client";
/**
 * ManageCoursesDialog.jsx — Dialog to view, add, and delete courses for a college.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, BookOpen } from "lucide-react";
import { useCollegeCourses } from "@/hooks/useColleges";
import LoadingSpinner from "@/components/common/LoadingSpinner";

function AddCourseForm({ onAdd }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e) {
    e?.preventDefault();
    if (!name.trim()) {
      setError("Course name is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onAdd({ name: name.trim() });
      setName("");
    } catch (e) {
      setError(e.message ?? "Failed to add course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAdd} className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 space-y-3">
      <p className="text-sm font-medium text-slate-700">Add New Course</p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
        <div className="space-y-1 flex-1">
          <Label htmlFor="c-course-name" className="text-xs">Course Name *</Label>
          <Input
            id="c-course-name"
            placeholder="e.g. MBA Online"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-sm bg-white"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="h-9 bg-[#8B0000] hover:bg-[#a01515] text-white gap-1.5 shrink-0"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Add Course
        </Button>
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </form>
  );
}

export default function ManageCoursesDialog({ open, onClose, college }) {
  const { courses, isLoading, createCourse, deleteCourse } = useCollegeCourses(
    open ? college?.id : null
  );
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(courseId) {
    setDeletingId(courseId);
    try {
      await deleteCourse(courseId);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <BookOpen size={18} className="text-[#8B0000]" />
            Courses — {college?.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {/* Current courses list */}
            {courses.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 border rounded-lg bg-slate-50/50">
                No courses added yet for this college.
              </div>
            ) : (
              <div className="space-y-2">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 hover:border-slate-300 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      title="Delete course"
                    >
                      {deletingId === c.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add course form */}
        <AddCourseForm onAdd={createCourse} />
      </DialogContent>
    </Dialog>
  );
}
