"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Category } from "@/lib/products";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
  "https://images.unsplash.com/photo-1593641421160-97d58e2ecf38?w=600&q=80",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

type Props = { categories: Category[] };

export default function FeaturedCategories({ categories }: Props) {
  const items = categories.length > 0 ? categories : [];
  if (items.length === 0) return null;

  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        className="flex items-end justify-between mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="text-[11px] tracking-[0.5px] uppercase font-medium text-[#9c9381] mb-2">Browse by</p>
          <h2 className="text-3xl sm:text-4xl text-white">Categories</h2>
        </div>
        <Link href="/" className="text-sm font-medium text-[#9c9381] hover:text-white transition-colors hidden sm:block">
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
            <Link href={`/?category=${cat.slug}`} className="group block relative overflow-hidden aspect-[3/4] bg-[#0d1117]">
              <Image
                src={FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(#03060700 0%, #03060799 100%)" }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                  <p className="text-white font-medium text-sm sm:text-base">{cat.name}</p>
                  <p className="text-[#d2ff1f] text-xs mt-0.5 tracking-[0.5px] uppercase font-medium">Shop now →</p>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
