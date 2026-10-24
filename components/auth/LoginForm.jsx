"use client";
/**
 * components/auth/LoginForm.jsx — Minimalist email + password login form
 * Matches the reference screenshot styling with Outfit font.
 */
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoading(false);
        setError("Invalid email address or password.");
        return;
      }

      // Successful login -> Redirect via root router
      window.location.href = "/";
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="block text-[15px] font-medium text-[#334155]"
        >
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="admin@comparedegree.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
          required
          className="w-full h-[52px] px-4 rounded-2xl bg-[#eef4fb] border border-[#dce6f2] text-[15px] text-[#0f172a] placeholder-[#94a3b8] transition-all outline-none focus:border-[#800000]/40 focus:ring-4 focus:ring-[#800000]/10 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="block text-[15px] font-medium text-[#334155]"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPass ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
            required
            className="w-full h-[52px] pl-4 pr-12 rounded-2xl bg-[#eef4fb] border border-[#dce6f2] text-[15px] text-[#0f172a] placeholder-[#94a3b8] transition-all outline-none focus:border-[#800000]/40 focus:ring-4 focus:ring-[#800000]/10 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            aria-label={showPass ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#94a3b8] hover:text-[#475569] transition-colors rounded-full focus:outline-none"
          >
            {showPass ? (
              <EyeOff size={19} strokeWidth={1.75} />
            ) : (
              <Eye size={19} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200/80 px-4 py-3 animate-in fade-in duration-200">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-[52px] rounded-2xl bg-[#800000] hover:bg-[#6c0000] active:scale-[0.99] text-white text-[16px] font-medium tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        <span>{loading ? "Signing in..." : "Sign In"}</span>
      </button>
    </form>
  );
}
