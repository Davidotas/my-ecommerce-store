"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

type Props = { products: Product[] };

export default function NewArrivalsGrid({ products }: Props) {
  if (products.length === 0) return null;
  const displayed = products.slice(0, 8);

  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });
  const gridInView    = useInView(gridRef,    { once: true, margin: "-60px" });

  return (
    <section id="products" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-28">
      {/* Heading */}
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 40 }}
        animate={headingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-14"
      >
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#9ca3af] mb-3">Just dropped</p>
          <h2 className="text-[clamp(40px,5vw,64px)] text-[#111111]">New Arrivals</h2>
        </div>
        <Link href="/" className="nav-underline text-sm text-[#6b7280] hover:text-[#111111] transition-colors hidden sm:block pb-px">
          View all
        </Link>
      </motion.div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
        {displayed.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 28 }}
            animate={gridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={gridInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-14 text-center sm:hidden"
      >
        <Link href="/"
          className="inline-block border border-[#e8e8e5] text-[#111111] text-[10px] tracking-[0.25em] uppercase font-semibold px-10 py-3.5 hover:border-[#111111] transition-colors">
          View All
        </Link>
      </motion.div>
    </section>
  );
}
