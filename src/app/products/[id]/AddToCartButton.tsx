"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");

  function handleAdd() {
    if (state !== "idle") return;
    setState("loading");
    // Simulate brief loading pulse then confirm
    setTimeout(() => {
      addItem(product);
      setState("added");
      setTimeout(() => setState("idle"), 2000);
    }, 600);
  }

  const outOfStock = product.stock === 0;

  return (
    <motion.button
      onClick={handleAdd}
      disabled={outOfStock || state === "loading"}
      whileHover={outOfStock || state !== "idle" ? {} : { scale: 1.01 }}
      whileTap={outOfStock || state !== "idle" ? {} : { scale: 0.99 }}
      className={`relative w-full overflow-hidden text-[10px] tracking-[0.22em] uppercase font-semibold py-4 transition-colors duration-300 ${
        outOfStock
          ? "bg-[#f5f5f3] text-[#9ca3af] cursor-not-allowed"
          : state === "added"
          ? "bg-[#d2ff1f] text-[#111111]"
          : "bg-[#111111] text-white hover:bg-[#2a2a2a]"
      }`}
    >
      {/* Loading shimmer overlay */}
      {state === "loading" && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}

      <AnimatePresence mode="wait">
        {outOfStock ? (
          <motion.span key="oos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Out of Stock
          </motion.span>
        ) : state === "loading" ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            Adding...
          </motion.span>
        ) : state === "added" ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            Added to Bag ✓
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Add to Bag
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
