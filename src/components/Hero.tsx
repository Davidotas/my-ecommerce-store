"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { StoreSettings } from "@/lib/products";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=85";

export default function Hero({ settings }: { settings: StoreSettings | null }) {
  const heroImage = settings?.hero_image_url || FALLBACK_IMAGE;
  const title = settings?.hero_title || "New Season Arrivals";
  const subtitle = settings?.hero_subtitle || "Discover curated pieces for the modern wardrobe.";
  const buttonText = settings?.hero_button_text || "Shop Now";
  const buttonLink = settings?.hero_button_link || "/#products";

  return (
    <div className="relative h-[92vh] min-h-[600px] overflow-hidden bg-[#f9fafb]">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      >
        <Image
          src={heroImage}
          alt="Hero"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Gradient overlay — light left side for text legibility */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0) 100%)" }}
      />

      <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          className="text-[11px] tracking-[0.6em] uppercase font-medium text-[#6b7280] mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Collection 2026
        </motion.p>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-8xl text-[#111111] leading-[1.0] max-w-xl mb-6"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-[#6b7280] text-base sm:text-lg max-w-sm mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="flex items-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <Link
            href={buttonLink}
            className="bg-[#111111] text-white text-sm font-medium px-8 py-4 hover:bg-[#333333] transition-colors"
          >
            {buttonText}
          </Link>
          <Link
            href="/#categories"
            className="text-[#111111] text-sm font-medium border-b border-[#111111]/40 pb-px hover:border-[#111111] transition-colors"
          >
            Browse Categories →
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-[#111111]/40 to-transparent"
        />
      </motion.div>
    </div>
  );
}
