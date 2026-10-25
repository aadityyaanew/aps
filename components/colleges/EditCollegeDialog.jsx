"use client";
/**
 * EditCollegeDialog.jsx — Modal to edit an existing college/university.
 */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function EditCollegeDialog({ open, onClose, onSubmit, college }) {
  const [values, setValues] = useState({ name: "", location: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (college) {
      setValues({
        name: college.name ?? "",
        location: college.location ?? "",
        website: college.website ?? "",
      });
    }
  }, [college]);

  function set(k, v) { setValues((p) => ({ ...p, [k]: v })); }

  async function handleSubmit() {
    if (!values.name.trim()) { setError("College name is required"); return; }
    setError(""); setLoading(true);
    try {
      await onSubmit(college.id, values);
      onClose();
    } catch (e) {
      setError(e.message ?? "Failed to update college");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit College</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-col-name">College / University Name *</Label>
            <Input
              id="edit-col-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-col-location">Location</Label>
            <Input
              id="edit-col-location"
              placeholder="e.g. Solan, Himachal Pradesh"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-col-website">Website</Label>
            <Input
              id="edit-col-website"
              type="url"
              placeholder="https://..."
              value={values.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#8B0000] hover:bg-[#a01515] text-white"
          >
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
