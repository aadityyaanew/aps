"use client";
/**
 * AddLeadForm.jsx — Form fields for adding a new lead.
 * Used inside AddLeadDialog.jsx.
 * Allows selecting existing or quickly adding new colleges & courses inline.
 */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUniversities, useCourses } from "@/hooks/useUniversities";
import { useCenters } from "@/hooks/useCenters";
import { Plus, Loader2, X, Check } from "lucide-react";

export default function AddLeadForm({ values, onChange, isAdmin = false }) {
  const { universities, addUniversity, isLoading: uniLoading } = useUniversities();
  const { courses, addCourse, isLoading: coursesLoading } = useCourses(values?.universityId);
  const { centers } = useCenters();

  // Quick inline creation state
  const [showAddUni, setShowAddUni] = useState(false);
  const [newUniName, setNewUniName] = useState("");
  const [newUniLocation, setNewUniLocation] = useState("");
  const [newUniCourse, setNewUniCourse] = useState("");
  const [savingUni, setSavingUni] = useState(false);
  const [uniError, setUniError] = useState("");

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDuration, setNewCourseDuration] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseError, setCourseError] = useState("");

  // Atomic state updater to prevent race conditions & stale closure overwrites
  function update(patch) {
    if (typeof onChange === "function") {
      onChange((prev) => ({
        ...(prev || values || {}),
        ...patch,
      }));
    }
  }

  async function handleQuickAddUni(e) {
    e?.preventDefault();
    if (!newUniName.trim()) {
      setUniError("University name is required");
      return;
    }
    setUniError("");
    setSavingUni(true);
    try {
      const res = await addUniversity({
        name: newUniName.trim(),
        location: newUniLocation.trim(),
        courseName: newUniCourse.trim(),
      });
      if (res?.id) {
        update({
          universityId: String(res.id),
          courseId: res.courseId ? String(res.courseId) : "",
        });
      }
      setNewUniName("");
      setNewUniLocation("");
      setNewUniCourse("");
      setShowAddUni(false);
    } catch (err) {
      setUniError(err.message ?? "Failed to add university");
    } finally {
      setSavingUni(false);
    }
  }

  async function handleQuickAddCourse(e) {
    e?.preventDefault();
    if (!newCourseName.trim()) {
      setCourseError("Course name is required");
      return;
    }
    setCourseError("");
    setSavingCourse(true);
    try {
      const res = await addCourse({
        name: newCourseName.trim(),
        duration: newCourseDuration.trim(),
      });
      if (res?.id) {
        update({ courseId: String(res.id) });
      }
      setNewCourseName("");
      setNewCourseDuration("");
      setShowAddCourse(false);
    } catch (err) {
      setCourseError(err.message ?? "Failed to add course");
    } finally {
      setSavingCourse(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="lead-name">Student Name *</Label>
        <Input
          id="lead-name"
          placeholder="Full name"
          value={values?.studentName ?? ""}
          onChange={(e) => update({ studentName: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-phone">Phone *</Label>
        <Input
          id="lead-phone"
          placeholder="10-digit mobile"
          value={values?.phone ?? ""}
          onChange={(e) => update({ phone: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-email">Email *</Label>
        <Input
          id="lead-email"
          type="email"
          placeholder="student@email.com"
          value={values?.email ?? ""}
          onChange={(e) => update({ email: e.target.value })}
        />
      </div>

      {isAdmin && (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="lead-center">Assign Unit *</Label>
          <div className="relative">
            <select
              id="lead-center"
              value={values?.centerId ? String(values.centerId) : ""}
              onChange={(e) => update({ centerId: e.target.value })}
              className="flex h-9 w-full appearance-none items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer pr-8"
            >
              <option value="" disabled>Select target unit</option>
              {centers.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.organization_name || c.name} {!c.is_active ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              ▼
            </span>
          </div>
        </div>
      )}

      {/* University Selection & Inline Creation */}
      <div className="space-y-1.5 sm:col-span-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="lead-university">University *</Label>
          {!showAddUni && (
            <button
              type="button"
              onClick={() => setShowAddUni(true)}
              className="text-xs font-medium text-[#800000] hover:text-[#600000] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={13} /> Add University
            </button>
          )}
        </div>

        {showAddUni ? (
          <div className="rounded-lg border border-[#800000]/25 bg-[#800000]/5 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#800000]">Quick Add University</span>
              <button
                type="button"
                onClick={() => { setShowAddUni(false); setUniError(""); }}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                placeholder="University name *"
                value={newUniName}
                onChange={(e) => setNewUniName(e.target.value)}
                className="h-8 text-xs bg-white dark:bg-slate-900"
              />
              <Input
                placeholder="Location (e.g. Solan, HP)"
                value={newUniLocation}
                onChange={(e) => setNewUniLocation(e.target.value)}
                className="h-8 text-xs bg-white dark:bg-slate-900"
              />
              <Input
                placeholder="Initial Course (e.g. MBA)"
                value={newUniCourse}
                onChange={(e) => setNewUniCourse(e.target.value)}
                className="h-8 text-xs bg-white dark:bg-slate-900"
              />
            </div>
            {uniError && <p className="text-xs text-red-600 font-medium">{uniError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setShowAddUni(false); setUniError(""); }}
                disabled={savingUni}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleQuickAddUni}
                disabled={savingUni}
                className="h-7 text-xs bg-[#800000] hover:bg-[#6c0000] text-white"
              >
                {savingUni ? <Loader2 size={12} className="animate-spin mr-1" /> : <Check size={12} className="mr-1" />}
                Save & Select
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <select
              id="lead-university"
              value={values?.universityId ? String(values.universityId) : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__NEW__") {
                  setShowAddUni(true);
                  return;
                }
                update({
                  universityId: val,
                  courseId: "",
                });
              }}
              className="flex h-9 w-full appearance-none items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer pr-8"
            >
              <option value="" disabled>
                {uniLoading ? "Loading universities..." : "Select university"}
              </option>
              {universities.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
              <option value="__NEW__" className="text-[#800000] font-medium">+ Add New University...</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              ▼
            </span>
          </div>
        )}
      </div>

      {/* Course Selection & Inline Creation */}
      <div className="space-y-1.5 sm:col-span-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="lead-course">Course *</Label>
          {values?.universityId && !showAddCourse && (
            <button
              type="button"
              onClick={() => setShowAddCourse(true)}
              className="text-xs font-medium text-[#800000] hover:text-[#600000] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={13} /> Add Course
            </button>
          )}
        </div>

        {showAddCourse ? (
          <div className="rounded-lg border border-[#800000]/25 bg-[#800000]/5 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#800000]">Quick Add Course to University</span>
              <button
                type="button"
                onClick={() => { setShowAddCourse(false); setCourseError(""); }}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="Course name * (e.g. MBA Online)"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="h-8 text-xs bg-white dark:bg-slate-900"
              />
              <Input
                placeholder="Duration (e.g. 2 Years)"
                value={newCourseDuration}
                onChange={(e) => setNewCourseDuration(e.target.value)}
                className="h-8 text-xs bg-white dark:bg-slate-900"
              />
            </div>
            {courseError && <p className="text-xs text-red-600 font-medium">{courseError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setShowAddCourse(false); setCourseError(""); }}
                disabled={savingCourse}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleQuickAddCourse}
                disabled={savingCourse}
                className="h-7 text-xs bg-[#800000] hover:bg-[#6c0000] text-white"
              >
                {savingCourse ? <Loader2 size={12} className="animate-spin mr-1" /> : <Check size={12} className="mr-1" />}
                Save & Select
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <select
              id="lead-course"
              value={values?.courseId ? String(values.courseId) : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__NEW__") {
                  setShowAddCourse(true);
                  return;
                }
                update({ courseId: val });
              }}
              disabled={!values?.universityId || coursesLoading}
              className="flex h-9 w-full appearance-none items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer pr-8"
            >
              <option value="" disabled>
                {!values?.universityId
                  ? "Select a university first"
                  : coursesLoading
                  ? "Loading courses..."
                  : courses.length === 0
                  ? "No courses found — click + Add Course"
                  : "Select course"}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} {c.duration ? `(${c.duration})` : ""}
                </option>
              ))}
              {values?.universityId && (
                <option value="__NEW__" className="text-[#800000] font-medium">+ Add New Course...</option>
              )}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              ▼
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
