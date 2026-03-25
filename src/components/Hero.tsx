"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { StoreSettings } from "@/lib/products";

const FALLBACK_IMAGE = "/hero-bg.jpg";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const wordVariants = {
  hidden: { opacity: 0, y: 60, rotateX: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.9, delay: 0.3 + i * 0.12, ease: EASE },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: 0.7 + i * 0.14, ease: EASE },
  }),
};

export default function Hero({ settings }: { settings: StoreSettings | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 700], [0, 140]);

  const heroImage  = FALLBACK_IMAGE;
  const title      = settings?.hero_title      || "New Season Arrivals";
  const subtitle   = settings?.hero_subtitle   || "Discover curated pieces for the modern wardrobe.";
  const buttonText = settings?.hero_button_text || "Shop Now";
  const buttonLink = settings?.hero_button_link || "/#products";

  const words = title.split(" ");

  return (
    <div
      ref={containerRef}
      className="relative h-screen min-h-[640px] overflow-hidden bg-[#111111]"
      style={{ perspective: "1200px" }}
    >
      {/* Parallax + Ken Burns image */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <div className="ken-burns absolute inset-0">
          <Image src={heroImage} alt="Hero" fill priority className="object-cover opacity-60" />
        </div>
      </motion.div>

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.80) 100%)",
        }}
      />

      {/* Content — centered */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-[11px] tracking-[0.7em] uppercase font-medium text-white/50 mb-8"
        >
          Collection 2026
        </motion.p>

        {/* Word-by-word animated headline */}
        <h1
          className="text-[clamp(52px,9vw,120px)] text-white max-w-4xl mb-8 overflow-hidden"
          style={{ lineHeight: "0.92", letterSpacing: "-0.03em" }}
        >
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden mr-[0.22em] last:mr-0">
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
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-white/60 text-lg max-w-md mb-12 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-6 flex-wrap justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={buttonLink}
              className="bg-white text-[#111111] text-[11px] tracking-[0.22em] uppercase font-semibold px-12 py-4 hover:bg-white/90 transition-colors duration-300 inline-block"
            >
              {buttonText}
            </Link>
          </motion.div>
          <Link
            href="/#categories"
            className="text-white/70 text-[11px] tracking-[0.18em] uppercase font-medium border-b border-white/30 pb-px hover:text-white hover:border-white transition-colors duration-300"
          >
            Browse Categories
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.5em] uppercase text-white/40">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
        />
      </motion.div>
    </div>
  );
}
