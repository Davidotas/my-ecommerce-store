"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { StoreSettings } from "@/lib/products";

const FALLBACK_IMAGE =
  "/handcrafted-wooden-decorative-tray.jpg"; // Replace with your actual fallback image path

export default function Hero({ settings }: { settings: StoreSettings | null }) {
  const heroImage = settings?.hero_image_url || FALLBACK_IMAGE;
  const title = settings?.hero_title || "Where Wood Becomes Art.";
  const subtitle =
    settings?.hero_subtitle || "Discover curated pieces for the modern wardrobe.";

  return (
    <div className="relative h-[85vh] min-h-[560px] overflow-hidden bg-[#030607]">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <Image
          src={heroImage}
          alt="Hero"
          fill
          priority
          className="object-cover opacity-55"
        />
      </motion.div>

      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(#03060700 0%, #03060799 100%)" }}
      />

      <div className="relative z-10 flex flex-col justify-end h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <motion.p
          className="text-[11px] tracking-[0.5px] uppercase font-medium text-[#9c9381] mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Collection 2026
        </motion.p>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-8xl text-white leading-[1.02] max-w-3xl mb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-[#9c9381] text-base sm:text-lg max-w-md mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <Link
            href="/#products"
            className="bg-[#d2ff1f] text-[#030607] text-sm font-semibold px-8 py-3.5 hover:opacity-90 transition-opacity"
          >
            Shop Now
          </Link>
          <Link
            href="/#categories"
            className="text-white text-sm font-medium border-b border-[rgba(255,255,255,0.4)] pb-px hover:border-white transition-colors"
          >
            Browse Categories
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
