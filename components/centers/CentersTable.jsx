"use client";
/**
 * CentersTable.jsx — Table of all centers (admin view).
 */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CentersTable({ centers, isLoading, onEdit, onDelete }) {
  if (isLoading) return <Card><LoadingSpinner /></Card>;
  if (!centers?.length) return <Card><EmptyState title="No centers yet" description="Create your first center to get started." /></Card>;

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Name</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Sub Centers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {centers.map((c) => (
              <TableRow key={c.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{c.organization_name ?? "—"}</TableCell>
                <TableCell className="text-sm text-[#8B0000]">{c.email}</TableCell>
                <TableCell className="text-sm">{c.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{c.subcenter_count ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={c.is_active ? "default" : "destructive"}>
                    {c.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onEdit?.(c)} className="h-8 w-8">
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete?.(c)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
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
