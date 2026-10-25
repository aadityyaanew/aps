"use client";
/**
 * AddLeadDialog.jsx — Modal dialog to add a new lead.
 * Delegates form to AddLeadForm.jsx.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AddLeadForm from "./AddLeadForm";

const EMPTY = {
  studentName: "",
  phone: "",
  email: "",
  universityId: "",
  courseId: "",
  centerId: "",
};

export default function AddLeadDialog({ open, onClose, onSubmit, isAdmin = false }) {
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!values.studentName?.trim()) {
      setError("Student name is required.");
      return;
    }
    if (!values.phone?.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!values.email?.trim()) {
      setError("Email is required.");
      return;
    }
    if (isAdmin && !values.centerId) {
      setError("Please select a target unit.");
      return;
    }
    if (!values.universityId) {
      setError("Please select a university.");
      return;
    }
    if (!values.courseId) {
      setError("Please select a course.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(values);
      setValues(EMPTY);
      onClose();
    } catch (e) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setValues(EMPTY);
    setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>

        <AddLeadForm values={values} onChange={setValues} isAdmin={isAdmin} />

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#800000] hover:bg-[#6c0000] text-white"
          >
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            Add Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
