"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

type Props = { products: Product[] };

export default function NewArrivalsGrid({ products }: Props) {
  if (products.length === 0) return null;
  const displayed = products.slice(0, 8);

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        className="flex items-end justify-between mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="text-[11px] tracking-[0.5px] uppercase font-medium text-[#9c9381] mb-2">Just dropped</p>
          <h2 className="text-3xl sm:text-4xl text-white">New Arrivals</h2>
        </div>
        <Link
          href="/?category="
          className="text-sm font-medium text-[#9c9381] hover:text-white transition-colors hidden sm:block"
        >
          View all →
        </Link>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {displayed.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-12 text-center sm:hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          href="/"
          className="inline-block border border-[rgba(255,255,255,0.2)] text-white text-xs tracking-[0.2em] uppercase font-medium px-8 py-3 hover:border-white transition-colors"
        >
          View All
        </Link>
      </motion.div>
    </section>
  );
}
