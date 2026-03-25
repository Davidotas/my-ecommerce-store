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
    <section id="categories" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-28">
      {/* Heading */}
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 40 }}
        animate={headingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-14"
      >
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#9ca3af] mb-3">Browse by</p>
          <h2 className="text-[clamp(40px,5vw,64px)] text-[#111111]">Categories</h2>
        </div>
        <Link href="/" className="nav-underline text-sm text-[#6b7280] hover:text-[#111111] transition-colors hidden sm:block pb-px">
          View all
        </Link>
      </motion.div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
        {items.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 36 }}
            animate={gridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/?category=${cat.slug}`} className="group block relative overflow-hidden aspect-[3/4] bg-[#f5f5f3]">
              <Image
                src={FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />

              {/* Label — always visible, slides up on hover */}
              <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">
                <div
                  className="transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-500 ease-out"
                >
                  <p className="text-white text-base font-medium drop-shadow-sm">{cat.name}</p>
                  <p className="text-white/70 text-[11px] tracking-[0.3em] uppercase font-semibold mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-75">
                    Shop →
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
