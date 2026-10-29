/**
 * WelcomeBanner.jsx — Responsive greeting banner on dashboard pages.
 */
export default function WelcomeBanner({ name, subtitle, action }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#8B0000] via-[#a01515] to-[#DC143C] p-4 sm:p-6 text-white shadow-md">
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -right-4 top-8 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Welcome back, {name}! 👋
        </h2>
        {subtitle && (
          <p className="mt-1 text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        {action && <div className="mt-3 sm:mt-4">{action}</div>}
      </div>
    </div>
  );
}
