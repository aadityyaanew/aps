"use client";
/**
 * SubcentersTable.jsx — Table listing subcenters.
 * Used in both admin panel (all subcenters) and center panel (own subcenters).
 */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function SubcentersTable({ subcenters, isLoading, showCenter = false }) {
  if (isLoading) return <Card><LoadingSpinner /></Card>;
  if (!subcenters?.length) return (
    <Card>
      <EmptyState title="No sub centers yet" description="Add your first sub center to start tracking leads." />
    </Card>
  );

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
              {showCenter && <TableHead>Parent Center</TableHead>}
              <TableHead>Leads</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcenters.map((s) => (
              <TableRow key={s.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-[#8B0000]">{s.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{s.organization_name ?? "—"}</TableCell>
                <TableCell className="text-sm">{s.email}</TableCell>
                <TableCell className="text-sm">{s.phone ?? "—"}</TableCell>
                {showCenter && <TableCell className="text-sm text-[#8B0000]">{s.center_name ?? "—"}</TableCell>}
                <TableCell><Badge variant="secondary">{s.lead_count ?? 0}</Badge></TableCell>
                <TableCell>
                  <Badge variant={s.is_active ? "default" : "destructive"}>
                    {s.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
