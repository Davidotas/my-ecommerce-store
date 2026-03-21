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
      <Link href={`/products/${product.id}`} className="block relative aspect-[3/4] bg-[#0d1117] overflow-hidden mb-3">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-[#0d1117] flex items-center justify-center">
            <span className="text-[#9c9381] text-xs">No image</span>
          </div>
        )}

        {/* Sale badge */}
        {discount && (
          <span className="absolute top-2 left-2 bg-[#f01919] text-white text-xs font-medium px-2 py-0.5">
            -{discount}%
          </span>
        )}

        {/* Wishlist heart */}
        <motion.button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          whileTap={{ scale: 0.85 }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border border-[rgba(255,255,255,0.25)] bg-[#030607]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#030607]/80"
          aria-label="Toggle wishlist"
        >
          <svg
            className="w-4 h-4 transition-colors"
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            style={{ color: wished ? "#f01919" : "white" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>

        {/* Quick add */}
        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="absolute bottom-0 left-0 right-0 bg-[#030607]/90 backdrop-blur-sm text-white text-xs tracking-[0.15em] uppercase font-medium py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hover:bg-[#d2ff1f] hover:text-[#030607]"
        >
          Add to cart
        </button>
      </Link>

      <Link href={`/products/${product.id}`} className="block hover:opacity-70 transition-opacity">
        {product.category && (
          <p className="text-xs text-[#9c9381] uppercase tracking-wider mb-1">{product.category}</p>
        )}
        <h3 className="text-sm text-white font-medium mb-1.5">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {formatCurrency(product.price, currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-[#9c9381] line-through">
              {formatCurrency(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
