/**
 * LeadStatusBadge.jsx — Colored status pill for lead status.
 */
import { cn } from "@/lib/utils";
import { LEAD_STATUS } from "@/config/lead-status";

export default function LeadStatusBadge({ status }) {
  const cfg = LEAD_STATUS[status] ?? { label: status || "New Lead", color: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border", cfg.color)}>
      {cfg.label}
    </span>
  );
}
