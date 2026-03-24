"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, +1 right
  const safe = images.length > 0 ? images : [];

  if (safe.length === 0) {
    return (
      <div className="aspect-[3/4] bg-[#f5f5f3] flex items-center justify-center">
        <span className="text-[#9ca3af] text-sm">No image</span>
      </div>
    );
  }

  function go(next: number) {
    setDirection(next > active ? 1 : -1);
    setActive(next);
  }

  function prev() { if (active > 0) go(active - 1); }
  function next() { if (active < safe.length - 1) go(active + 1); }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main image — horizontal slide gallery */}
      <div
        className="relative overflow-hidden bg-[#fafaf8] aspect-[3/4] cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={active}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) next();
              else if (info.offset.x > 60) prev();
            }}
            className="absolute inset-0"
          >
            <Image
              src={safe[active]}
              alt={`${name} — view ${active + 1}`}
              fill
              priority={active === 0}
              unoptimized
              draggable={false}
              className="object-cover select-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Left arrow */}
        {active > 0 && (
          <motion.button
            onClick={prev}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            animate={{ opacity: 0.7 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
            aria-label="Previous image"
          >
            <svg className="w-4 h-4 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}

        {/* Right arrow */}
        {active < safe.length - 1 && (
          <motion.button
            onClick={next}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            animate={{ opacity: 0.7 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
            aria-label="Next image"
          >
            <svg className="w-4 h-4 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}

        {/* Image counter */}
        {safe.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10 bg-black/50 text-white text-[10px] tracking-widest px-2.5 py-1">
            {active + 1} / {safe.length}
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {safe.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {safe.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              animate={{ width: i === active ? 20 : 6, opacity: i === active ? 1 : 0.35 }}
              transition={{ duration: 0.25 }}
              className="h-[3px] bg-[#111111] rounded-full"
              aria-label={`View image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip — scrollable */}
      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {safe.map((img, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`relative aspect-square w-14 shrink-0 overflow-hidden transition-all duration-200 ${
                i === active ? "ring-1 ring-[#111111]" : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill unoptimized className="object-cover" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
