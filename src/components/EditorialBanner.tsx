"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=85";

type Props = { imageUrl?: string; title?: string; subtitle?: string; linkUrl?: string };

export default function EditorialBanner({
  imageUrl = EDITORIAL_IMAGE,
  title    = "Curated for the Season",
  subtitle = "Timeless silhouettes. Effortless style. Discover our editors' picks for the modern wardrobe.",
  linkUrl  = "/",
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const inView     = useInView(textRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [-60, 60]); // parallax range

  const stagger = (i: number) => ({
    initial: { opacity: 0, x: -28 },
    animate: inView ? { opacity: 1, x: 0 } : {},
    transition: { duration: 0.7, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  return (
    <section ref={sectionRef} className="relative h-[78vh] min-h-[540px] overflow-hidden my-8">
      {/* Parallax image */}
      <motion.div className="absolute inset-[-10%]" style={{ y: imgY }}>
        <Image src={imageUrl} alt="Editorial" fill className="object-cover object-center" />
      </motion.div>

      {/* Left-side overlay */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 45%, transparent 100%)" }}
      />

      {/* Text */}
      <div ref={textRef} className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <motion.p {...stagger(0)} className="text-[11px] tracking-[0.5em] uppercase font-medium text-white/60 mb-5">
          The Edit
        </motion.p>
        <motion.h2 {...stagger(1)}
          className="text-[clamp(40px,5.5vw,80px)] text-white leading-[0.96] max-w-lg mb-7">
          {title}
        </motion.h2>
        <motion.p {...stagger(2)} className="text-white/70 text-base max-w-sm mb-10 leading-relaxed">
          {subtitle}
        </motion.p>
        <motion.div {...stagger(3)}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href={linkUrl}
              className="inline-block bg-white text-[#111111] text-[10px] tracking-[0.22em] uppercase font-semibold px-10 py-4 hover:bg-white/85 transition-colors duration-300">
              Explore the Edit
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
