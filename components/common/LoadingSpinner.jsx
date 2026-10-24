/**
 * LoadingSpinner.jsx — Centered loading spinner.
 */
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={32} className="animate-spin text-[#8B0000]" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
