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
    <section className="bg-[#030607] border-t border-[rgba(255,255,255,0.2)] py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[11px] tracking-[0.5px] uppercase font-medium text-[#9c9381] mb-4">Stay in the loop</p>
          <h2
            className="text-3xl sm:text-4xl text-white mb-4"
          >
            Join the Inner Circle
          </h2>
          <p className="text-[#9c9381] text-sm mb-8 leading-relaxed">
            Be the first to know about new drops, exclusive offers, and curated edits. No spam, ever.
          </p>

          {submitted ? (
            <motion.p
              className="text-[#d2ff1f] text-sm tracking-wide"
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
                className="flex-1 bg-white/5 border border-[rgba(255,255,255,0.2)] text-white placeholder-[#9c9381] text-sm px-4 py-3 outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-[#d2ff1f] text-[#030607] text-xs tracking-[0.2em] uppercase font-semibold px-6 py-3 hover:opacity-90 transition-opacity whitespace-nowrap"
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
