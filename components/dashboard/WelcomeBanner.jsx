/**
 * WelcomeBanner.jsx — Greeting banner on dashboard pages.
 */
export default function WelcomeBanner({ name, subtitle, action }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#8B0000] via-[#a01515] to-[#DC143C] p-6 text-white shadow-lg">
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 top-8 h-20 w-20 rounded-full bg-white/5" />

      <div className="relative">
        <h2 className="text-2xl font-bold">Welcome back, {name}! 👋</h2>
        <p className="mt-1 text-white/70 text-sm">{subtitle}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
