/**
 * EmptyState.jsx — Shown when a table/list has no data.
 */
import { FileSearch } from "lucide-react";

export default function EmptyState({ title = "No data found", description = "Try adjusting your filters or add new entries." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-gray-100 p-5 mb-4">
        <FileSearch size={32} className="text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>
    </div>
  );
}
