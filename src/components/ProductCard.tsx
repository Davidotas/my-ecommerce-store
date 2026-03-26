"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCurrency } from "@/lib/currency";

export default function ProductCard({ product, isNew }: { product: Product; isNew?: boolean }) {
  const { addItem } = useCart();
  const { currency } = useCurrency();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="group">
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#fafaf8] mb-4">
        <Link href={`/products/${product.id}`} className="block absolute inset-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="w-full h-full bg-[#f5f5f3] flex items-center justify-center">
              <span className="text-[#9ca3af] text-sm">No image</span>
            </div>
          )}
        </Link>

        {/* New badge */}
        {isNew && !discount && (
          <span className="absolute top-3 left-3 bg-white text-[#111111] text-[9px] font-bold px-2.5 py-1 tracking-widest border border-[#111111] z-10">
            NEW
          </span>
        )}
        {/* Sale badge */}
        {discount && (
          <span className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-semibold px-2.5 py-1 tracking-wider z-10">
            -{discount}%
          </span>
        )}

        {/* Wishlist */}
        <motion.button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          whileTap={{ scale: 0.8 }}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
          aria-label="Toggle wishlist"
        >
          <svg className="w-4 h-4" fill={wished ? "#111111" : "none"} stroke="#111111" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>

        {/* Quick add — slides up from bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-[380ms] ease-out">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] transition-colors duration-300"
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <Link href={`/products/${product.id}`} className="block group/link">
        {product.category && (
          <p className="text-[10px] text-[#9ca3af] uppercase tracking-[0.15em] mb-1.5">{product.category}</p>
        )}
        <h3 className="text-[17px] text-[#111111] font-normal mb-2 leading-snug group-hover/link:text-[#6b7280] transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium text-[#111111]">
            {formatCurrency(product.price, currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[15px] text-[#9ca3af] line-through">
              {formatCurrency(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
