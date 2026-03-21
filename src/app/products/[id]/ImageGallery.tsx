"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : [];

  if (safeImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex flex-col gap-2 w-16 shrink-0">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden transition-opacity ${
                i === active ? "ring-2 ring-black opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 aspect-square bg-gray-100 overflow-hidden">
        <Image
          src={safeImages[active]}
          alt={name}
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
