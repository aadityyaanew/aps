"use client";
/**
 * EditSubcenterDialog.jsx — Modal to edit Associate (Subcenter) details and credentials.
 */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Loader2 } from "lucide-react";
import { useCenters } from "@/hooks/useCenters";

export default function EditSubcenterDialog({
  open,
  onClose,
  onSubmit,
  subcenter,
  isAdmin = false,
}) {
  const { centers } = useCenters();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [parentCenterId, setParentCenterId] = useState("");
  const [isActive, setIsActive] = useState("true");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (subcenter && open) {
      setName(subcenter.name || "");
      setEmail(subcenter.email || "");
      setPassword("");
      setPhone(subcenter.phone || "");
      setOrganizationName(subcenter.organization_name || "");
      setParentCenterId(subcenter.parent_center_id ? String(subcenter.parent_center_id) : "");
      setIsActive(subcenter.is_active ? "true" : "false");
      setError("");
    }
  }, [subcenter, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Associate name and email are required.");
      return;
    }
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit(subcenter.id, {
        name:              name.trim(),
        email:             email.trim(),
        password:          password ? password.trim() : undefined,
        phone:             phone.trim() || null,
        organization_name: organizationName.trim() || null,
        parentCenterId:    parentCenterId ? parseInt(parentCenterId, 10) : undefined,
        is_active:         isActive === "true",
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update associate credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Edit Associate & Credentials
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Update name, email login, password, and status. Leads punched by this associate will NOT be affected.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="asc-name">Associate Name *</Label>
            <Input
              id="asc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact person name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="asc-email">Email (Login Credential) *</Label>
            <Input
              id="asc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="associate@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="asc-pwd" className="flex items-center justify-between">
              <span>Reset Password</span>
              <span className="text-[11px] text-gray-400">Leave blank to keep unchanged</span>
            </Label>
            <Input
              id="asc-pwd"
              type="password"
              placeholder="New password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="asc-phone">Phone</Label>
              <Input
                id="asc-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asc-org">Organization</Label>
              <Input
                id="asc-org"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Organization name"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <Label htmlFor="asc-parent">Parent Unit</Label>
              <Select value={parentCenterId} onValueChange={setParentCenterId}>
                <SelectTrigger id="asc-parent">
                  <SelectValue placeholder="Select Parent Unit" />
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
            <Label htmlFor="asc-status">Account Status</Label>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger id="asc-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active (Login Enabled)</SelectItem>
                <SelectItem value="false">Deactivated (Login Disabled)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-400">
              Deactivating disables login access only. All added leads remain safely stored and linked to this associate.
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#8B0000] hover:bg-[#a01515] text-white">
              {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
