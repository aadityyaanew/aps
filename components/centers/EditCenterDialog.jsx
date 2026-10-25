"use client";
/**
 * EditCenterDialog.jsx — Modal for Super Admin to edit Unit details and credentials.
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
import { Building2, Loader2 } from "lucide-react";

export default function EditCenterDialog({ open, onClose, onSubmit, center }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState("true");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (center && open) {
      setName(center.name || "");
      setEmail(center.email || "");
      setPassword("");
      setPhone(center.phone || "");
      setOrganizationName(center.organization_name || "");
      setAddress(center.address || "");
      setIsActive(center.is_active ? "true" : "false");
      setError("");
    }
  }, [center, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Unit name and email are required.");
      return;
    }
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit(center.id, {
        name:              name.trim(),
        email:             email.trim(),
        password:          password ? password.trim() : undefined,
        phone:             phone.trim() || null,
        organization_name: organizationName.trim() || null,
        address:           address.trim() || null,
        is_active:         isActive === "true",
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update unit credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-[#8B0000] rounded-lg">
              <Building2 size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Edit Unit & Credentials
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Update name, email login, password, and status. Leads punched by this unit will NOT be affected.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="unit-name">Unit Name *</Label>
            <Input
              id="unit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unit / Center contact person"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit-email">Email (Login Credential) *</Label>
            <Input
              id="unit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="unit@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit-pwd" className="flex items-center justify-between">
              <span>Reset Password</span>
              <span className="text-[11px] text-gray-400">Leave blank to keep unchanged</span>
            </Label>
            <Input
              id="unit-pwd"
              type="password"
              placeholder="New password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="unit-phone">Phone</Label>
              <Input
                id="unit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit-org">Organization</Label>
              <Input
                id="unit-org"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Organization name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit-addr">Address</Label>
            <Input
              id="unit-addr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Physical address"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit-status">Account Status</Label>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger id="unit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active (Login Enabled)</SelectItem>
                <SelectItem value="false">Deactivated (Login Disabled)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-400">
              Deactivating disables login access only. Existing punched leads remain safe and intact.
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
