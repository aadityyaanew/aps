/**
 * StatCardGrid.jsx — Responsive grid of StatCards.
 * Pass `items` array with { label, value, description, icon, color }.
 */
import StatCard from "./StatCard";

export default function StatCardGrid({ items, isLoading }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <StatCard key={i} {...item} isLoading={isLoading} />
      ))}
    </div>
  );
}
