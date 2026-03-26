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

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = { categories: Category[] };

export default function FeaturedCategories({ categories }: Props) {
  const items = categories.length > 0 ? categories : [];
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

  if (items.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Heading */}
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 24 }}
        animate={headingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: EASE }}
        className="text-center mb-10"
      >
        <p className="text-[#6e6e73] text-[17px] mb-1">Explore</p>
        <h2
          className="text-[#1d1d1f] font-bold tracking-tight"
          style={{ fontSize: "clamp(28px, 3.5vw, 48px)", letterSpacing: "-0.5px" }}
        >
          Shop by Category
        </h2>
      </motion.div>

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {items.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={gridInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: i * 0.07, ease: EASE }}
          >
            <Link
              href={`/shop?categories=${cat.slug}`}
              className="group block bg-[#f5f5f7] rounded-[18px] overflow-hidden hover:bg-[#ebebed] transition-colors duration-400"
            >
              {/* Image — top portion, object-cover */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={cat.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                  alt={cat.name}
                  fill
                  unoptimized={!!cat.image_url}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>

              {/* Text area */}
              <div className="px-6 py-5 text-center">
                <h3
                  className="text-[#1d1d1f] font-bold mb-3 tracking-tight"
                  style={{ fontSize: "18px", letterSpacing: "-0.3px" }}
                >
                  {cat.name}
                </h3>
                <span className="inline-block bg-[#1d1d1f] text-white text-[13px] font-medium px-4 py-2 rounded-full group-hover:bg-[#3d3d3d] transition-colors duration-200">
                  Shop Now
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
