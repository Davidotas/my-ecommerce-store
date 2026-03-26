"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function ImageGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const safe = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= safe.length) return;
      setDir(next > index ? 1 : -1);
      setIndex(next);
    },
    [index, safe.length]
  );

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Only swipe horizontally if horizontal delta dominates
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) go(index + 1);
    else go(index - 1);
  }

  if (safe.length === 0) {
    return (
      <div className="aspect-[4/5] lg:h-screen bg-[#f5f5f3] flex items-center justify-center">
        <span className="text-[#9ca3af] text-sm">No image</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Main gallery ── */}
      <div className="select-none">
        {/* Slide area */}
        <div
          className="relative aspect-[4/5] lg:h-screen overflow-hidden bg-[#f5f5f3] cursor-zoom-in"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence custom={dir} initial={false}>
            <motion.div
              key={index}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={safe[index]}
                alt={`${name} — view ${index + 1}`}
                fill
                priority={index === 0}
                unoptimized
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradient for counter legibility */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent pointer-events-none z-10" />

          {/* Counter */}
          <span className="absolute bottom-5 left-5 text-white/70 text-[10px] tracking-[0.3em] font-light select-none z-10">
            {String(index + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(safe.length).padStart(2, "0")}
          </span>

          {/* Zoom hint */}
          <span className="absolute bottom-5 right-5 text-white/50 text-[9px] tracking-[0.25em] uppercase font-light select-none z-10 hidden sm:block">
            Click to zoom
          </span>

          {/* Prev arrow */}
          {index > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); go(index - 1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-10 shadow-sm"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {index < safe.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); go(index + 1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-10 shadow-sm"
              aria-label="Next image"
            >
              <svg className="w-4 h-4 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {safe.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
            {safe.map((src, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`relative flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 overflow-hidden transition-all duration-200 ${
                  i === index
                    ? "ring-2 ring-[#111111] ring-offset-1"
                    : "ring-1 ring-[#e8e8e5] opacity-60 hover:opacity-100"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${name} thumbnail ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={(e) => {
              if (touchStartX.current === null || touchStartY.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              const dy = e.changedTouches[0].clientY - touchStartY.current;
              touchStartX.current = null;
              touchStartY.current = null;
              if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;
              if (dx < 0) go(index + 1);
              else go(index - 1);
            }}
          >
            {/* Counter */}
            <span className="absolute top-5 left-6 text-white/40 text-[10px] tracking-[0.3em] z-10">
              {String(index + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(safe.length).padStart(2, "0")}
            </span>

            {/* Close */}
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-5 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <AnimatePresence custom={dir} initial={false}>
              <motion.div
                key={index}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-xl mx-16 aspect-[3/4]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={safe[index]}
                  alt={name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {/* Prev */}
            {index > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); go(index - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all z-10"
                aria-label="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next */}
            {index < safe.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); go(index + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all z-10"
                aria-label="Next"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Dot indicators */}
            {safe.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {safe.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); go(i); }}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === index ? "bg-white w-4" : "bg-white/30 w-1.5 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
