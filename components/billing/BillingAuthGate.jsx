"use client";
/**
 * BillingAuthGate.jsx — Handles first-time billing password creation,
 * subsequent password verification, and session unlocking.
 */
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function BillingAuthGate({ unitId, hasPassword, onUnlocked, children }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem(`billing_unlocked_${unitId}`) === "true";
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Form states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdPassword, setCreatedPassword] = useState(false);

  const effectiveHasPassword = hasPassword || createdPassword;

  const handleLockSession = () => {
    try {
      sessionStorage.removeItem(`billing_unlocked_${unitId}`);
    } catch (e) {}
    setIsUnlocked(false);
    setPassword("");
  };

  async function handleCreatePassword(e) {
    e.preventDefault();
    if (!password || password.length < 4) {
      setError("Billing password must be at least 4 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/billing/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create billing password.");
      }

      // Mark session as unlocked and update state
      sessionStorage.setItem(`billing_unlocked_${unitId}`, "true");
      setCreatedPassword(true);
      setIsUnlocked(true);
      onUnlocked?.();
    } catch (err) {
      setError(err.message || "Failed to create password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPassword(e) {
    e.preventDefault();
    if (!password) {
      setError("Please enter your billing password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/billing/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect billing password.");
      }

      sessionStorage.setItem(`billing_unlocked_${unitId}`, "true");
      setIsUnlocked(true);
      onUnlocked?.();
    } catch (err) {
      setError(err.message || "Incorrect billing password.");
    } finally {
      setLoading(false);
    }
  }

  // If unlocked, render children with optional lock button passed down
  if (isUnlocked) {
    return typeof children === "function" ? children({ onLock: handleLockSession }) : children;
  }

  // If unit has no password set yet -> First-time setup
  if (!effectiveHasPassword) {
    return (
      <div className="max-w-md mx-auto my-12">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 mb-3 border border-red-100 shadow-2xs">
              <KeyRound size={28} />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Create Billing Password
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 max-w-xs mx-auto">
              Welcome to the Billing Section. Set your confidential Billing Password to protect invoices and payment records.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Billing Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter unique billing password"
                    className="pr-10"
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
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#800000] hover:bg-[#6c0000] text-white py-2.5 font-medium transition-all shadow-sm"
              >
                {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
                Set Password & Unlock Billing
              </Button>

              <p className="text-[11px] text-slate-400 text-center">
                Admins can reset this password if you ever forget it.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Subsequent visit: Password Verification Gate
  return (
    <div className="max-w-md mx-auto my-12">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 mb-3 border border-red-100 shadow-2xs">
            <Lock size={28} />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Billing Security Verification
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 max-w-xs mx-auto">
            Please enter your unit&apos;s Billing Password to access invoices and records.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="verify-password">Billing Password</Label>
              <div className="relative">
                <Input
                  id="verify-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter billing password"
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
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800000] hover:bg-[#6c0000] text-white py-2.5 font-medium transition-all shadow-sm"
            >
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              Verify Password & Access Invoices
            </Button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-400">
                Forgot your billing password? Contact your Administrator to reset it.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
