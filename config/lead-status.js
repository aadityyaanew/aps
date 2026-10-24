/** Lead status flow enums with display labels and badge colors */
export const LEAD_STATUS = {
  new:                    { label: "New",                  color: "bg-blue-100 text-blue-700"   },
  contacted:              { label: "Contacted",            color: "bg-yellow-100 text-yellow-700" },
  application_submitted:  { label: "App Submitted",        color: "bg-purple-100 text-purple-700" },
  admitted:               { label: "Admitted",             color: "bg-green-100 text-green-700" },
  rejected:               { label: "Rejected",             color: "bg-red-100 text-red-700"     },
};

/** Lead ADM status with colors */
export const ADM_STATUS = {
  pending:  { label: "Pending",  color: "bg-orange-100 text-orange-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700"   },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700"       },
};

/** Lead type */
export const LEAD_TYPE = {
  primary:   { label: "Primary",   color: "bg-indigo-100 text-indigo-700" },
  secondary: { label: "Secondary", color: "bg-gray-100 text-gray-600"     },
};

/** Status transition order (for dropdowns) */
export const LEAD_STATUS_OPTIONS = Object.entries(LEAD_STATUS).map(
  ([value, { label }]) => ({ value, label })
);

export const ADM_STATUS_OPTIONS = Object.entries(ADM_STATUS).map(
  ([value, { label }]) => ({ value, label })
);
