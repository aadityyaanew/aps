"use client";
/**
 * LeadsTable.jsx — Data table shell for leads.
 * - Shows Lead Type badge (Under Review, Primary, Duplicate).
 * - If Super Admin (isAdmin=true), status and ADM status are interactive dropdowns to edit live.
 * - If Center/Subcenter, status and ADM status are read-only badges.
 */
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import LeadFilters from "./LeadFilters";
import LeadStatusBadge from "./LeadStatusBadge";
import AdmStatusBadge from "./AdmStatusBadge";
import LeadTypeBadge from "./LeadTypeBadge";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";
import { LEAD_STATUS_OPTIONS, ADM_STATUS_OPTIONS, LEAD_TYPE_OPTIONS } from "@/config/lead-status";

export default function LeadsTable({
  leads,
  isLoading,
  showCenter = false,
  showSubcenter = false,
  isAdmin = false,
  onUpdateStatus,
  onUpdateAdmStatus,
  onUpdateType,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debounced = useDebounce(search);

  const filtered = (leads || []).filter((l) => {
    const matchSearch =
      !debounced ||
      l.student_name?.toLowerCase().includes(debounced.toLowerCase()) ||
      l.phone?.includes(debounced) ||
      l.email?.toLowerCase().includes(debounced.toLowerCase());
    const matchStatus = !status || l.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-white">
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
              <TableRow className="bg-slate-50/70 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Student</TableHead>
                <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                <TableHead className="font-semibold text-slate-700">University / Course</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                {showCenter && <TableHead className="font-semibold text-slate-700">Unit</TableHead>}
                {showSubcenter && <TableHead className="font-semibold text-slate-700">Associate</TableHead>}
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">ADM Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Punched Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{lead.student_name}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-800">{lead.phone}</div>
                    {lead.email && <div className="text-xs text-slate-500">{lead.email}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-800">{lead.university_name ?? "—"}</div>
                    {lead.course_name && <div className="text-xs text-slate-500">{lead.course_name}</div>}
                  </TableCell>
                  <TableCell>
                    {isAdmin && onUpdateType ? (
                      <Select
                        value={lead.lead_type || "Under Review"}
                        onValueChange={(val) => onUpdateType(lead.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs border border-slate-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_TYPE_OPTIONS.map(({ value }) => (
                            <SelectItem key={value} value={value} className="text-xs">
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <LeadTypeBadge type={lead.lead_type} />
                    )}
                  </TableCell>
                  {showCenter && <TableCell className="text-sm text-slate-600">{lead.center_name ?? "—"}</TableCell>}
                  {showSubcenter && <TableCell className="text-sm text-slate-600">{lead.subcenter_name ?? "—"}</TableCell>}
                  <TableCell>
                    {isAdmin && onUpdateStatus ? (
                      <Select
                        value={lead.status || "New Lead"}
                        onValueChange={(val) => onUpdateStatus(lead.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs min-w-[150px] border border-slate-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUS_OPTIONS.map(({ value }) => (
                            <SelectItem key={value} value={value} className="text-xs">
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <LeadStatusBadge status={lead.status} />
                    )}
                  </TableCell>
                  <TableCell>
                    {isAdmin && onUpdateAdmStatus ? (
                      <Select
                        value={lead.adm_status || "Pending"}
                        onValueChange={(val) => onUpdateAdmStatus(lead.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs min-w-[110px] border border-slate-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADM_STATUS_OPTIONS.map(({ value }) => (
                            <SelectItem key={value} value={value} className="text-xs">
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <AdmStatusBadge status={lead.adm_status} />
                    )}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {lead.created_at ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-800">
                          {new Date(lead.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {new Date(lead.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
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
