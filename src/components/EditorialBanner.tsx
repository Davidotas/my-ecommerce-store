"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=85";

export default function EditorialBanner() {
  return (
    <section className="relative h-[70vh] min-h-[480px] overflow-hidden my-8">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image
          src={EDITORIAL_IMAGE}
          alt="Editorial"
          fill
          className="object-cover object-top opacity-80"
        />
      </motion.div>

      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to right, #030607cc 0%, #03060733 50%, #03060700 100%)" }}
      />

      <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          className="text-[11px] tracking-[0.5px] uppercase font-medium text-[#9c9381] mb-4"
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
          Curated for the Season
        </motion.h2>

        <motion.p
          className="text-[#9c9381] text-base max-w-sm mb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Timeless silhouettes. Effortless style. Discover our editors&apos; picks for the modern wardrobe.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          <Link
            href="/"
            className="inline-block bg-[#d2ff1f] text-[#030607] text-xs tracking-[0.2em] uppercase font-semibold px-8 py-3.5 hover:opacity-90 transition-opacity"
          >
            Explore the Edit
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
