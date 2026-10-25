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
  const [values, setValues] = useState({ name: "", duration: "", fees: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) { setValues((p) => ({ ...p, [k]: v })); }

  async function handleAdd() {
    if (!values.name.trim()) { setError("Course name is required"); return; }
    setError(""); setLoading(true);
    try {
      await onAdd(values);
      setValues({ name: "", duration: "", fees: "" });
    } catch (e) {
      setError(e.message ?? "Failed to add course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 space-y-3">
      <p className="text-sm font-medium text-slate-700">Add New Course</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1 sm:col-span-1">
          <Label htmlFor="c-course-name" className="text-xs">Course Name *</Label>
          <Input
            id="c-course-name"
            placeholder="e.g. MBA Online"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-duration" className="text-xs">Duration</Label>
          <Input
            id="c-duration"
            placeholder="e.g. 2 Years"
            value={values.duration}
            onChange={(e) => set("duration", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-fees" className="text-xs">Fees (₹)</Label>
          <Input
            id="c-fees"
            type="number"
            placeholder="e.g. 150000"
            value={values.fees}
            onChange={(e) => set("fees", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button
        onClick={handleAdd}
        disabled={loading}
        size="sm"
        className="bg-[#8B0000] hover:bg-[#a01515] text-white gap-1.5"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        Add Course
      </Button>
    </div>
  );
}

export default function ManageCoursesDialog({ open, onClose, college }) {
  const { courses, isLoading, createCourse, deleteCourse } = useCollegeCourses(
    open ? college?.id : null
  );
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(courseId) {
    setDeletingId(courseId);
    try { await deleteCourse(courseId); }
    catch (e) { alert(e.message); }
    finally { setDeletingId(null); }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#8B0000]" />
            Courses — {college?.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {/* Current courses list */}
            {courses.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500">
                No courses added yet for this college.
              </div>
            ) : (
              <div className="space-y-2">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {[c.duration, c.fees ? `₹${Number(c.fees).toLocaleString("en-IN")}` : null]
                          .filter(Boolean)
                          .join(" · ") || "No details"}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
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
