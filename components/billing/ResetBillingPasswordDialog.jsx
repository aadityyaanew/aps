"use client";
/**
 * ResetBillingPasswordDialog.jsx — Modal for Admin to create or reset a unit's Billing Password.
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
import { KeyRound, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetBillingPasswordDialog({ open, onClose, unit, onPasswordReset }) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setNewPassword("");
    setError("");
    setSuccess(false);
    onClose();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!unit) return;

    if (!newPassword || newPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/billing/units/${unit.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to reset billing password.");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onPasswordReset?.();
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  if (!unit) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-[#8B0000]">
              <KeyRound size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                {unit.has_billing_password ? "Reset Billing Password" : "Create Billing Password"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Unit: {unit.name} ({unit.organization_name || unit.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="admin-new-password">New Billing Password *</Label>
            <div className="relative">
              <Input
                id="admin-new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new 4+ character password"
                className="pr-10"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              The unit will be required to enter this password to view billing records and upload invoices.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
              <span>Billing password updated successfully!</span>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || success}
              className="bg-[#800000] hover:bg-[#6c0000] text-white shadow-sm"
            >
              {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Save Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
