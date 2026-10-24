/**
 * config/lead-status.js — Lead Types, Statuses, and ADM Statuses
 * 
 * Rules:
 * - Lead Type: Default is "Under Review"
 *   Pushing logic: Primary (if pushed), Duplicate (if duplicate exists), Under Review (missing university/API error/default)
 * - Status: Only edited by Super Admin, Default is "New Lead"
 * - ADM Status: Only edited by Super Admin, Default is "Pending"
 */

/** Lead Types */
export const LEAD_TYPE = {
  "Under Review": { label: "Under Review", color: "bg-amber-100 text-amber-800 border-amber-200" },
  "Primary":      { label: "Primary",      color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "Duplicate":    { label: "Duplicate",    color: "bg-rose-100 text-rose-800 border-rose-200" },
};

export const LEAD_TYPE_OPTIONS = Object.keys(LEAD_TYPE).map((val) => ({
  value: val,
  label: val,
}));

/** Lead Statuses (Super Admin only, Default: New Lead) */
export const LEAD_STATUS = {
  "New Lead":                     { label: "New Lead",                     color: "bg-blue-100 text-blue-800 border-blue-200" },
  "Fees Collected":               { label: "Fees Collected",               color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  "Docs Under Review/Incomplete": { label: "Docs Under Review/Incomplete", color: "bg-purple-100 text-purple-800 border-purple-200" },
  "Admission Approved":           { label: "Admission Approved",           color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "Admission Rejected":           { label: "Admission Rejected",           color: "bg-rose-100 text-rose-800 border-rose-200" },
  "Refund Initiated":             { label: "Refund Initiated",             color: "bg-orange-100 text-orange-800 border-orange-200" },
  "Refund Approved":              { label: "Refund Approved",              color: "bg-teal-100 text-teal-800 border-teal-200" },
};

export const LEAD_STATUS_OPTIONS = Object.keys(LEAD_STATUS).map((val) => ({
  value: val,
  label: val,
}));

/** ADM Statuses (Super Admin only, Default: Pending) */
export const ADM_STATUS = {
  "Pending":  { label: "Pending",  color: "bg-amber-100 text-amber-800 border-amber-200" },
  "Approved": { label: "Approved", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "Rejected": { label: "Rejected", color: "bg-rose-100 text-rose-800 border-rose-200" },
  "Refunded": { label: "Refunded", color: "bg-purple-100 text-purple-800 border-purple-200" },
};

export const ADM_STATUS_OPTIONS = Object.keys(ADM_STATUS).map((val) => ({
  value: val,
  label: val,
}));
