"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [showAll, setShowAll] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const safe = images.length > 0 ? images : [];
  const INITIAL_SHOW = 4;
  const displayed = showAll ? safe : safe.slice(0, INITIAL_SHOW);

  if (safe.length === 0) {
    return (
      <div className="aspect-[3/4] bg-[#f5f5f3] flex items-center justify-center">
        <span className="text-[#9ca3af] text-sm">No image</span>
      </div>
    );
  }

  return (
    <>
      {/* Image grid — 2 columns like Reserved */}
      <div className="space-y-1">
        {/* First image: full width, prominent */}
        <div
          className="relative w-full aspect-[4/5] overflow-hidden bg-[#f5f5f3] cursor-zoom-in"
          onClick={() => setLightbox(0)}
        >
          <Image
            src={safe[0]}
            alt={`${name} — view 1`}
            fill
            priority
            unoptimized
            className="object-cover hover:scale-[1.02] transition-transform duration-700"
          />
        </div>

        {/* Remaining images: 2-column grid */}
        {displayed.slice(1).length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {displayed.slice(1).map((img, i) => (
              <div
                key={i + 1}
                className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f3] cursor-zoom-in"
                onClick={() => setLightbox(i + 1)}
              >
                <Image
                  src={img}
                  alt={`${name} — view ${i + 2}`}
                  fill
                  unoptimized
                  className="object-cover hover:scale-[1.02] transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        )}

        {/* Show more button */}
        {!showAll && safe.length > INITIAL_SHOW && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-4 border border-[#e5e7eb] text-sm text-[#111111] font-medium hover:border-[#111111] transition-colors flex items-center justify-center gap-2"
          >
            Show more
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-2xl w-full aspect-[3/4]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={safe[lightbox]} alt={name} fill unoptimized className="object-contain" />
            </motion.div>

            <button
              onClick={() => setLightbox(null)}
              className="absolute top-5 right-5 text-white/70 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Prev/Next */}
            {lightbox > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {lightbox < safe.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
