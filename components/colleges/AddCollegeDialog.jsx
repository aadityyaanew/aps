"use client";
/**
 * AddCollegeDialog.jsx — Modal to create a new college/university.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const EMPTY = { name: "", location: "", website: "" };

export default function AddCollegeDialog({ open, onClose, onSubmit }) {
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) { setValues((p) => ({ ...p, [k]: v })); }

  async function handleSubmit() {
    if (!values.name.trim()) { setError("College name is required"); return; }
    setError(""); setLoading(true);
    try {
      await onSubmit(values);
      setValues(EMPTY);
      onClose();
    } catch (e) {
      setError(e.message ?? "Failed to create college");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setValues(EMPTY); setError(""); onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New College</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="col-name">College / University Name *</Label>
            <Input
              id="col-name"
              placeholder="e.g. Shoolini University"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="col-location">Location</Label>
            <Input
              id="col-location"
              placeholder="e.g. Solan, Himachal Pradesh"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="col-website">Website</Label>
            <Input
              id="col-website"
              type="url"
              placeholder="https://..."
              value={values.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#8B0000] hover:bg-[#a01515] text-white"
          >
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            Add College
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
