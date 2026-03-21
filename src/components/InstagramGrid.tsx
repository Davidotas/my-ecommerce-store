"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const PHOTOS = [
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function InstagramGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-[11px] tracking-[0.5px] uppercase font-medium text-[#9c9381] mb-2">Follow along</p>
        <h2
          className="text-3xl sm:text-4xl text-white"
        >
          @mystore
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {PHOTOS.map((src, i) => (
          <motion.div key={i} variants={itemVariants} className="group relative aspect-square overflow-hidden bg-[#0d1117]">
            <Image
              src={src}
              alt={`Instagram post ${i + 1}`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
            />
            <div className="absolute inset-0 bg-[#030607]/0 group-hover:bg-[#030607]/30 transition-colors duration-300" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
