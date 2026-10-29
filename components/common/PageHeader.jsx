/**
 * PageHeader.jsx — Responsive page title with optional action buttons.
 * Used at the top of every content page.
 */
export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-normal">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
