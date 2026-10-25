"use client";
/**
 * CentersTable.jsx — Table of all units / centers (admin view).
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
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Unit Name</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Email (Login)</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Associates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {centers.map((c) => (
              <TableRow key={c.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-900">{c.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{c.organization_name ?? "—"}</TableCell>
                <TableCell className="text-sm font-mono text-[#8B0000]">{c.email}</TableCell>
                <TableCell className="text-sm">{c.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{c.subcenter_count ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={c.is_active ? "default" : "destructive"}>
                    {c.is_active ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit?.(c)}
                      className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
