/**
 * LeadTypeBadge.jsx — Colored pill for lead type
 * (Under Review, Primary, Duplicate)
 */
import { cn } from "@/lib/utils";
import { LEAD_TYPE } from "@/config/lead-status";

export default function LeadTypeBadge({ type }) {
  const cfg = LEAD_TYPE[type] ?? { label: type || "Under Review", color: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border", cfg.color)}>
      {cfg.label}
    </span>
  );
}
