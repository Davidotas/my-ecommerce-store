"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Category } from "@/lib/products";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
  "https://images.unsplash.com/photo-1593641421160-97d58e2ecf38?w=800&q=80",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
];

type Props = { categories: Category[] };

export default function FeaturedCategories({ categories }: Props) {
  const items = categories.length > 0 ? categories : [];
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });
  const gridInView    = useInView(gridRef,    { once: true, margin: "-60px" });

  if (items.length === 0) return null;

  return (
    <section id="categories" className="bg-white max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
      {/* Heading */}
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 30 }}
        animate={headingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#9ca3af] mb-3">Browse by</p>
          <h2 className="text-[clamp(36px,5vw,60px)] text-[#111111]">Categories</h2>
        </div>
        <Link
          href="/"
          className="nav-underline text-sm text-[#6b7280] hover:text-[#111111] transition-colors hidden sm:block"
        >
          View all
        </Link>
      </motion.div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
        {items.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 28 }}
            animate={gridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/?category=${cat.slug}`} className="group block">
              {/* Image card */}
              <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-[#f5f5f3] mb-3">
                <Image
                  src={cat.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                  alt={cat.name}
                  fill
                  unoptimized={!!cat.image_url}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
              </div>

              {/* Label below image */}
              <div className="px-1 flex items-center justify-between">
                <p className="text-[15px] text-[#111111] font-medium leading-snug group-hover:text-[#6b7280] transition-colors duration-200">
                  {cat.name}
                </p>
                <svg
                  className="w-4 h-4 text-[#9ca3af] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all duration-200"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
