"use client";
/**
 * LeadsTable.jsx — Data table shell for leads.
 * Delegates column rendering to LeadsTableColumns.jsx.
 * Handles client-side search filtering.
 */
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import LeadFilters from "./LeadFilters";
import LeadStatusBadge from "./LeadStatusBadge";
import AdmStatusBadge from "./AdmStatusBadge";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";

export default function LeadsTable({ leads, isLoading, showCenter = false, showSubcenter = false }) {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const debounced = useDebounce(search);

  const filtered = leads.filter((l) => {
    const matchSearch = !debounced ||
      l.student_name?.toLowerCase().includes(debounced.toLowerCase()) ||
      l.phone?.includes(debounced) ||
      l.email?.toLowerCase().includes(debounced.toLowerCase());
    const matchStatus = !status || l.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <Card>
      <div className="p-4 border-b">
        <LeadFilters search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No leads found" description="Try adjusting your search or add a new lead." />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>University / Course</TableHead>
                <TableHead>Type</TableHead>
                {showCenter    && <TableHead>Center</TableHead>}
                {showSubcenter && <TableHead>Sub Center</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>ADM Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{lead.student_name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{lead.phone}</div>
                    {lead.email && <div className="text-xs text-gray-400">{lead.email}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{lead.university_name ?? "—"}</div>
                    {lead.course_name && <div className="text-xs text-gray-400">{lead.course_name}</div>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${lead.lead_type === "primary" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                      {lead.lead_type === "primary" ? "Primary" : "Secondary"}
                    </span>
                  </TableCell>
                  {showCenter    && <TableCell className="text-sm text-gray-600">{lead.center_name ?? "—"}</TableCell>}
                  {showSubcenter && <TableCell className="text-sm text-gray-600">{lead.subcenter_name ?? "—"}</TableCell>}
                  <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
                  <TableCell><AdmStatusBadge status={lead.adm_status} /></TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
