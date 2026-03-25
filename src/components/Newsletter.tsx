"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Newsletter() {
  const [email, setEmail]   = useState("");
  const [submitted, setSubmit] = useState(false);
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#111111] py-36 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
        className="max-w-3xl mx-auto text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="text-[11px] tracking-[0.6em] uppercase font-medium text-white/40 mb-6"
        >
          Join the Workshop
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.2, ease: EASE }}
          className="text-[clamp(40px,6vw,80px)] text-white leading-[0.94] mb-6"
          style={{ letterSpacing: "-0.03em" }}
        >
          Join the Inner Circle
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          className="text-white/40 text-base mb-14 leading-relaxed max-w-sm mx-auto"
        >
          Be the first to know about new pieces, bespoke offers, and workshop releases.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex items-center justify-center gap-3"
            >
              <span className="w-6 h-6 bg-white text-[#111111] text-sm flex items-center justify-center font-bold">✓</span>
              <p className="text-white text-base font-medium">You&apos;re on the list. Welcome.</p>
            </motion.div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setSubmit(true); }}
              className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/8 border border-white/15 text-white text-sm px-6 py-4 outline-none focus:border-white/50 transition-colors placeholder-white/30"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-white text-[#111111] text-[10px] tracking-[0.25em] uppercase font-bold px-10 py-4 hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
