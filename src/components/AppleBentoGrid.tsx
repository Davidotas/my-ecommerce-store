"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Product } from "@/lib/products";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

const EASE = [0.22, 1, 0.36, 1] as const;

function FloatingImage({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }}
      className="relative w-full max-w-[260px] aspect-square mx-auto"
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-contain drop-shadow-2xl"
      />
    </motion.div>
  );
}

function BentoCard({
  product,
  delay = 0,
  size = "medium",
}: {
  product: Product;
  delay?: number;
  size?: "tall" | "medium" | "wide";
}) {
  const { currency } = useCurrency();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const minH =
    size === "tall" ? "520px" : size === "wide" ? "360px" : "440px";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.72, delay, ease: EASE }}
      className={`group relative bg-[#f5f5f7] rounded-[18px] overflow-hidden flex items-center justify-between hover:bg-[#ebebed] transition-colors duration-500 cursor-pointer ${
        size === "wide"
          ? "flex-col sm:flex-row py-12 px-8 sm:px-14"
          : "flex-col py-12 px-8"
      }`}
      style={{ minHeight: minH }}
    >
      {/* Image */}
      <div
        className={`w-full flex items-center justify-center ${
          size === "wide" ? "sm:w-1/2" : "flex-1"
        } py-2`}
      >
        {product.image ? (
          <FloatingImage src={product.image} alt={product.name} />
        ) : (
          <div className="w-48 aspect-square bg-[#e8e8e6] rounded-2xl" />
        )}
      </div>

      {/* Text */}
      <div
        className={`w-full ${
          size === "wide" ? "sm:w-1/2 sm:pl-12 sm:text-left text-center mt-6 sm:mt-0" : "text-center mt-4"
        }`}
      >
        {product.category && (
          <p className="text-[#6e6e73] text-[15px] mb-1">{product.category}</p>
        )}
        <h3
          className="text-[#1d1d1f] font-bold leading-tight mb-2 tracking-tight"
          style={{ fontSize: "clamp(20px, 2.2vw, 30px)", letterSpacing: "-0.5px" }}
        >
          {product.name}
        </h3>
        <p className="text-[#6e6e73] text-[17px] mb-6">
          {formatCurrency(product.price, currency)}
        </p>
        <div
          className={`flex items-center gap-3 flex-wrap ${
            size === "wide" ? "sm:justify-start justify-center" : "justify-center"
          }`}
        >
          <Link
            href={`/products/${product.id}`}
            className="bg-[#1d1d1f] text-white text-[14px] font-medium px-5 py-2.5 rounded-full hover:bg-[#3d3d3d] transition-colors duration-200"
          >
            Shop Now
          </Link>
          <Link
            href={`/products/${product.id}`}
            className="bg-black/[0.07] text-[#1d1d1f] text-[14px] font-medium px-5 py-2.5 rounded-full hover:bg-black/[0.12] transition-colors duration-200"
          >
            Learn More
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function AppleBentoGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const p = products;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-4">
        {/* Row 1: 2 tall cards */}
        {p.length >= 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {p[0] && <BentoCard product={p[0]} delay={0} size="tall" />}
            {p[1] && <BentoCard product={p[1]} delay={0.1} size="tall" />}
          </div>
        )}

        {/* Row 2: 3 medium cards */}
        {p.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {p.slice(2, 5).map((product, i) => (
              <BentoCard key={product.id} product={product} delay={i * 0.08} size="medium" />
            ))}
          </div>
        )}

        {/* Row 3: 1 wide card */}
        {p[5] && <BentoCard product={p[5]} delay={0} size="wide" />}

        {/* Row 4: 2 more */}
        {p[6] && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {p.slice(6, 8).map((product, i) => (
              <BentoCard key={product.id} product={product} delay={i * 0.1} size="medium" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
