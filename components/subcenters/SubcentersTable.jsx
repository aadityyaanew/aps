"use client";
/**
 * SubcentersTable.jsx — Table listing associates / subcenters.
 * Used in both admin panel (all associates) and center panel (own associates).
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
      <Card>
        <EmptyState title="No associates yet" description="Add your first associate to start tracking leads." />
      </Card>
    );
  }

  const hasActions = Boolean(onEdit || onToggleActive || onDelete);

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Associate Name</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Email (Login)</TableHead>
              <TableHead>Phone</TableHead>
              {showCenter && <TableHead>Parent Unit</TableHead>}
              <TableHead>Punched Leads</TableHead>
              <TableHead>Status</TableHead>
              {hasActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcenters.map((s) => (
              <TableRow key={s.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-900">{s.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{s.organization_name ?? "—"}</TableCell>
                <TableCell className="text-sm font-mono text-[#8B0000]">{s.email}</TableCell>
                <TableCell className="text-sm">{s.phone ?? "—"}</TableCell>
                {showCenter && (
                  <TableCell className="text-sm font-medium text-slate-800">
                    {s.center_name ?? "—"}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="secondary">{s.lead_count ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={s.is_active ? "default" : "destructive"}>
                    {s.is_active ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>
                {hasActions && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(s)}
                          className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
