"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-white pt-[68px] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mykolo-logo.png" alt="Logo" style={{ height: "40px", width: "auto" }} className="mx-auto mb-8" />
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Account recovery</p>
          <h1 className="text-2xl text-[#111111]">Reset password</h1>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-[#d2ff1f] flex items-center justify-center mx-auto mb-6 text-xl">✉</div>
            <p className="text-sm text-[#6b7280] leading-relaxed mb-8">
              Check <strong className="text-[#111111]">{email}</strong> for a reset link. It expires in 1 hour.
            </p>
            <Link href="/account/login" className="text-sm text-[#111111] underline underline-offset-2">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#6b7280] mb-6 text-center">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-[#e5e7eb] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="text-center text-sm text-[#6b7280] mt-6">
              <Link href="/account/login" className="text-[#111111] underline underline-offset-2 hover:no-underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
