"use client";
/**
 * app/(auth)/login/page.js — Simple, elegant login page
 * Matches minimal screenshot design with Outfit font.
 */
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="w-full max-w-[430px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] sm:text-[34px] font-bold tracking-tight text-[#0f172a] leading-tight">
            Sign in to your account
          </h1>
          <p className="text-[15px] text-[#64748b] mt-1.5 font-normal">
            Admission Processing System
          </p>
        </div>

        {/* Form */}
        <LoginForm />
      </div>
    </div>
  );
}
