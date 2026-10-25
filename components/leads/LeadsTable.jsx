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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Send, Loader2, AlertTriangle, CheckCircle2, Check, X } from "lucide-react";
import LeadFilters from "./LeadFilters";
import LeadStatusBadge from "./LeadStatusBadge";
import AdmStatusBadge from "./AdmStatusBadge";
import LeadTypeBadge from "./LeadTypeBadge";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
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
  onDeleteLead,
  onPushLead,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [center, setCenter] = useState("");
  const [subcenter, setSubcenter] = useState("");
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [pushingId, setPushingId] = useState(null);
  const [pushedIds, setPushedIds] = useState(() => new Set());
  const [banner, setBanner] = useState(null);
  const debounced = useDebounce(search);

  async function handlePush(lead) {
    const isAlreadyPushed = Boolean(
      lead.is_pushed ||
      lead.lead_type === "Primary" ||
      pushedIds.has(lead.id)
    );
    if (isAlreadyPushed || pushingId === lead.id) return;

    setPushingId(lead.id);
    // Mark immediately as pushed in local state so button transitions to Pushed state and cannot be clicked again
    setPushedIds((prev) => new Set(prev).add(lead.id));
    setBanner(null);
    try {
      let res;
      if (onPushLead) {
        res = await onPushLead(lead.id);
      } else {
        const r = await fetch(`/api/leads/${lead.id}/push`, { method: "POST" });
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed to push lead");
        res = json.data;
      }

      if (!onPushLead && res?.leadType && onUpdateType) {
        onUpdateType(lead.id, res.leadType);
      }

      setBanner({
        type: res?.isDuplicate ? "warning" : "success",
        text: res?.message ?? (res?.isDuplicate ? "Lead is duplicate!" : "Lead pushed successfully!"),
      });
      setTimeout(() => setBanner(null), 6000);
    } catch (err) {
      setBanner({
        type: "error",
        text: err.message ?? "Failed to push lead",
      });
      setTimeout(() => setBanner(null), 6000);
    } finally {
      setPushingId(null);
    }
  }

  // Distinct unit (center) and associate (subcenter) options from data
  const centerOptions = Array.from(
    new Set((leads || []).map((l) => l.center_name).filter(Boolean))
  ).sort();

  const subcenterOptions = Array.from(
    new Set((leads || []).map((l) => l.subcenter_name).filter(Boolean))
  ).sort();

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setCenter("");
    setSubcenter("");
  };

  const filtered = (leads || []).filter((l) => {
    // Search filter
    const matchSearch =
      !debounced ||
      l.student_name?.toLowerCase().includes(debounced.toLowerCase()) ||
      l.phone?.includes(debounced) ||
      l.email?.toLowerCase().includes(debounced.toLowerCase());

    // Status filter
    const matchStatus = !status || l.status === status;

    // Unit filter
    const matchCenter = !center || l.center_name === center;

    // Associate filter
    const matchSubcenter = !subcenter || l.subcenter_name === subcenter;

    // Date range filter on created_at (Punched Date)
    let matchDate = true;
    if (l.created_at) {
      const leadDate = new Date(l.created_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (leadDate < start) matchDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (leadDate > end) matchDate = false;
      }
    } else if (startDate || endDate) {
      matchDate = false;
    }

    return matchSearch && matchStatus && matchCenter && matchSubcenter && matchDate;
  });

  return (
    <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-white">
        <LeadFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          center={center}
          onCenterChange={setCenter}
          subcenter={subcenter}
          onSubcenterChange={setSubcenter}
          centerOptions={centerOptions}
          subcenterOptions={subcenterOptions}
          showCenter={showCenter}
          showSubcenter={showSubcenter}
          onResetFilters={handleResetFilters}
        />
      </div>

      {banner && (
        <div
          className={`flex items-center justify-between px-4 py-2.5 text-xs font-medium border-b ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : banner.type === "warning"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === "success" ? (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            ) : banner.type === "warning" ? (
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            ) : (
              <AlertTriangle size={15} className="text-red-600 shrink-0" />
            )}
            <span>{banner.text}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer ml-2"
          >
            <X size={13} />
          </button>
        </div>
      )}

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
                <TableHead className="font-semibold text-slate-700 text-right pr-4">Action</TableHead>
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
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      {Boolean(lead.is_pushed || lead.lead_type === "Primary" || pushedIds.has(lead.id)) ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full shadow-2xs opacity-90 cursor-not-allowed select-none"
                          title="Lead has already been pushed and cannot be pushed again"
                        >
                          <Check size={13} className="text-emerald-600 stroke-[2.5]" />
                          <span>Pushed</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePush(lead)}
                          disabled={pushingId === lead.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300/80 rounded-full shadow-2xs transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          title={`Push lead to ${lead.university_name || "University"} CRM`}
                        >
                          {pushingId === lead.id ? (
                            <Loader2 size={13} className="animate-spin text-slate-600" />
                          ) : (
                            <Send size={13} className="text-slate-500 -rotate-12" />
                          )}
                          <span>{pushingId === lead.id ? "Pushing..." : "Push"}</span>
                        </button>
                      )}

                      {isAdmin && onDeleteLead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Lead"
                          onClick={() => setLeadToDelete(lead)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={async () => {
          if (leadToDelete) {
            await onDeleteLead(leadToDelete.id);
          }
        }}
        title="Delete Lead"
        description={
          leadToDelete
            ? `Are you sure you want to permanently delete lead "${leadToDelete.student_name}" (${leadToDelete.phone})? This action cannot be undone.`
            : "Are you sure you want to delete this lead?"
        }
        confirmLabel="Delete Lead"
        variant="destructive"
      />
    </Card>
  );
}
