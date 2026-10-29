/**
 * StatCard.jsx — Single stat metric card for dashboards.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, description, icon: Icon, color = "crimson", isLoading }) {
  const colorMap = {
    crimson: "bg-[#8B0000]/10 text-[#8B0000]",
    blue:    "bg-blue-100 text-blue-700",
    green:   "bg-green-100 text-green-700",
    orange:  "bg-orange-100 text-orange-700",
    purple:  "bg-purple-100 text-purple-700",
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value ?? 0}</p>
            {description && (
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1 leading-snug">{description}</p>
            )}
          </div>
          {Icon && (
            <div className={cn("rounded-xl p-2.5 sm:p-3 shrink-0", colorMap[color] ?? colorMap.crimson)}>
              <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
