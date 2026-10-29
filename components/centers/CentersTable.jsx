"use client";
/**
 * CentersTable.jsx — Table of all units / centers (admin view).
 * Fully mobile responsive with horizontal scroll and touch-friendly controls.
 */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserX, UserCheck } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CentersTable({ centers, isLoading, onEdit, onToggleActive, onDelete }) {
  if (isLoading) return <Card><LoadingSpinner /></Card>;
  if (!centers?.length) {
    return <Card><EmptyState title="No units yet" description="Create your first unit to get started." /></Card>;
  }

  return (
    <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-slate-50/70 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Unit Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Organization</TableHead>
              <TableHead className="font-semibold text-slate-700">Email (Login)</TableHead>
              <TableHead className="font-semibold text-slate-700">Phone</TableHead>
              <TableHead className="font-semibold text-slate-700">Associates</TableHead>
              <TableHead className="font-semibold text-slate-700">Billing</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {centers.map((c) => (
              <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-semibold text-slate-900 text-xs">{c.name}</TableCell>
                <TableCell className="text-xs text-slate-600">{c.organization_name ?? "—"}</TableCell>
                <TableCell className="text-xs font-mono text-[#8B0000]">{c.email}</TableCell>
                <TableCell className="text-xs text-slate-700">{c.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{c.subcenter_count ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] ${
                      c.billing_access
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {c.billing_access ? "Authorized" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={c.is_active ? "default" : "destructive"} className="text-xs">
                    {c.is_active ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit?.(c)}
                      className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      title="Edit Unit credentials"
                    >
                      <Pencil size={14} />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onToggleActive?.(c)}
                      className={`h-8 w-8 ${
                        c.is_active
                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      }`}
                      title={c.is_active ? "Deactivate Unit (does not affect leads)" : "Activate Unit"}
                    >
                      {c.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                    </Button>

                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete?.(c)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete Unit"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
