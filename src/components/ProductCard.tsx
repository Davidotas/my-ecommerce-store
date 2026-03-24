"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCurrency } from "@/lib/currency";

export default function ProductCard({ product }: { product: Product }) {
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
      <Link href={`/products/${product.id}`} className="block relative aspect-[3/4] bg-[#f3f4f6] overflow-hidden mb-3">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-[#f3f4f6] flex items-center justify-center">
            <span className="text-[#9ca3af] text-xs">No image</span>
          </div>
        )}

        {/* Sale badge */}
        {discount && (
          <span className="absolute top-2 left-2 bg-[#ef4444] text-white text-[10px] font-medium px-2 py-0.5 tracking-wide">
            -{discount}%
          </span>
        )}

        {/* Wishlist heart */}
        <motion.button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          whileTap={{ scale: 0.85 }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border border-[#e5e7eb] bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label="Toggle wishlist"
        >
          <svg
            className="w-4 h-4 transition-colors"
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            style={{ color: wished ? "#ef4444" : "#6b7280" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>

        {/* Quick add */}
        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="absolute bottom-0 left-0 right-0 bg-[#111111] text-white text-[10px] tracking-[0.2em] uppercase font-medium py-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hover:bg-[#d2ff1f] hover:text-[#111111]"
        >
          Add to cart
        </button>
      </Link>

      <Link href={`/products/${product.id}`} className="block hover:opacity-60 transition-opacity">
        {product.category && (
          <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">{product.category}</p>
        )}
        <h3 className="text-sm text-[#111111] font-medium mb-1.5">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#111111]">
            {formatCurrency(product.price, currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-[#9ca3af] line-through">
              {formatCurrency(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
