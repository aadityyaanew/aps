"use client";
/**
 * UnitBillingAccessTable.jsx — Admin table for controlling billing access and passwords per unit.
 * Fully mobile responsive with smooth touch scrolling.
 */
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  KeyRound,
  Search,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import ResetBillingPasswordDialog from "./ResetBillingPasswordDialog";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function UnitBillingAccessTable({ units = [], isLoading = false, onUpdated }) {
  const [search, setSearch] = useState("");
  const [updatingUnitId, setUpdatingUnitId] = useState(null);
  const [passwordUnit, setPasswordUnit] = useState(null);

  const filteredUnits = units.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.organization_name?.toLowerCase().includes(q)
    );
  });

  async function handleToggleAccess(unit) {
    setUpdatingUnitId(unit.id);
    const newStatus = !unit.billing_access;
    try {
      const res = await fetch(`/api/billing/units/${unit.id}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing_access: newStatus }),
      });
      if (res.ok) {
        onUpdated?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUnitId(null);
    }
  }

  return (
    <>
      <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Unit Billing Access & Security</h3>
            <p className="text-xs text-slate-500">
              Grant or revoke Billing section access and manage billing passwords for individual units.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search units..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : filteredUnits.length === 0 ? (
          <EmptyState title="No Units Found" description="No units match the search query." />
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-b border-slate-200">
                  <TableHead className="font-semibold text-slate-700">Unit Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Organization</TableHead>
                  <TableHead className="font-semibold text-slate-700">Email (Login)</TableHead>
                  <TableHead className="font-semibold text-slate-700">Billing Access</TableHead>
                  <TableHead className="font-semibold text-slate-700">Billing Password</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((u) => {
                  const isUpdating = updatingUnitId === u.id;
                  const hasAccess = Boolean(u.billing_access);
                  const hasPassword = Boolean(u.has_billing_password);

                  return (
                    <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900 text-xs">
                        {u.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {u.organization_name || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[#800000]">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${
                            hasAccess
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {hasAccess ? (
                            <span className="flex items-center gap-1">
                              <Unlock size={12} /> Authorized
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Lock size={12} /> Restricted
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            hasPassword
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {hasPassword ? "Password Set" : "Not Set"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant={hasAccess ? "outline" : "default"}
                            disabled={isUpdating}
                            onClick={() => handleToggleAccess(u)}
                            className={`h-7 text-xs ${
                              hasAccess
                                ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                                : "bg-emerald-700 hover:bg-emerald-800 text-white"
                            }`}
                          >
                            {isUpdating && <Loader2 size={12} className="animate-spin mr-1" />}
                            {hasAccess ? "Revoke Access" : "Grant Access"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPasswordUnit(u)}
                            className="h-7 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1"
                            title="Create or Reset Billing Password"
                          >
                            <KeyRound size={12} />
                            {hasPassword ? "Reset Pwd" : "Set Pwd"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ResetBillingPasswordDialog
        open={Boolean(passwordUnit)}
        unit={passwordUnit}
        onClose={() => setPasswordUnit(null)}
        onPasswordReset={() => onUpdated?.()}
      />
    </>
  );
}
