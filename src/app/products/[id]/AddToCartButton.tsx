"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

type State = "idle" | "loading" | "added";

type Particle = {
  id: number;
  angle: number;
  distance: number;
  color: string;
  isCircle: boolean;
};

const CONFETTI_COLORS = ["#d2691e", "#daa520", "#d2ff1f", "#111111", "#e07340", "#f4c430", "#8b4513"];

function makeParticles(n = 20): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.4,
    distance: 40 + Math.random() * 60,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    isCircle: Math.random() > 0.4,
  }));
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [state, setState] = useState<State>("idle");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showPlus, setShowPlus] = useState(false);

  // Clean up particles after animation
  useEffect(() => {
    if (particles.length === 0) return;
    const t = setTimeout(() => setParticles([]), 900);
    return () => clearTimeout(t);
  }, [particles]);

  function handleAdd() {
    if (state !== "idle") return;
    setState("loading");
    setParticles(makeParticles());
    setShowPlus(true);

    setTimeout(() => {
      addItem(product);
      setState("added");
      setShowPlus(false);
    }, 650);

    setTimeout(() => setState("idle"), 2600);
  }

  const outOfStock = product.stock === 0;

  return (
    // overflow-visible so confetti particles aren't clipped
    <div className="relative" style={{ overflow: "visible" }}>
      {/* Confetti particles */}
      {particles.map((p) => {
        const tx = Math.cos(p.angle) * p.distance;
        const ty = Math.sin(p.angle) * p.distance - 20;
        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: p.isCircle ? 7 : 8,
              height: p.isCircle ? 7 : 5,
              marginLeft: p.isCircle ? -3.5 : -4,
              marginTop: p.isCircle ? -3.5 : -2.5,
              background: p.color,
              borderRadius: p.isCircle ? "50%" : 1,
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        );
      })}

      {/* Floating "+1" */}
      <AnimatePresence>
        {showPlus && (
          <motion.div
            key="plus"
            initial={{ opacity: 1, y: 0, x: "-50%" }}
            animate={{ opacity: 0, y: -44 }}
            exit={{}}
            transition={{ duration: 0.85, ease: "easeOut" }}
            style={{ position: "absolute", top: -4, left: "50%", zIndex: 30 }}
            className="text-[#111111] text-sm font-bold pointer-events-none select-none"
          >
            +1
          </motion.div>
        )}
      </AnimatePresence>

      {/* The button */}
      <motion.button
        onClick={outOfStock ? undefined : handleAdd}
        disabled={outOfStock || state === "loading"}
        // Idle pulse
        animate={
          state === "idle" && !outOfStock
            ? {
                boxShadow: [
                  "0 0 0 0px rgba(17,17,17,0)",
                  "0 0 0 6px rgba(17,17,17,0.07)",
                  "0 0 0 0px rgba(17,17,17,0)",
                ],
              }
            : { boxShadow: "0 0 0 0px rgba(17,17,17,0)" }
        }
        transition={
          state === "idle" && !outOfStock
            ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
        whileHover={state === "idle" && !outOfStock ? { scale: 1.01 } : {}}
        whileTap={state === "idle" && !outOfStock ? { scale: 0.98 } : {}}
        className={`relative w-full overflow-hidden text-[10px] tracking-[0.22em] uppercase font-semibold py-4 transition-colors duration-300 ${
          outOfStock
            ? "bg-[#f5f5f3] text-[#9ca3af] cursor-not-allowed"
            : state === "added"
            ? "bg-[#d2ff1f] text-[#111111]"
            : "bg-[#111111] text-white"
        }`}
      >
        {/* Progress bar */}
        {state === "loading" && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "linear" }}
            style={{ transformOrigin: "left" }}
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d2ff1f] pointer-events-none"
          />
        )}

        {/* Label */}
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
              Adding to Bag…
            </motion.span>
          ) : state === "added" ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              Added! ✓
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Add to Bag
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
