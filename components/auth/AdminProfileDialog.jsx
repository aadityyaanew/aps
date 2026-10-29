"use client";
/**
 * AdminProfileDialog.jsx — Modal for Super Admin to edit profile & credentials.
 * Fully mobile responsive.
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
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminProfileDialog({ open, onClose, user }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setPhone(user?.phone || "");
      setOrganizationName(user?.organizationName || user?.organization_name || "");
      setNewPassword("");
      setError("");
      setSuccess(false);
    }
  }, [open, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Super Admin name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          organization_name: organizationName.trim() || null,
          password: newPassword ? newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-[#8B0000] rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">
                Super Admin Profile & Credentials
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Edit your administrator account credentials.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 size={42} className="text-emerald-500 animate-in zoom-in-75 duration-300" />
            <p className="text-sm font-medium text-gray-900">Profile Updated Successfully!</p>
            <p className="text-xs text-gray-500">Your account credentials have been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Super Admin Name *</Label>
              <Input
                id="admin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email (Login Credential) *</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="admin-phone">Phone</Label>
                <Input
                  id="admin-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-org">Organization</Label>
                <Input
                  id="admin-org"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Organization"
                />
              </div>
            </div>

            <div className="space-y-1.5 border-t pt-3">
              <Label htmlFor="admin-new-pwd" className="flex items-center justify-between">
                <span>Reset Password</span>
                <span className="text-[11px] font-normal text-gray-400">Optional</span>
              </Label>
              <Input
                id="admin-new-pwd"
                type="password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
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
        )}
      </DialogContent>
    </Dialog>
  );
}
