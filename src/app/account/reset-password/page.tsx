"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user here with a token_hash in the URL.
  // exchangeCodeForSession turns the hash into a real session so we can call updateUser.
  useEffect(() => {
    const code = params.get("code");
    if (code) {
      supabaseBrowser.auth.exchangeCodeForSession(code).then(() => {
        setSessionReady(true);
      });
    } else {
      // User may have arrived via the older hash-based flow — session already set
      setSessionReady(true);
    }
  }, [params]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");

    const { error: authError } = await supabaseBrowser.auth.updateUser({ password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white pt-[68px] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-[#d2ff1f] flex items-center justify-center mx-auto mb-6 text-xl">✓</div>
          <h1 className="text-2xl text-[#111111] mb-3">Password updated</h1>
          <p className="text-sm text-[#6b7280] leading-relaxed mb-8">
            Your password has been changed. You can now sign in with your new password.
          </p>
          <Link
            href="/account/login"
            className="inline-block bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold px-8 py-4 hover:bg-[#2a2a2a] transition-colors"
          >
            Sign in
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
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Account security</p>
          <h1 className="text-2xl text-[#111111]">New password</h1>
        </div>

        {!sessionReady ? (
          <p className="text-center text-sm text-[#9ca3af]">Verifying link…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">New password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full border border-[#e5e7eb] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
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
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#6b7280] mt-6">
          <Link href="/account/login" className="text-[#111111] underline underline-offset-2 hover:no-underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
