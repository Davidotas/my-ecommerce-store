"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { StoreSettings } from "@/lib/products";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=85";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const wordVariants = {
  hidden: { opacity: 0, y: 52, rotateX: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.85, delay: 0.2 + i * 0.1, ease: EASE },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: 0.55 + i * 0.12, ease: EASE },
  }),
};

export default function Hero({ settings }: { settings: StoreSettings | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax: image moves at ~30% of scroll speed
  const imgY = useTransform(scrollY, [0, 600], [0, 120]);

  const heroImage  = settings?.hero_image_url  || FALLBACK_IMAGE;
  const title      = settings?.hero_title      || "New Season Arrivals";
  const subtitle   = settings?.hero_subtitle   || "Discover curated pieces for the modern wardrobe.";
  const buttonText = settings?.hero_button_text || "Shop Now";
  const buttonLink = settings?.hero_button_link || "/#products";

  const words = title.split(" ");

  return (
    <div ref={containerRef} className="relative h-screen min-h-[640px] overflow-hidden bg-[#fafaf8]" style={{ perspective: "1200px" }}>
      {/* Parallax + Ken Burns image */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <div className="ken-burns absolute inset-0">
          <Image src={heroImage} alt="Hero" fill priority className="object-cover" />
        </div>
      </motion.div>

      {/* Gradient: light on left for text */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(105deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0.05) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <motion.p
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="text-[11px] tracking-[0.6em] uppercase font-medium text-[#9ca3af] mb-6"
        >
          Collection 2026
        </motion.p>

        {/* Word-by-word animated headline */}
        <h1
          className="text-[clamp(52px,8vw,110px)] text-[#111111] max-w-2xl mb-8 overflow-hidden"
          style={{ lineHeight: "0.93" }}
        >
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden mr-[0.2em] last:mr-0">
              <motion.span
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className="inline-block"
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="text-[#6b7280] text-lg max-w-sm mb-10 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center gap-5 flex-wrap"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href={buttonLink}
              className="bg-[#111111] text-white text-[11px] tracking-[0.2em] uppercase font-semibold px-10 py-4 hover:bg-[#2a2a2a] transition-colors duration-300 inline-block">
              {buttonText}
            </Link>
          </motion.div>
          <Link href="/#categories"
            className="nav-underline text-[#111111] text-sm font-medium text-[13px] tracking-wide">
            Browse Categories
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.4em] uppercase text-[#9ca3af]">Scroll</span>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-[#111111]/30 to-transparent" />
      </motion.div>
    </div>
  );
}
