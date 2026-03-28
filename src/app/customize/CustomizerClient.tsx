"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const FONTS = [
  { id: "serif",       label: "Classic Serif",    style: { fontFamily: "Georgia, serif" } },
  { id: "sans",        label: "Modern Sans",       style: { fontFamily: "Helvetica, Arial, sans-serif" } },
  { id: "script",      label: "Elegant Script",    style: { fontFamily: "Palatino Linotype, Palatino, serif", fontStyle: "italic" } },
  { id: "mono",        label: "Typewriter Mono",   style: { fontFamily: "Courier New, Courier, monospace" } },
  { id: "condensed",   label: "Bold Condensed",    style: { fontFamily: "Impact, Arial Narrow, sans-serif" } },
  { id: "rounded",     label: "Friendly Rounded",  style: { fontFamily: "Trebuchet MS, sans-serif" } },
];

type Status = "idle" | "sending" | "sent" | "error";

export default function CustomizerClient({ productId }: { productId?: string }) {
  const [engraving, setEngraving]     = useState("");
  const [font, setFont]               = useState(FONTS[0].id);
  const [file, setFile]               = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [status, setStatus]           = useState<Status>("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedFont = FONTS.find((f) => f.id === font) ?? FONTS[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      {/* Header */}
      <div className="bg-[#111111] text-white px-6 pt-28 pb-16 text-center">
        <p className="text-[10px] tracking-[0.45em] uppercase text-white/40 mb-4">Bespoke</p>
        <h1 className="text-[clamp(32px,5vw,64px)] font-light tracking-tight leading-none mb-4">
          Customise Your Piece
        </h1>
        <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
          Tell us how you'd like your piece personalised — engraving, materials, or anything special.
          We'll get back to you within 24 hours.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {status === "sent" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-[#111111] mb-3">Request Received</h2>
              <p className="text-[#6b7280] text-sm leading-relaxed mb-8">
                We've got your customisation request and will be in touch within 24 hours.
              </p>
              <Link
                href="/"
                className="inline-block bg-[#111111] text-white text-[11px] tracking-[0.18em] uppercase font-medium px-10 py-4 hover:bg-[#222222] transition-colors"
              >
                Back to Shop
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {productId && (
                <div className="bg-white border border-[#e8e8e5] px-5 py-4 flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#9ca3af] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.83m2.55-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  <span className="text-xs text-[#6b7280]">
                    Customising product <span className="font-medium text-[#111111]">#{productId}</span>
                  </span>
                </div>
              )}

              {/* Engraving text */}
              <div>
                <label className="block text-[10px] tracking-[0.25em] uppercase text-[#6b7280] mb-3">
                  Engraving / Personalisation Text
                </label>
                <input
                  type="text"
                  value={engraving}
                  onChange={(e) => setEngraving(e.target.value.slice(0, 30))}
                  placeholder="e.g. John & Mary, 2024"
                  className="w-full border border-[#e8e8e5] px-4 py-3.5 text-sm text-[#111111] bg-white placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors"
                />
                {/* Live preview */}
                {engraving && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 bg-[#111111] rounded px-6 py-4 text-center"
                  >
                    <span
                      className="text-white/90 text-lg"
                      style={selectedFont.style}
                    >
                      {engraving}
                    </span>
                  </motion.div>
                )}
                <p className="mt-2 text-[11px] text-[#9ca3af]">{engraving.length}/30 characters</p>
              </div>

              {/* Font selector */}
              <div>
                <label className="block text-[10px] tracking-[0.25em] uppercase text-[#6b7280] mb-3">
                  Font Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFont(f.id)}
                      className={`px-4 py-3 border text-sm text-left transition-all duration-150 ${
                        font === f.id
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-[#e8e8e5] bg-white text-[#6b7280] hover:border-[#111111] hover:text-[#111111]"
                      }`}
                    >
                      <span style={f.style} className="block text-[15px] mb-0.5">Aa</span>
                      <span className="text-[10px] tracking-wide">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="block text-[10px] tracking-[0.25em] uppercase text-[#6b7280] mb-3">
                  Reference Image or Logo (optional)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#e8e8e5] bg-white hover:border-[#111111] transition-colors px-6 py-8 flex flex-col items-center gap-2 group"
                >
                  {file ? (
                    <>
                      <svg className="w-6 h-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-[#111111] font-medium">{file.name}</span>
                      <span className="text-[11px] text-[#9ca3af]">Click to change</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-[#9ca3af] group-hover:text-[#111111] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-sm text-[#6b7280] group-hover:text-[#111111] transition-colors">Upload image or PDF</span>
                      <span className="text-[11px] text-[#9ca3af]">PNG, JPG, SVG or PDF up to 10MB</span>
                    </>
                  )}
                </button>
              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-[10px] tracking-[0.25em] uppercase text-[#6b7280] mb-3">
                  Special Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe any specific requirements — dimensions, wood type, finish, packaging, etc."
                  rows={5}
                  className="w-full border border-[#e8e8e5] px-4 py-3.5 text-sm text-[#111111] bg-white placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={status === "sending"}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-[#111111] text-white text-[11px] tracking-[0.2em] uppercase font-semibold py-[18px] hover:bg-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending Request…" : "Send Customisation Request"}
              </motion.button>

              <p className="text-center text-[11px] text-[#9ca3af] leading-relaxed">
                We'll review your request and send a quote within 24 hours.
                <br />
                No payment required until you approve.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
