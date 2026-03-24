"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Product } from "@/lib/products";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

const TRUST = [
  { icon: "✦", text: "Free shipping on orders over $100" },
  { icon: "↩", text: "Free returns within 30 days" },
  { icon: "⬛", text: "Secure checkout" },
];

type Props = { product: Product; children: React.ReactNode };

export default function ProductDetails({ product, children }: Props) {
  const { currency } = useCurrency();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  const item = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, delay: 0.05 + i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div ref={ref} className="flex flex-col">
      {/* Category label */}
      {product.category && (
        <motion.p {...item(0)} className="text-[10px] tracking-[0.4em] uppercase font-medium text-[#9ca3af] mb-4">
          {product.category}
        </motion.p>
      )}

      {/* Title */}
      <motion.h1 {...item(1)} className="text-[clamp(28px,3vw,42px)] font-normal text-[#111111] leading-tight mb-5">
        {product.name}
      </motion.h1>

      {/* Price */}
      <motion.div {...item(2)} className="flex items-baseline gap-3 mb-6">
        <span className="text-2xl font-medium text-[#111111]">
          {formatCurrency(product.price, currency)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <>
            <span className="text-lg text-[#9ca3af] line-through">
              {formatCurrency(product.compareAtPrice, currency)}
            </span>
            <span className="bg-[#111111] text-white text-[10px] font-semibold px-2.5 py-0.5 tracking-wider">
              -{discount}%
            </span>
          </>
        )}
      </motion.div>

      {/* Divider */}
      <motion.div {...item(3)} className="border-t border-[#f3f4f6] mb-6" />

      {/* Description */}
      {product.description && (
        <motion.p {...item(4)} className="text-[#6b7280] text-sm leading-relaxed mb-8">
          {product.description}
        </motion.p>
      )}

      {/* Stock warning */}
      {product.stock > 0 && product.stock <= 5 && (
        <motion.p {...item(5)} className="text-xs text-orange-500 mb-4 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full" />
          Only {product.stock} left in stock
        </motion.p>
      )}
      {product.stock === 0 && (
        <motion.p {...item(5)} className="text-xs text-[#ef4444] mb-4 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          Out of stock
        </motion.p>
      )}

      {/* Actions */}
      <motion.div {...item(6)} className="space-y-3">
        {children}
        <Link
          href="/cart"
          className="block w-full border border-[#e8e8e5] text-[#6b7280] text-[10px] tracking-[0.22em] uppercase font-semibold text-center py-4 hover:border-[#111111] hover:text-[#111111] transition-colors"
        >
          View Bag
        </Link>
      </motion.div>

      {/* Trust signals */}
      <motion.div {...item(7)} className="mt-8 pt-6 border-t border-[#f3f4f6] space-y-3">
        {TRUST.map((t) => (
          <div key={t.text} className="flex items-center gap-3 text-xs text-[#6b7280]">
            <span className="text-[#111111] w-4 text-center">{t.icon}</span>
            <span>{t.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
