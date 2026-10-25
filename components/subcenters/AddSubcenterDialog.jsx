"use client";
/**
 * AddSubcenterDialog.jsx — Modal to add an Associate (used by Unit panel or Admin panel).
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCenters } from "@/hooks/useCenters";

const EMPTY = { name: "", email: "", password: "", phone: "", organization_name: "", parentCenterId: "" };

export default function AddSubcenterDialog({ open, onClose, onSubmit, isAdmin = false }) {
  const { centers } = useCenters();
  const [values, setValues]   = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function set(k, v) { setValues((p) => ({ ...p, [k]: v })); }

  async function handleSubmit() {
    if (!values.name || !values.email || !values.password) {
      setError("Name, email and password are required.");
      return;
    }
    if (isAdmin && !values.parentCenterId) {
      setError("Please assign a parent unit for this associate.");
      return;
    }
    setError(""); setLoading(true);
    try {
      await onSubmit(values);
      setValues(EMPTY);
      onClose();
    }
    catch (e) { setError(e.message ?? "Failed to create associate."); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={() => { setValues(EMPTY); setError(""); onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add New Associate</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sc-name">Full Name *</Label>
            <Input id="sc-name" placeholder="Contact person name" value={values.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-email">Email *</Label>
            <Input id="sc-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-password">Password *</Label>
            <Input id="sc-password" type="password" value={values.password} onChange={(e) => set("password", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-phone">Phone</Label>
            <Input id="sc-phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-org">Organization</Label>
            <Input id="sc-org" value={values.organization_name} onChange={(e) => set("organization_name", e.target.value)} />
          </div>

          {isAdmin && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="sc-parent">Assign Parent Unit *</Label>
              <Select value={values.parentCenterId} onValueChange={(v) => set("parentCenterId", v)}>
                <SelectTrigger id="sc-parent">
                  <SelectValue placeholder="Select Parent Unit" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.organization_name || c.name} {!c.is_active ? "(Inactive)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#8B0000] hover:bg-[#a01515] text-white">
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            Add Associate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
