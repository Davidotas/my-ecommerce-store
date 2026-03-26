"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";
import AddToCartButton from "./AddToCartButton";

const EASE = [0.22, 1, 0.36, 1] as const;

const PRODUCT_DETAILS = [
  ["MATERIAL", "Reclaimed Wood"],
  ["FINISH", "Natural Oil"],
  ["MADE IN", "Nigeria"],
  ["CARE", "Wipe with damp cloth"],
];

const ACCORDIONS = [
  {
    id: "shipping",
    title: "Shipping & Delivery",
    body: "We ship worldwide. Standard delivery takes 5–10 business days; express options are available at checkout. Every order is carefully packaged to ensure safe arrival.",
  },
  {
    id: "returns",
    title: "Returns & Exchanges",
    body: "Returns are accepted within 14 days of delivery. Items must be unused and in original condition. Customised pieces are non-returnable. Contact us to initiate a return.",
  },
  {
    id: "care",
    title: "Care Instructions",
    body: "Wipe gently with a damp cloth. Avoid prolonged exposure to water or direct sunlight. Apply a food-safe mineral oil every few months to preserve the natural lustre.",
  },
];

function StarRating({ score = 4.2 }: { score?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(1, Math.max(0, score - (star - 1)));
          return (
            <span key={star} className="relative inline-block text-[13px]">
              <span className="text-[#d1d5db]">★</span>
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
      <span className="text-[11px] text-[#9ca3af] tracking-wide">{score.toFixed(1)}</span>
    </div>
  );
}

export default function ProductDetails({ product }: { product: Product }) {
  const { currency } = useCurrency();
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  const spring = (i: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, delay: 0.05 + i * 0.065, ease: EASE },
  });

  return (
    <div ref={ref}>

      {/* Back link */}
      <motion.div {...spring(0)} className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase text-[#9ca3af] hover:text-[#111111] transition-colors group"
        >
          <svg
            className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Shop
        </Link>
      </motion.div>

      {/* Category label */}
      {product.category && (
        <motion.p
          {...spring(1)}
          className="text-[9px] tracking-[0.5em] uppercase font-semibold text-[#9ca3af] mb-3"
        >
          {product.category}
        </motion.p>
      )}

      {/* Product name */}
      <motion.h1
        {...spring(2)}
        className="text-[clamp(24px,2.6vw,40px)] font-semibold text-[#111111] leading-[1.1] tracking-tight mb-4"
      >
        {product.name}
      </motion.h1>

      {/* Price */}
      <motion.div {...spring(3)} className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-semibold text-[#111111]">
          {formatCurrency(product.price, currency)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <>
            <span className="text-base text-[#9ca3af] line-through">
              {formatCurrency(product.compareAtPrice, currency)}
            </span>
            {discount && (
              <span className="text-[9px] font-bold tracking-widest bg-[#111111] text-white px-2.5 py-1">
                -{discount}%
              </span>
            )}
          </>
        )}
      </motion.div>

      {/* Star rating */}
      <motion.div {...spring(4)} className="mb-6">
        <StarRating />
      </motion.div>

      {/* Divider */}
      <motion.div
        {...spring(5)}
        className="border-t border-[#e8e8e5] mb-6"
      />

      {/* Description */}
      {product.description && (
        <motion.p
          {...spring(6)}
          className="text-[#6b7280] text-[13.5px] leading-[1.75] mb-7"
        >
          {product.description}
        </motion.p>
      )}

      {/* Product detail rows */}
      <motion.div {...spring(7)} className="mb-7">
        {PRODUCT_DETAILS.map(([key, val]) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 border-b border-[#f3f4f6] last:border-0"
          >
            <span className="text-[9px] tracking-[0.4em] uppercase text-[#b0b0b0] font-medium">
              {key}
            </span>
            <span className="text-[13px] text-[#111111] font-medium">{val}</span>
          </div>
        ))}
      </motion.div>

      {/* Stock status */}
      {product.stock > 0 && product.stock <= 5 && (
        <motion.p
          {...spring(8)}
          className="text-xs text-amber-600 mb-4 flex items-center gap-1.5"
        >
          <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          Only {product.stock} left in stock
        </motion.p>
      )}
      {product.stock === 0 && (
        <motion.p
          {...spring(8)}
          className="text-xs text-[#ef4444] mb-4 flex items-center gap-1.5"
        >
          <span className="inline-block w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          Out of stock
        </motion.p>
      )}

      {/* Quantity selector */}
      {product.stock > 0 && (
        <motion.div {...spring(9)} className="mb-5">
          <p className="text-[9px] tracking-[0.4em] uppercase text-[#9ca3af] font-medium mb-2.5">
            Quantity
          </p>
          <div className="inline-flex items-center border border-[#e8e8e5]">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-[#6b7280] hover:text-[#111111] hover:bg-[#f9f9f7] transition-colors"
              aria-label="Decrease quantity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className="w-10 h-10 flex items-center justify-center text-[14px] font-medium text-[#111111] border-x border-[#e8e8e5] tabular-nums">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="w-10 h-10 flex items-center justify-center text-[#6b7280] hover:text-[#111111] hover:bg-[#f9f9f7] transition-colors"
              aria-label="Increase quantity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Add to cart + wishlist + customise */}
      <motion.div {...spring(10)} className="mb-8">
        <AddToCartButton product={product} quantity={qty} />
      </motion.div>

      {/* Accordions */}
      <motion.div {...spring(11)} className="border-t border-[#e8e8e5]">
        {ACCORDIONS.map((acc) => (
          <div key={acc.id} className="border-b border-[#e8e8e5]">
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === acc.id ? null : acc.id)
              }
              className="w-full flex items-center justify-between py-[14px] text-left group"
            >
              <span className="text-[13px] font-medium text-[#111111] group-hover:text-[#6b7280] transition-colors">
                {acc.title}
              </span>
              <motion.span
                animate={{ rotate: openAccordion === acc.id ? 45 : 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="text-[#9ca3af] shrink-0 ml-3"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openAccordion === acc.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="text-[13px] text-[#6b7280] leading-relaxed pb-5">
                    {acc.body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
