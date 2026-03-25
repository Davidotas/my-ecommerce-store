"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  {
    number: "01",
    title: "Reclaimed Wood Only",
    body: "Every piece is crafted from responsibly sourced reclaimed wood — giving new life to materials that would otherwise go to waste.",
  },
  {
    number: "02",
    title: "Handcrafted by Artisans",
    body: "Our skilled craftspeople shape, sand, and finish each item entirely by hand. No mass production — ever.",
  },
  {
    number: "03",
    title: "Every Piece is Unique",
    body: "Natural wood grain means no two items are identical. You receive a truly one-of-a-kind work of art.",
  },
  {
    number: "04",
    title: "Bespoke Orders Welcome",
    body: "Want something custom? We take bespoke orders for personalised gifts, home décor, and gallery pieces.",
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
            Why MyKolo
          </p>
          <h2 className="text-[clamp(36px,4.5vw,60px)] text-[#111111] max-w-md" style={{ letterSpacing: "-0.03em" }}>
            Crafted with purpose.
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
