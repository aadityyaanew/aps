/**
 * AdmStatusBadge.jsx — ADM (admission) status badge.
 */
import { cn } from "@/lib/utils";
import { ADM_STATUS } from "@/config/lead-status";

export default function AdmStatusBadge({ status }) {
  const cfg = ADM_STATUS[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.color)}>
      {cfg.label}
    </span>
  );
}
