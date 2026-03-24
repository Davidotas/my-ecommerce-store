"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCurrency } from "@/lib/currency";

type Props = { products: Product[] };

function EditorialCard({ product, i }: { product: Product; i: number }) {
  const { addItem } = useCart();
  const { currency } = useCurrency();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      {/* Image */}
      <div className="relative overflow-hidden mb-4" style={{ aspectRatio: "3/4" }}>
        <Link href={`/products/${product.id}`} className="block absolute inset-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="w-full h-full bg-[#ede8e0] flex items-center justify-center">
              <span className="text-[#9ca3af] text-sm">No image</span>
            </div>
          )}
        </Link>

        {/* Sale badge */}
        {discount && (
          <span className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-semibold px-2 py-0.5 tracking-wider z-10">
            -{discount}%
          </span>
        )}

        {/* Wishlist button */}
        <motion.button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          whileTap={{ scale: 0.8 }}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Toggle wishlist"
        >
          <svg className="w-4 h-4" fill={wished ? "#111111" : "none"} stroke="#111111" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>

        {/* Quick add — slides up */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-3.5 hover:bg-[#d2ff1f] hover:text-[#111111] transition-colors duration-300"
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Info row: name left, price right */}
      <Link href={`/products/${product.id}`} className="block">
        {product.category && (
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#9ca3af] mb-1">{product.category}</p>
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] text-[#111111] leading-snug font-normal group-hover:text-[#6b7280] transition-colors duration-200 flex-1">
            {product.name}
          </h3>
          <div className="text-right shrink-0">
            <span className="text-[15px] font-medium text-[#111111]">
              {formatCurrency(product.price, currency)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div className="text-[12px] text-[#9ca3af] line-through">
                {formatCurrency(product.compareAtPrice, currency)}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function EditorialProductGrid({ products }: Props) {
  if (products.length === 0) return null;

  // Chunk into alternating 3-col then 2-col rows for editorial feel
  type Row = { items: Product[]; cols: 3 | 2 };
  const rows: Row[] = [];
  let idx = 0;
  let is3col = true;
  while (idx < products.length) {
    if (is3col) {
      rows.push({ items: products.slice(idx, idx + 3), cols: 3 });
      idx += 3;
    } else {
      rows.push({ items: products.slice(idx, idx + 2), cols: 2 });
      idx += 2;
    }
    is3col = !is3col;
  }

  let globalIdx = 0;

  return (
    <div className="space-y-12">
      {rows.map((row, ri) => {
        const gridClass =
          row.cols === 3
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14"
            : "grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-14";

        return (
          <div key={ri} className={gridClass}>
            {row.items.map((product) => {
              const cardIdx = globalIdx++;
              return <EditorialCard key={product.id} product={product} i={cardIdx} />;
            })}
          </div>
        );
      })}
    </div>
  );
}
