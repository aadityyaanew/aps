"use client";
/**
 * app/(auth)/login/page.js — Portal Login Page
 * Styled exactly after the reference screenshot with dark crimson background,
 * subtle grid pattern, top centered logo, and floating white card.
 * Fully mobile responsive on all devices from 320px to 4K displays.
 */
import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";
import { Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-3.5 sm:px-4 py-8 sm:py-12 overflow-hidden bg-[#100407]">
      {/* Background ambient crimson radial glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(139, 0, 0, 0.42) 0%, rgba(100, 0, 15, 0.22) 45%, rgba(16, 4, 7, 0.98) 75%)",
        }}
      />

      {/* Subtle background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 w-full max-w-[450px] flex flex-col items-center">
        {/* Top Logo centered above card */}
        <div className="mb-5 sm:mb-7 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Compare Degree APS"
            width={240}
            height={60}
            priority
            className="h-10 sm:h-12 w-auto max-w-[240px] sm:max-w-[260px] object-contain drop-shadow-md"
          />
        </div>

        {/* Floating White Card */}
        <div className="w-full bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-9 shadow-2xl shadow-black/80 ring-1 ring-white/10">
          {/* Top Pill Badge */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#8B0000] border border-red-200/70 text-[11px] font-bold tracking-wider uppercase">
              <Lock size={12} className="text-[#8B0000]" />
              <span>Portal Login</span>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight">
              Sign In to APS
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-1.5 font-normal">
              Sign in using your authorized credentials.
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer info below card */}
        <div className="mt-6 sm:mt-7 text-center px-4">
          <p className="text-[11px] sm:text-xs text-white/40">
            Compare Degree Admission Processing System &bull; Secure Portal
          </p>
        </div>
      </div>
    </div>
  );
}
