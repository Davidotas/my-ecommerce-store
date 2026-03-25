"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Product } from "@/lib/products";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

type Props = { product: Product; children: React.ReactNode };

function StarRating({ score = 4.2, count = 0 }: { score?: number; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(1, Math.max(0, score - (star - 1)));
          return (
            <span key={star} className="relative inline-block text-[#111111]" style={{ fontSize: "14px" }}>
              {/* Empty star */}
              <span className="text-[#d1d5db]">★</span>
              {/* Filled portion */}
              <span
                className="absolute inset-0 overflow-hidden text-[#111111]"
                style={{ width: `${fill * 100}%` }}
              >
                ★
              </span>
            </span>
          );
        })}
      </div>
      {count > 0 && <span className="text-xs text-[#6b7280]">{count} reviews</span>}
    </div>
  );
}

export default function ProductDetails({ product, children }: Props) {
  const { currency } = useCurrency();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  const item = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay: 0.05 + i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div ref={ref} className="flex flex-col">
      {/* Category label */}
      {product.category && (
        <motion.p {...item(0)} className="text-[10px] tracking-[0.4em] uppercase font-medium text-[#9ca3af] mb-3">
          {product.category}
        </motion.p>
      )}

      {/* Title */}
      <motion.h1 {...item(1)} className="text-[clamp(22px,2.5vw,34px)] font-normal text-[#111111] leading-tight mb-3">
        {product.name}
      </motion.h1>

      {/* Price */}
      <motion.div {...item(2)} className="flex items-baseline gap-3 mb-3">
        <span className="text-xl font-medium text-[#111111]">
          {formatCurrency(product.price, currency)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <>
            <span className="text-base text-[#9ca3af] line-through">
              {formatCurrency(product.compareAtPrice, currency)}
            </span>
            <span className="bg-[#ef4444] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          </>
        )}
      </motion.div>

      {/* Star rating */}
      <motion.div {...item(3)} className="mb-5">
        <StarRating score={4.2} count={0} />
      </motion.div>

      <motion.div {...item(4)} className="border-t border-[#f3f4f6] mb-5" />

      {/* Description */}
      {product.description && (
        <motion.p {...item(5)} className="text-[#6b7280] text-sm leading-relaxed mb-6">
          {product.description}
        </motion.p>
      )}

      {/* Stock warning */}
      {product.stock > 0 && product.stock <= 5 && (
        <motion.p {...item(6)} className="text-xs text-orange-500 mb-4 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full" />
          Only {product.stock} left in stock
        </motion.p>
      )}
      {product.stock === 0 && (
        <motion.p {...item(6)} className="text-xs text-[#ef4444] mb-4 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          Out of stock
        </motion.p>
      )}

      {/* Add to cart — full width + wishlist square */}
      <motion.div {...item(7)}>
        {children}
      </motion.div>

      {/* Divider */}
      <motion.div {...item(8)} className="border-t border-[#f3f4f6] mt-6 mb-5" />

      {/* Shipping & returns info rows */}
      <motion.div {...item(9)} className="space-y-4">
        {[
          {
            icon: (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            ),
            label: "Shipping policy",
            href: "/shipping",
          },
          {
            icon: (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            ),
            label: "Returns policy",
            href: "/shipping",
          },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm text-[#6b7280]">
            <div className="flex items-center gap-2.5">
              {row.icon}
              <span>{row.label}</span>
            </div>
            <Link href={row.href} className="text-[11px] tracking-wider underline underline-offset-2 text-[#111111] hover:text-[#6b7280] transition-colors">
              More
            </Link>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
