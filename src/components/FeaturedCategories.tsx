"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Category } from "@/lib/products";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
  "https://images.unsplash.com/photo-1593641421160-97d58e2ecf38?w=800&q=80",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

type Props = { categories: Category[] };

export default function FeaturedCategories({ categories }: Props) {
  const items = categories.length > 0 ? categories : [];
  if (items.length === 0) return null;

  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        className="flex items-end justify-between mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-2">Browse by</p>
          <h2 className="text-3xl sm:text-4xl text-[#111111]">Categories</h2>
        </div>
        <Link href="/" className="text-sm font-medium text-[#6b7280] hover:text-[#111111] transition-colors hidden sm:block">
          View all →
        </Link>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {items.map((cat, i) => (
          <motion.div key={cat.id} variants={itemVariants}>
            <Link href={`/?category=${cat.slug}`} className="group block relative overflow-hidden aspect-[3/4] bg-[#f3f4f6]">
              <Image
                src={FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.55) 100%)" }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                  <p className="text-white font-medium text-sm sm:text-base mb-1">{cat.name}</p>
                  <p className="text-[#d2ff1f] text-xs tracking-[0.5px] uppercase font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop now →
                  </p>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
