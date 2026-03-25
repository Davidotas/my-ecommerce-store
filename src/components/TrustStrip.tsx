"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  {
    number: "01",
    title: "Curated Quality",
    body: "Every piece in our collection is hand-selected for craftsmanship, material, and lasting style.",
  },
  {
    number: "02",
    title: "Worldwide Delivery",
    body: "Fast, tracked shipping to over 120 countries. Free returns within 30 days — no questions asked.",
  },
  {
    number: "03",
    title: "Exclusive Drops",
    body: "New arrivals weekly. Inner Circle members get early access to limited-edition collections.",
  },
  {
    number: "04",
    title: "Sustainably Made",
    body: "We partner with ethical manufacturers committed to fair wages and eco-conscious production.",
  },
];

export default function TrustStrip() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#fafaf8] border-t border-[#e8e8e5] py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: EASE }}
          className="mb-20"
        >
          <p className="text-[11px] tracking-[0.55em] uppercase font-medium text-[#9ca3af] mb-4">
            Why Mykolo
          </p>
          <h2 className="text-[clamp(36px,4.5vw,60px)] text-[#111111] max-w-md" style={{ letterSpacing: "-0.03em" }}>
            Fashion, elevated.
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e8e8e5]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.number}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1, ease: EASE }}
              className="bg-[#fafaf8] p-10 group hover:bg-white transition-colors duration-300"
            >
              <span className="block text-[11px] tracking-[0.3em] text-[#9ca3af] mb-8 font-medium">
                {f.number}
              </span>
              <h3
                className="text-[20px] text-[#111111] mb-4 leading-snug"
                style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
              >
                {f.title}
              </h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
