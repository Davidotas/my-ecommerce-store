"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type State = "idle" | "loading" | "added";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [state, setState] = useState<State>("idle");
  const wished = has(product.id);
  const outOfStock = product.stock === 0;

  useEffect(() => {
    if (state === "added") {
      const t = setTimeout(() => setState("idle"), 2200);
      return () => clearTimeout(t);
    }
  }, [state]);

  function handleAdd() {
    if (state !== "idle" || outOfStock) return;
    setState("loading");
    setTimeout(() => {
      addItem(product);
      setState("added");
    }, 500);
  }

  return (
    <div className="flex gap-3">
      {/* Add to cart — full width */}
      <motion.button
        onClick={handleAdd}
        disabled={outOfStock || state === "loading"}
        whileHover={state === "idle" && !outOfStock ? { scale: 1.01 } : {}}
        whileTap={state === "idle" && !outOfStock ? { scale: 0.98 } : {}}
        className={`relative flex-1 overflow-hidden text-sm font-semibold py-4 transition-colors duration-300 ${
          outOfStock
            ? "bg-[#f5f5f3] text-[#9ca3af] cursor-not-allowed"
            : state === "added"
            ? "bg-[#111111] text-white"
            : "bg-[#111111] text-white hover:bg-[#2a2a2a]"
        }`}
      >
        {/* Loading progress bar */}
        {state === "loading" && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.48, ease: "linear" }}
            style={{ transformOrigin: "left" }}
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/30 pointer-events-none"
          />
        )}

        <AnimatePresence mode="wait">
          {outOfStock ? (
            <motion.span key="oos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Out of Stock
            </motion.span>
          ) : state === "loading" ? (
            <motion.span key="loading" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              Adding…
            </motion.span>
          ) : state === "added" ? (
            <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              Added to cart ✓
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Add to cart
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Wishlist square */}
      <motion.button
        onClick={() => toggle(product)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Add to wishlist"
        className={`w-14 h-[54px] border flex items-center justify-center transition-colors duration-200 ${
          wished
            ? "border-[#111111] bg-[#111111] text-white"
            : "border-[#e5e7eb] text-[#6b7280] hover:border-[#111111] hover:text-[#111111]"
        }`}
      >
        <svg className="w-5 h-5" fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </motion.button>
    </div>
  );
}
