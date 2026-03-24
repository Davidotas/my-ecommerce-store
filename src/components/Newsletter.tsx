"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="bg-[#f9fafb] border-t border-[#e5e7eb] py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">Stay in the loop</p>
          <h2 className="text-3xl sm:text-4xl text-[#111111] mb-4">
            Join the Inner Circle
          </h2>
          <p className="text-[#6b7280] text-sm mb-10 leading-relaxed max-w-md mx-auto">
            Be the first to know about new drops, exclusive offers, and curated edits. No spam, ever.
          </p>

          {submitted ? (
            <motion.p
              className="text-[#111111] text-sm tracking-wide font-medium"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              You&apos;re on the list. Welcome. ✓
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border border-[#e5e7eb] text-[#111111] placeholder-[#9ca3af] text-sm px-4 py-3 outline-none focus:border-[#111111] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#111111] text-white text-xs tracking-[0.2em] uppercase font-semibold px-6 py-3 hover:bg-[#333333] transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
