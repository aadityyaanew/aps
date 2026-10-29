"use client";
/**
 * LeadFilters.jsx — Search + status filter bar above LeadsTable.
 * Fully mobile responsive with responsive flex-wrap and clean touch controls.
 */
import { Input } from "@/components/ui/input";
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
      {/* Top Search Bar & Reset Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            id="lead-search"
            placeholder="Search by student name, phone or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm border-slate-200 w-full"
          />
        </div>

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-3 text-xs text-slate-600 hover:text-red-700 hover:bg-red-50 gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <RotateCcw size={13} />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filter Row: Status + Punched Date Range + Unit + Associate */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5">
        {/* Status Filter */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5 h-9 shadow-2xs hover:border-slate-300 transition-colors max-w-full">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            Status:
          </span>
          <select
            id="lead-status-filter"
            value={status || ""}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer pr-1 truncate"
          >
            <option value="">All Statuses</option>
            {LEAD_STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Punched Date Range (From - To) */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-200 bg-white px-2 sm:px-2.5 py-1.5 sm:py-0 min-h-[36px] shadow-2xs hover:border-slate-300 transition-colors flex-wrap sm:flex-nowrap max-w-full">
          <div className="flex items-center gap-1 shrink-0">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Punched:
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <span className="text-[11px] sm:text-xs text-slate-500">From</span>
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              className="h-6 w-[108px] sm:w-[118px] rounded border border-slate-200 bg-slate-50/50 px-1 text-[11px] sm:text-xs text-slate-700 outline-none focus:border-red-500 focus:bg-white"
              title="Punched Date From"
            />
            <span className="text-[11px] sm:text-xs text-slate-500">To</span>
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              className="h-6 w-[108px] sm:w-[118px] rounded border border-slate-200 bg-slate-50/50 px-1 text-[11px] sm:text-xs text-slate-700 outline-none focus:border-red-500 focus:bg-white"
              title="Punched Date To"
            />
          </div>
        </div>

        {/* Unit Filter (Center) */}
        {showCenter && (
          <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5 h-9 shadow-2xs hover:border-slate-300 transition-colors max-w-full">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
              Unit:
            </span>
            <select
              id="lead-unit-filter"
              value={center || ""}
              onChange={(e) => onCenterChange?.(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer pr-1 max-w-[130px] sm:max-w-[160px] truncate"
            >
              <option value="">All Units</option>
              {centerOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Associate Filter (Subcenter) */}
        {showSubcenter && (
          <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5 h-9 shadow-2xs hover:border-slate-300 transition-colors max-w-full">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
              Associate:
            </span>
            <select
              id="lead-associate-filter"
              value={subcenter || ""}
              onChange={(e) => onSubcenterChange?.(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer pr-1 max-w-[130px] sm:max-w-[160px] truncate"
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
