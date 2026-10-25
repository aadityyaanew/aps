"use client";
/**
 * components/auth/LoginForm.jsx — Recreates reference UI/UX with APS branding
 */
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

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
        setError("Invalid email or password.");
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error alert matching screenshot banner */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 py-3 px-4 text-center animate-in fade-in duration-200">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="login-email"
          className="block text-xs font-semibold text-gray-700"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            id="login-email"
            type="email"
            placeholder="admin@comparedegree.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
            required
            className="w-full h-[50px] pl-11 pr-4 rounded-2xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 transition-all outline-none focus:border-[#8B0000] focus:ring-4 focus:ring-[#8B0000]/10 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="login-password"
          className="block text-xs font-semibold text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            id="login-password"
            type={showPass ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
            required
            className="w-full h-[50px] pl-11 pr-12 rounded-2xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 transition-all outline-none focus:border-[#8B0000] focus:ring-4 focus:ring-[#8B0000]/10 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            aria-label={showPass ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full focus:outline-none"
          >
            {showPass ? (
              <EyeOff size={18} strokeWidth={1.75} />
            ) : (
              <Eye size={18} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button matching red rounded pill in reference */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-[#9e1320] via-[#8B0000] to-[#750000] hover:from-[#b01625] hover:to-[#860000] active:scale-[0.99] text-white text-[15px] font-semibold tracking-wide transition-all shadow-lg shadow-red-950/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          <span>{loading ? "Signing in..." : "Sign In to Portal"}</span>
        </button>
      </div>
    </form>
  );
}
