"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { useCart, type CustomizationData } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const ProductCustomizer = dynamic(
  () => import("@/components/ProductCustomizer"),
  { ssr: false }
);

type State = "idle" | "loading" | "added";

export default function AddToCartButton({
  product,
  quantity = 1,
}: {
  product: Product;
  quantity?: number;
}) {
  const { addItem, addCustomizedItem } = useCart();
  const { toggle, has } = useWishlist();
  const [state, setState] = useState<State>("idle");
  const [customizerOpen, setCustomizerOpen] = useState(false);
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
      addItem(product, quantity);
      setState("added");
    }, 480);
  }

  function handleCustomizerAdd(customization: CustomizationData) {
    addCustomizedItem(product, customization);
    setState("added");
    setTimeout(() => setState("idle"), 2200);
  }

  return (
    <>
      {/* Row: Add to cart + wishlist */}
      <div className="flex gap-2.5 mb-3">
        <motion.button
          onClick={handleAdd}
          disabled={outOfStock || state === "loading"}
          whileHover={state === "idle" && !outOfStock ? { scale: 1.005 } : {}}
          whileTap={state === "idle" && !outOfStock ? { scale: 0.99 } : {}}
          className={`relative flex-1 overflow-hidden text-[12px] tracking-[0.15em] uppercase font-semibold py-[15px] transition-colors duration-300 ${
            outOfStock
              ? "bg-[#f5f5f3] text-[#9ca3af] cursor-not-allowed"
              : state === "added"
              ? "bg-[#111111] text-white"
              : "bg-[#111111] text-white hover:bg-[#222222]"
          }`}
        >
          {state === "loading" && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.46, ease: "linear" }}
              style={{ transformOrigin: "left" }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/25 pointer-events-none"
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
                Added to Cart ✓
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Wishlist */}
        <motion.button
          onClick={() => toggle(product)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={`w-[52px] flex-shrink-0 border flex items-center justify-center transition-all duration-200 ${
            wished
              ? "border-[#111111] bg-[#111111] text-white"
              : "border-[#e8e8e5] text-[#6b7280] hover:border-[#111111] hover:text-[#111111]"
          }`}
        >
          <svg
            className="w-4.5 h-4.5"
            style={{ width: "18px", height: "18px" }}
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </motion.button>
      </div>

      {/* Customise button */}
      {!outOfStock && (
        <motion.button
          onClick={() => setCustomizerOpen(true)}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.99 }}
          className="w-full border border-[#e8e8e5] text-[#111111] text-[12px] tracking-[0.12em] uppercase font-medium py-[13px] flex items-center justify-center gap-2 hover:border-[#111111] transition-colors duration-200"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Customise This Product
        </motion.button>
      )}

      {/* Customiser overlay */}
      <AnimatePresence>
        {customizerOpen && (
          <motion.div
            key="customizer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ProductCustomizer
              product={product}
              onClose={() => setCustomizerOpen(false)}
              onAddToCart={(customization) => {
                handleCustomizerAdd(customization);
                setCustomizerOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
