"use client";
/**
 * AddLeadForm.jsx — Form fields for adding a new lead.
 * Used inside AddLeadDialog.jsx.
 * If isAdmin is true, allows assigning the lead to a specific Center.
 */
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUniversities, useCourses } from "@/hooks/useUniversities";
import { useCenters } from "@/hooks/useCenters";

export default function AddLeadForm({ values, onChange, isAdmin = false }) {
  const { universities } = useUniversities();
  const { courses } = useCourses(values.universityId);
  const { centers } = useCenters();

  function set(field, value) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="lead-name">Student Name *</Label>
        <Input
          id="lead-name"
          placeholder="Full name"
          value={values.studentName ?? ""}
          onChange={(e) => set("studentName", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-phone">Phone *</Label>
        <Input
          id="lead-phone"
          placeholder="10-digit mobile"
          value={values.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-email">Email</Label>
        <Input
          id="lead-email"
          type="email"
          placeholder="student@email.com"
          value={values.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>

      {isAdmin && (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="lead-center">Assign Center *</Label>
          <Select
            value={values.centerId ? String(values.centerId) : ""}
            onValueChange={(v) => set("centerId", v)}
          >
            <SelectTrigger id="lead-center">
              <SelectValue placeholder="Select target center" />
            </SelectTrigger>
            <SelectContent>
              {centers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.organization_name || c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="lead-university">University</Label>
        <Select
          value={values.universityId ? String(values.universityId) : ""}
          onValueChange={(v) => {
            set("universityId", v);
            set("courseId", "");
          }}
        >
          <SelectTrigger id="lead-university">
            <SelectValue placeholder="Select university" />
          </SelectTrigger>
          <SelectContent>
            {universities.map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-course">Course</Label>
        <Select
          value={values.courseId ? String(values.courseId) : ""}
          onValueChange={(v) => set("courseId", v)}
          disabled={!values.universityId}
        >
          <SelectTrigger id="lead-course">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="lead-notes">Notes</Label>
        <Input
          id="lead-notes"
          placeholder="Any additional notes..."
          value={values.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>
    </div>
  );
}
