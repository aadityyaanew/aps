"use client";
/**
 * AddLeadForm.jsx — Form fields for adding a new lead.
 * Used inside AddLeadDialog.jsx.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUniversities, useCourses } from "@/hooks/useUniversities";
import { useCenters } from "@/hooks/useCenters";

export default function AddLeadForm({ values, onChange, isAdmin = false }) {
  const { universities, isLoading: uniLoading } = useUniversities();
  const { courses, isLoading: coursesLoading } = useCourses(values?.universityId);
  const { centers } = useCenters();

  // Atomic state updater to prevent race conditions & stale closure overwrites
  function update(patch) {
    if (typeof onChange === "function") {
      onChange((prev) => ({
        ...(prev || values || {}),
        ...patch,
      }));
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

      {/* University Selection */}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="lead-university">University *</Label>
        <div className="relative">
          <select
            id="lead-university"
            value={values?.universityId ? String(values.universityId) : ""}
            onChange={(e) => {
              update({
                universityId: e.target.value,
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
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
            ▼
          </span>
        </div>
      </div>

      {/* Course Selection */}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="lead-course">Course *</Label>
        <div className="relative">
          <select
            id="lead-course"
            value={values?.courseId ? String(values.courseId) : ""}
            onChange={(e) => update({ courseId: e.target.value })}
            disabled={!values?.universityId || coursesLoading}
            className="flex h-9 w-full appearance-none items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer pr-8"
          >
            <option value="" disabled>
              {!values?.universityId
                ? "Select a university first"
                : coursesLoading
                ? "Loading courses..."
                : courses.length === 0
                ? "No courses available for this university"
                : "Select course"}
            </option>
            {courses.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
            ▼
          </span>
        </div>
      </div>
    </div>
  );
}
