"use client";
/**
 * SubcentersTable.jsx — Table listing associates / subcenters.
 * Used in both admin panel (all associates) and center panel (own associates).
 * Fully mobile responsive with smooth touch horizontal scroll.
 */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserX, UserCheck } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function SubcentersTable({
  subcenters,
  isLoading,
  showCenter = false,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  if (isLoading) return <Card><LoadingSpinner /></Card>;
  if (!subcenters?.length) {
    return (
      <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
        <EmptyState title="No associates yet" description="Add your first associate to start tracking leads." />
      </Card>
    );
  }

  const hasActions = Boolean(onEdit || onToggleActive || onDelete);

  return (
    <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-slate-50/70 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Associate Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Organization</TableHead>
              <TableHead className="font-semibold text-slate-700">Email (Login)</TableHead>
              <TableHead className="font-semibold text-slate-700">Phone</TableHead>
              {showCenter && <TableHead className="font-semibold text-slate-700">Parent Unit</TableHead>}
              <TableHead className="font-semibold text-slate-700">Punched Leads</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              {hasActions && <TableHead className="font-semibold text-slate-700 text-right pr-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcenters.map((s) => (
              <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-semibold text-slate-900 text-xs">{s.name}</TableCell>
                <TableCell className="text-xs text-slate-600">{s.organization_name ?? "—"}</TableCell>
                <TableCell className="text-xs font-mono text-[#8B0000]">{s.email}</TableCell>
                <TableCell className="text-xs text-slate-700">{s.phone ?? "—"}</TableCell>
                {showCenter && (
                  <TableCell className="text-xs font-medium text-slate-800">
                    {s.center_name ?? "—"}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{s.lead_count ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={s.is_active ? "default" : "destructive"} className="text-xs">
                    {s.is_active ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>
                {hasActions && (
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(s)}
                          className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          title="Edit Associate credentials"
                        >
                          <Pencil size={14} />
                        </Button>
                      )}

                      {onToggleActive && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onToggleActive(s)}
                          className={`h-8 w-8 ${
                            s.is_active
                              ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                          title={s.is_active ? "Deactivate Associate (does not affect leads)" : "Activate Associate"}
                        >
                          {s.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(s)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete Associate"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
