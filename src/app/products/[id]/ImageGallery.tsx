"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const safe = images.length > 0 ? images : [];

  // Track which image is in view for the counter
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    imageRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.5, rootMargin: "0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, [safe.length]);

  // ESC to close lightbox
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft" && lightbox !== null && lightbox > 0)
        setLightbox(lightbox - 1);
      if (e.key === "ArrowRight" && lightbox !== null && lightbox < safe.length - 1)
        setLightbox(lightbox + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, safe.length]);

  if (safe.length === 0) {
    return (
      <div className="aspect-[4/5] lg:h-screen bg-[#f5f5f3] flex items-center justify-center">
        <span className="text-[#9ca3af] text-sm">No image</span>
      </div>
    );
  }

  return (
    <>
      {/* Image stack */}
      <div>
        {safe.map((src, i) => (
          <div
            key={i}
            ref={(el) => {
              imageRefs.current[i] = el;
            }}
            className="relative aspect-[4/5] lg:h-screen lg:aspect-auto overflow-hidden bg-[#f5f5f3] cursor-zoom-in group"
            onClick={() => setLightbox(i)}
          >
            <Image
              src={src}
              alt={`${name} — view ${i + 1}`}
              fill
              priority={i === 0}
              unoptimized
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />

            {/* Subtle bottom gradient for counter legibility */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

            {/* Image counter */}
            <span className="absolute bottom-6 left-6 text-white/70 text-[10px] tracking-[0.3em] font-light select-none z-10">
              {String(i + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(safe.length).padStart(2, "0")}
            </span>

            {/* Zoom hint on first image */}
            {i === 0 && (
              <span className="absolute bottom-6 right-6 text-white/50 text-[9px] tracking-[0.25em] uppercase font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
                Click to zoom
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            {/* Counter */}
            <span className="absolute top-5 left-6 text-white/40 text-[10px] tracking-[0.3em]">
              {String(lightbox + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(safe.length).padStart(2, "0")}
            </span>

            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-5 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-xl mx-8 aspect-[3/4]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={safe[lightbox]}
                alt={name}
                fill
                unoptimized
                className="object-contain"
              />
            </motion.div>

            {/* Prev */}
            {lightbox > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(lightbox - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all"
                aria-label="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next */}
            {lightbox < safe.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(lightbox + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all"
                aria-label="Next"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Thumbnail strip */}
            {safe.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                {safe.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox(i);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      i === lightbox ? "bg-white w-4" : "bg-white/30 hover:bg-white/60"
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
