"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=85";

type Props = {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
};

export default function EditorialBanner({
  imageUrl = EDITORIAL_IMAGE,
  title = "Curated for the Season",
  subtitle = "Timeless silhouettes. Effortless style. Discover our editors' picks for the modern wardrobe.",
  linkUrl = "/",
}: Props) {
  return (
    <section className="relative h-[75vh] min-h-[520px] overflow-hidden my-6">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <Image
          src={imageUrl}
          alt="Editorial"
          fill
          className="object-cover object-top"
        />
      </motion.div>

      {/* Dark overlay on left for text */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }}
      />

      <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          className="text-[11px] tracking-[0.5em] uppercase font-medium text-white/70 mb-5"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          The Edit
        </motion.p>

        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl text-white leading-tight max-w-xl mb-6"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="text-white/75 text-base max-w-sm mb-10 leading-relaxed"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          <Link
            href={linkUrl}
            className="inline-block bg-white text-[#111111] text-xs tracking-[0.2em] uppercase font-semibold px-8 py-4 hover:bg-[#d2ff1f] transition-colors duration-300"
          >
            Explore the Edit
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
