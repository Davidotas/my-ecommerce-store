"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Newsletter() {
  const [email, setEmail]     = useState("");
  const [submitted, setSubmit] = useState(false);
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#fafaf8] border-t border-[#e8e8e5] py-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl mx-auto px-6 text-center"
      >
        <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#9ca3af] mb-4">Stay in the loop</p>
        <h2 className="text-[clamp(36px,4.5vw,56px)] text-[#111111] mb-4">Join the Inner Circle</h2>
        <p className="text-[#6b7280] text-base mb-12 leading-relaxed">
          Be the first to know about new drops, exclusive offers, and curated edits.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-3"
          >
            <span className="w-6 h-6 bg-[#111111] text-white text-sm flex items-center justify-center">✓</span>
            <p className="text-[#111111] text-base font-medium">You&apos;re on the list. Welcome.</p>
          </motion.div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (email) setSubmit(true); }} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white border border-[#e8e8e5] text-[#111111] text-sm px-5 py-4 outline-none focus:border-[#111111] transition-colors placeholder-[#d1d5db]"
            />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold px-8 py-4 hover:bg-[#2a2a2a] transition-colors whitespace-nowrap">
              Subscribe
            </motion.button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
