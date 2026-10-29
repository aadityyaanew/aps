"use client";
/**
 * InvoicesTable.jsx — Data table for billing invoices.
 * Matches existing Leads Listing design system (Card container, filters, badges, clean table).
 * Columns: Invoice Number, Invoice Date, Month & Year, Amount, Signed By,
 * Uploaded Document, Submission Date, Status, Admin Remarks, Action.
 * Fully mobile responsive with horizontal touch scrolling and min-width preservation.
 */
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RotateCcw,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ReviewInvoiceDialog from "./ReviewInvoiceDialog";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function InvoicesTable({
  invoices = [],
  isLoading = false,
  isAdmin = false,
  units = [],
  onInvoiceUpdated,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");

  const [selectedInvoiceForReview, setSelectedInvoiceForReview] = useState(null);

  // Distinct years present in data
  const yearOptions = Array.from(
    new Set(invoices.map((i) => String(i.invoice_year)).filter(Boolean))
  ).sort((a, b) => b - a);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("all");
    setMonth("all");
    setYear("all");
    setUnitFilter("all");
  };

  const filteredInvoices = invoices.filter((inv) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchInvNumber = inv.invoice_number?.toLowerCase().includes(q);
      const matchSignedBy = inv.signed_by?.toLowerCase().includes(q);
      const matchUnit = inv.unit_name?.toLowerCase().includes(q) || inv.organization_name?.toLowerCase().includes(q);
      if (!matchInvNumber && !matchSignedBy && !matchUnit) return false;
    }

    // Status filter
    if (status !== "all" && inv.status !== status) return false;

    // Month filter
    if (month !== "all" && inv.invoice_month !== month) return false;

    // Year filter
    if (year !== "all" && String(inv.invoice_year) !== String(year)) return false;

    // Unit filter (Admin only)
    if (isAdmin && unitFilter !== "all" && String(inv.unit_id) !== String(unitFilter)) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (invStatus) => {
    switch (invStatus) {
      case "Approved":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 size={13} />
            Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1">
            <XCircle size={13} />
            Rejected
          </Badge>
        );
      case "Pending":
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 flex items-center gap-1">
            <Clock size={13} />
            Pending
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filters Bar matching LeadFilters design */}
        <div className="p-3.5 sm:p-4 border-b bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search invoice or signed by..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Unit Filter (Admin only) */}
            {isAdmin && (
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name} {u.organization_name ? `(${u.organization_name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Month Filter */}
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter & Reset Button */}
            <div className="flex items-center gap-2">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-9 text-xs flex-1">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {yearOptions.length > 0 ? (
                    yearOptions.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={String(new Date().getFullYear())}>
                      {new Date().getFullYear()}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                title="Reset Filters"
                className="h-9 w-9 shrink-0 text-slate-500 hover:text-slate-800"
              >
                <RotateCcw size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Invoices Data Table */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            title="No Invoices Found"
            description="No invoice submissions match the selected criteria or none have been submitted yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-b border-slate-200">
                  <TableHead className="font-semibold text-slate-700">Invoice Number</TableHead>
                  {isAdmin && <TableHead className="font-semibold text-slate-700">Unit Name</TableHead>}
                  <TableHead className="font-semibold text-slate-700">Invoice Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Month & Year</TableHead>
                  <TableHead className="font-semibold text-slate-700">Amount (₹)</TableHead>
                  <TableHead className="font-semibold text-slate-700">Signed By</TableHead>
                  <TableHead className="font-semibold text-slate-700">Document</TableHead>
                  <TableHead className="font-semibold text-slate-700">Submission Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Admin Remarks</TableHead>
                  {isAdmin && <TableHead className="font-semibold text-slate-700 text-right pr-4">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Invoice Number */}
                    <TableCell className="font-semibold text-slate-900">
                      {inv.invoice_number}
                    </TableCell>

                    {/* Unit Name (Admin only) */}
                    {isAdmin && (
                      <TableCell>
                        <div className="font-medium text-slate-800 text-xs">{inv.unit_name}</div>
                        {inv.organization_name && (
                          <div className="text-[11px] text-slate-500">{inv.organization_name}</div>
                        )}
                      </TableCell>
                    )}

                    {/* Invoice Date */}
                    <TableCell className="text-xs text-slate-700">
                      {new Date(inv.invoice_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    {/* Month & Year */}
                    <TableCell className="text-xs text-slate-700 font-medium">
                      {inv.invoice_month} {inv.invoice_year}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-xs font-semibold text-slate-900">
                      ₹{Number(inv.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Signed By */}
                    <TableCell className="text-xs text-slate-700">
                      {inv.signed_by}
                    </TableCell>

                    {/* Document */}
                    <TableCell>
                      {inv.file_url ? (
                        <a
                          href={inv.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                          title="View / Download Document"
                        >
                          <FileText size={13} />
                          <span>View Doc</span>
                          <ExternalLink size={11} className="opacity-70" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Submission Date */}
                    <TableCell className="text-xs text-slate-500">
                      {new Date(inv.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusBadge(inv.status)}
                    </TableCell>

                    {/* Admin Remarks */}
                    <TableCell className="text-xs text-slate-600 max-w-[180px]">
                      {inv.admin_remarks ? (
                        <span className="line-clamp-2" title={inv.admin_remarks}>
                          {inv.admin_remarks}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Action (Admin Only) */}
                    {isAdmin && (
                      <TableCell className="text-right pr-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoiceForReview(inv)}
                          className="h-7 text-xs border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        >
                          Review
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Review Dialog */}
      {isAdmin && selectedInvoiceForReview && (
        <ReviewInvoiceDialog
          key={selectedInvoiceForReview.id}
          open={Boolean(selectedInvoiceForReview)}
          invoice={selectedInvoiceForReview}
          onClose={() => setSelectedInvoiceForReview(null)}
          onReviewed={() => {
            onInvoiceUpdated?.();
          }}
        />
      )}
    </>
  );
}
