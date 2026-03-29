"use client";

import { useState } from "react";

export default function MaintenancePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Store in localStorage as a simple local record; replace with API call if needed
    const existing = JSON.parse(localStorage.getItem("notify_emails") ?? "[]") as string[];
    if (!existing.includes(email)) {
      localStorage.setItem("notify_emails", JSON.stringify([...existing, email]));
    }
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mykolo-logo.png"
        alt="Mykolo Mysibi"
        style={{ height: "52px", width: "auto" }}
        className="mb-12"
      />

      {/* Accent line */}
      <div className="w-10 h-px bg-[#d2ff1f] mb-8" />

      <p className="text-[10px] tracking-[0.45em] uppercase text-[#9ca3af] mb-4">
        Coming Soon
      </p>
      <h1 className="text-[clamp(28px,5vw,52px)] text-[#111111] font-light leading-tight mb-5 max-w-lg">
        We&rsquo;re working on something amazing
      </h1>
      <p className="text-sm text-[#6b7280] leading-relaxed max-w-sm mb-12">
        Our store is currently undergoing maintenance. We&rsquo;ll be back shortly with
        handcrafted wood art and home pieces made with love.
      </p>

      {/* Email signup */}
      {submitted ? (
        <div className="flex items-center gap-3 border border-[#d2ff1f] bg-[#f9ffe0] px-6 py-4">
          <span className="text-lg">✓</span>
          <p className="text-sm text-[#374151]">
            You&rsquo;re on the list — we&rsquo;ll notify you when we&rsquo;re back!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#9ca3af] mb-4">
            Get notified when we launch
          </p>
          <div className="flex gap-0">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 border border-[#e5e7eb] border-r-0 px-4 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#111111] text-white text-[10px] tracking-[0.2em] uppercase font-semibold px-6 py-3 hover:bg-[#2a2a2a] transition-colors shrink-0"
            >
              Notify Me
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <p className="absolute bottom-8 text-[10px] tracking-[0.2em] uppercase text-[#d1d5db]">
        Mykolo Mysibi &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
