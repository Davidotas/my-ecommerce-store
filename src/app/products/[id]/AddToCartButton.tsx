"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const FONTS = [
  { id: "serif",     label: "Classic Serif",   style: { fontFamily: "Georgia, serif" } },
  { id: "sans",      label: "Modern Sans",      style: { fontFamily: "Helvetica, Arial, sans-serif" } },
  { id: "script",    label: "Elegant Script",   style: { fontFamily: "Palatino Linotype, Palatino, serif", fontStyle: "italic" as const } },
  { id: "mono",      label: "Typewriter",       style: { fontFamily: "Courier New, Courier, monospace" } },
];

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
  const [state, setState]               = useState<State>("idle");
  const [panelOpen, setPanelOpen]       = useState(false);
  const [engraving, setEngraving]       = useState("");
  const [font, setFont]                 = useState(FONTS[0].id);
  const [fileName, setFileName]         = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [notes, setNotes]               = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const wished     = has(product.id);
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

  function handleEngravingAdd() {
    if (!engraving.trim() && !fileName && !notes.trim()) {
      handleAdd();
      return;
    }
    const selectedFont = FONTS.find(f => f.id === font) ?? FONTS[0];
    const summary = [
      engraving ? `"${engraving.slice(0, 30)}"` : null,
      engraving ? `(${selectedFont.label})` : null,
      fileName ? "+ image" : null,
    ].filter(Boolean).join(" ");

    addCustomizedItem(product, {
      fabricJson: JSON.stringify({ engraving, font, fileName, notes }),
      previewDataUrl: "",
      summary: summary || "Custom engraving",
      productId: product.id,
    });
    setState("added");
    setPanelOpen(false);
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
          <svg style={{ width: "18px", height: "18px" }} fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>
      </div>

      {/* ── Two customise buttons ── */}
      {!outOfStock && (
        <div className="flex gap-2.5 mb-1">
          {/* Simple engraving */}
          <button
            onClick={() => setPanelOpen(p => !p)}
            className={`flex-1 border text-[11px] tracking-[0.1em] uppercase font-medium py-[11px] flex items-center justify-center gap-1.5 transition-colors duration-200 ${
              panelOpen
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#e8e8e5] text-[#6b7280] hover:border-[#111111] hover:text-[#111111]"
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Add Engraving
          </button>

          {/* Advanced 3D customiser */}
          <Link
            href={`/customize?product=${product.id}`}
            className="flex-1 border border-[#e8e8e5] text-[#6b7280] text-[11px] tracking-[0.1em] uppercase font-medium py-[11px] flex items-center justify-center gap-1.5 hover:border-[#111111] hover:text-[#111111] transition-colors duration-200"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
            </svg>
            3D Customiser
          </Link>
        </div>
      )}

      {/* ── Simple engraving panel (slide down) ── */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border border-[#e8e8e5] bg-[#fafaf8] p-5 mt-1 space-y-4">
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#9ca3af] font-medium">Personalise This Product</p>

              {/* Engraving text */}
              <div>
                <label className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280] block mb-2">
                  Engraving Text <span className="normal-case tracking-normal font-normal text-[#9ca3af]">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={engraving}
                    onChange={e => setEngraving(e.target.value.slice(0, 30))}
                    placeholder="Name, date, or short quote…"
                    className="w-full border border-[#e8e8e5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#111111] transition-colors pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9ca3af]">{engraving.length}/30</span>
                </div>
                {/* Live preview */}
                <AnimatePresence>
                  {engraving && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 bg-[#111111] px-4 py-3 text-center rounded"
                    >
                      <span className="text-white/90 text-base" style={FONTS.find(f => f.id === font)?.style}>
                        {engraving}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Font */}
              {engraving && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280] block mb-2">Font Style</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FONTS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFont(f.id)}
                        className={`px-3 py-2 border text-left text-xs transition-all ${
                          font === f.id
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#e8e8e5] bg-white text-[#6b7280] hover:border-[#111111]"
                        }`}
                      >
                        <span style={f.style} className="block text-sm mb-0.5">Aa</span>
                        <span className="text-[10px]">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Image upload */}
              <div>
                <label className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280] block mb-2">Upload Image / Logo <span className="normal-case tracking-normal font-normal text-[#9ca3af]">(optional)</span></label>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0] ?? null;
                    setUploadedFile(f);
                    setFileName(f?.name ?? "");
                  }} />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="border border-[#e8e8e5] bg-white px-4 py-2 text-xs text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-all">
                    Choose File
                  </button>
                  {fileName
                    ? <span className="text-xs text-[#111111] truncate max-w-[160px]">{fileName}</span>
                    : <span className="text-xs text-[#9ca3af]">No file chosen</span>}
                  {fileName && (
                    <button onClick={() => { setUploadedFile(null); setFileName(""); }}
                      className="text-[#ef4444] text-xs hover:underline">Remove</button>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280] block mb-2">Special Notes <span className="normal-case tracking-normal font-normal text-[#9ca3af]">(optional)</span></label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any specific requests…"
                  className="w-full border border-[#e8e8e5] bg-white px-3 py-2 text-sm outline-none focus:border-[#111111] transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleEngravingAdd}
                  className="flex-1 bg-[#111111] text-white text-[11px] tracking-[0.15em] uppercase font-semibold py-3 hover:bg-[#222] transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="px-4 border border-[#e8e8e5] text-[#6b7280] text-xs hover:border-[#111111] hover:text-[#111111] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
