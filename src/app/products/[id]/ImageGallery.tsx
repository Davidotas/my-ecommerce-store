"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : [];

  if (safeImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-[#f5f5f3] flex items-center justify-center">
        <span className="text-[#9ca3af] text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails — left column */}
      {safeImages.length > 1 && (
        <div className="flex flex-col gap-2 w-[72px] shrink-0">
          {safeImages.map((img, i) => (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative aspect-square overflow-hidden transition-all duration-200 ${
                i === active
                  ? "ring-1 ring-[#111111]"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill unoptimized className="object-cover" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Main image with AnimatePresence fade */}
      <div className="relative flex-1 aspect-[3/4] bg-[#fafaf8] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={safeImages[active]}
              alt={name}
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
