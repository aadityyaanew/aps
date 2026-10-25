"use client";
/**
 * LeadFilters.jsx — Search + status filter bar above LeadsTable.
 */
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar, RotateCcw } from "lucide-react";
import { LEAD_STATUS_OPTIONS } from "@/config/lead-status";

export default function LeadFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  center,
  onCenterChange,
  subcenter,
  onSubcenterChange,
  centerOptions = [],
  subcenterOptions = [],
  showCenter = false,
  showSubcenter = false,
  onResetFilters,
}) {
  const hasActiveFilters = Boolean(
    search || status || startDate || endDate || center || subcenter
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Top Search Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            id="lead-search"
            placeholder="Search by student name, phone or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm border-slate-200"
          />
        </div>

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-3 text-xs text-slate-500 hover:text-red-700 hover:bg-red-50 gap-1.5 shrink-0"
          >
            <RotateCcw size={13} />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filter Row: Status + Punched Date Range + Unit + Associate */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Status Filter */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5 h-9 shadow-2xs hover:border-slate-300 transition-colors">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            Status:
          </span>
          <select
            id="lead-status-filter"
            value={status || ""}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer pr-1"
          >
            <option value="">All Statuses</option>
            {LEAD_STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* 1st Filter: Punched Date Range (From - To) */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 h-9 shadow-2xs hover:border-slate-300 transition-colors">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
            Punched:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">From</span>
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              className="h-6 w-[118px] rounded border border-slate-200 bg-slate-50/50 px-1 text-xs text-slate-700 outline-none focus:border-red-500 focus:bg-white"
              title="Punched Date From"
            />
            <span className="text-xs text-slate-500">To</span>
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              className="h-6 w-[118px] rounded border border-slate-200 bg-slate-50/50 px-1 text-xs text-slate-700 outline-none focus:border-red-500 focus:bg-white"
              title="Punched Date To"
            />
          </div>
        </div>

        {/* 2nd Filter: Unit (Center) */}
        {showCenter && (
          <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5 h-9 shadow-2xs hover:border-slate-300 transition-colors">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
              Unit:
            </span>
            <select
              id="lead-unit-filter"
              value={center || ""}
              onChange={(e) => onCenterChange?.(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer pr-1 max-w-[140px]"
            >
              <option value="">All Units</option>
              {centerOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* 3rd Filter: Associates (Subcenter) */}
        {showSubcenter && (
          <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5 h-9 shadow-2xs hover:border-slate-300 transition-colors">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
              Associate:
            </span>
            <select
              id="lead-associate-filter"
              value={subcenter || ""}
              onChange={(e) => onSubcenterChange?.(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer pr-1 max-w-[140px]"
            >
              <option value="">All Associates</option>
              {subcenterOptions.map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
