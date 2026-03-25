"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Product } from "@/lib/products";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

const EASE = [0.22, 1, 0.36, 1] as const;

const COLLECTIONS = [
  {
    label: "Best for Women",
    title: "WOMEN'S\nCOLLECTION",
    href: "/",
    buttonText: "Shop Women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85",
    imageLeft: true,
  },
  {
    label: "Best for Men",
    title: "MEN'S\nCOLLECTION",
    href: "/",
    buttonText: "Shop Men",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1400&q=85",
    imageLeft: false,
  },
];

function ProductSideCard({ product }: { product: Product }) {
  const { currency } = useCurrency();
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-2xl p-5 w-full max-w-[320px] shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#f5f5f3] rounded-xl overflow-hidden mb-4">
        {discount && (
          <span className="absolute top-3 left-3 z-10 bg-[#ef4444] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#9ca3af] text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.category && (
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#9ca3af] mb-1">{product.category}</p>
          )}
          <h3 className="text-[15px] text-[#111111] font-medium leading-snug truncate">{product.name}</h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[15px] font-semibold text-[#111111]">{formatCurrency(product.price, currency)}</p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <p className="text-[12px] text-[#9ca3af] line-through">
              {formatCurrency(product.compareAtPrice, currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function CollectionRow({
  collection,
  product,
  index,
}: {
  collection: (typeof COLLECTIONS)[number];
  product: Product;
  index: number;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const imageBlock = (
    <div className="relative w-full lg:w-[58%] aspect-[4/3] lg:aspect-auto lg:min-h-[540px] overflow-hidden">
      <Image src={collection.image} alt={collection.title} fill className="object-cover" />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.38)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="text-white/70 text-[11px] tracking-[0.35em] uppercase mb-4"
        >
          {collection.label}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.32, ease: EASE }}
          className="text-white font-black leading-[0.92] mb-8 whitespace-pre-line"
          style={{ fontSize: "clamp(38px, 5.5vw, 72px)", letterSpacing: "-0.02em" }}
        >
          {collection.title}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.46, ease: EASE }}
        >
          <Link
            href={collection.href}
            className="inline-block bg-white text-[#111111] text-sm font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors duration-300"
          >
            {collection.buttonText}
          </Link>
        </motion.div>
      </div>
    </div>
  );

  const cardBlock = (
    <motion.div
      initial={{ opacity: 0, x: collection.imageLeft ? 24 : -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
      className="flex items-center justify-center w-full lg:w-[42%] bg-[#f5f5f3] p-10 lg:p-16 min-h-[360px]"
    >
      <ProductSideCard product={product} />
    </motion.div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, ease: EASE }}
      className={`flex flex-col ${collection.imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}
    >
      {imageBlock}
      {cardBlock}
    </motion.div>
  );
}

export default function CollectionBanner({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="overflow-hidden">
      {COLLECTIONS.map((col, i) => (
        <CollectionRow
          key={col.title}
          collection={col}
          product={products[i] ?? products[0]}
          index={i}
        />
      ))}
    </div>
  );
}
