"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

type AuthTab = "email" | "phone";
type PhoneStep = "input" | "verify";
type CountryCode = { code: string; label: string; flag: string };

const COUNTRY_CODES: CountryCode[] = [
  { code: "+44", label: "UK", flag: "🇬🇧" },
  { code: "+234", label: "NG", flag: "🇳🇬" },
  { code: "+1", label: "US", flag: "🇺🇸" },
];

function LoginContent() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/account";
  const oauthError = params.get("error");

  const [tab, setTab] = useState<AuthTab>("email");

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    oauthError === "oauth_failed" ? "Google sign-in failed. Please try again." : ""
  );

  // Phone auth state
  const [countryCode, setCountryCode] = useState("+44");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      window.location.href = redirect;
    }
  }

  async function handleGoogle() {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setPhoneLoading(true);
    setPhoneError("");

    const fullPhone = `${countryCode}${phone.replace(/^0/, "")}`;
    const { error: otpError } = await supabaseBrowser.auth.signInWithOtp({
      phone: fullPhone,
    });

    setPhoneLoading(false);

    if (otpError) {
      setPhoneError(otpError.message);
    } else {
      setPhoneStep("verify");
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setPhoneLoading(true);
    setPhoneError("");

    const fullPhone = `${countryCode}${phone.replace(/^0/, "")}`;
    const { error: verifyError } = await supabaseBrowser.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: "sms",
    });

    setPhoneLoading(false);

    if (verifyError) {
      setPhoneError(verifyError.message);
    } else {
      window.location.href = redirect;
    }
  }

  return (
    <div className="min-h-screen bg-white pt-[68px] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mykolo-logo.png" alt="Logo" style={{ height: "40px", width: "auto" }} className="mx-auto mb-8" />
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Welcome back</p>
          <h1 className="text-2xl text-[#111111]">Sign in</h1>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border border-[#e5e7eb] py-3 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors mb-5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Auth method tabs */}
        <div className="flex border border-[#e5e7eb] mb-5">
          <button
            type="button"
            onClick={() => { setTab("email"); setError(""); }}
            className={`flex-1 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors ${
              tab === "email"
                ? "bg-[#111111] text-white"
                : "text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => { setTab("phone"); setPhoneError(""); setPhoneStep("input"); }}
            className={`flex-1 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors ${
              tab === "phone"
                ? "bg-[#111111] text-white"
                : "text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email/password form */}
        {tab === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-[#374151]">Password</label>
                <Link href="/account/forgot-password" className="text-xs text-[#6b7280] hover:text-[#111111] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {/* Phone auth */}
        {tab === "phone" && (
          <div>
            {phoneStep === "input" && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="border border-[#e5e7eb] px-2 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors bg-white w-24"
                    >
                      {COUNTRY_CODES.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                          {cc.flag} {cc.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="7700 000000"
                      className="flex-1 border border-[#e5e7eb] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-[#9ca3af] mt-1">Enter your number without the leading 0</p>
                </div>

                {phoneError && (
                  <p className="text-xs text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] px-3 py-2">{phoneError}</p>
                )}

                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors"
                >
                  {phoneLoading ? "Sending…" : "Send Code"}
                </button>
              </form>
            )}

            {phoneStep === "verify" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center py-2">
                  <p className="text-sm text-[#6b7280]">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-[#111111]">
                      {countryCode} {phone}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full border border-[#e5e7eb] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors text-center tracking-[0.5em] font-mono text-lg"
                  />
                </div>

                {phoneError && (
                  <p className="text-xs text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] px-3 py-2">{phoneError}</p>
                )}

                <button
                  type="submit"
                  disabled={phoneLoading || otp.length < 6}
                  className="w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors"
                >
                  {phoneLoading ? "Verifying…" : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={() => { setPhoneStep("input"); setOtp(""); setPhoneError(""); }}
                  className="w-full text-xs text-[#6b7280] hover:text-[#111111] transition-colors py-1"
                >
                  Back / Resend code
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-sm text-[#6b7280] mt-6">
          No account?{" "}
          <Link href={`/account/register?redirect=${redirect}`} className="text-[#111111] underline underline-offset-2 hover:no-underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
