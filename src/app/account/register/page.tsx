"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/account";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else if (data.session) {
      // Email confirmation disabled — session is live immediately
      window.location.href = redirect;
    } else {
      setSuccess(true);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setResendMessage("");
    const { error: resendError } = await supabaseBrowser.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
    setResendLoading(false);
    setResendMessage(resendError ? resendError.message : "Confirmation email resent — check your inbox and spam folder.");
  }

  async function handleGoogle() {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white pt-[68px] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-[#d2ff1f] flex items-center justify-center mx-auto mb-6 text-2xl">✉</div>
          <h1 className="text-2xl text-[#111111] mb-3">Check your email</h1>
          <p className="text-sm text-[#6b7280] leading-relaxed mb-4">
            We sent a confirmation link to{" "}
            <strong className="text-[#111111]">{email}</strong>.
            Click it to activate your account.
          </p>

          {/* Spam warning */}
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded px-4 py-3 mb-6 text-left">
            <p className="text-xs font-semibold text-[#92400e] mb-1">Can&apos;t find the email?</p>
            <ul className="text-xs text-[#92400e] space-y-1 list-disc list-inside">
              <li>Check your <strong>spam / junk folder</strong></li>
              <li>Check your <strong>promotions</strong> tab if you use Gmail</li>
              <li>The email comes from Supabase — it may take 1–2 minutes</li>
            </ul>
          </div>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full border border-[#e5e7eb] text-sm text-[#374151] py-3 hover:bg-[#f9fafb] disabled:opacity-50 transition-colors mb-3"
          >
            {resendLoading ? "Sending…" : "Resend confirmation email"}
          </button>

          {resendMessage && (
            <p className={`text-xs mb-4 ${resendMessage.includes("resent") ? "text-green-600" : "text-[#ef4444]"}`}>
              {resendMessage}
            </p>
          )}

          <Link href="/account/login" className="text-sm text-[#111111] underline underline-offset-2">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[68px] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mykolo-logo.png" alt="Logo" style={{ height: "40px", width: "auto" }} className="mx-auto mb-8" />
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Join us</p>
          <h1 className="text-2xl text-[#111111]">Create account</h1>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border border-[#e5e7eb] py-3 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#f3f4f6]" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-[#9ca3af]">or</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full border border-[#e5e7eb] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
            />
          </div>
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
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#6b7280] mt-6">
          Already have an account?{" "}
          <Link href={`/account/login?redirect=${redirect}`} className="text-[#111111] underline underline-offset-2 hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
