"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES, CurrencyCode } from "@/lib/currency";
import { Category, StoreSettings } from "@/lib/products";

const INFO_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Sustainability", href: "/about" },
  { label: "Careers", href: "/about" },
  { label: "Press", href: "/about" },
];

const SUPPORT_LINKS = [
  { label: "FAQ", href: "/faq" },
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Contact Us", href: "/contact" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.18 8.18 0 004.79 1.53V6.78a4.85 4.85 0 01-1.03-.09z" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.44 7.63 11.22-.1-.97-.2-2.45.04-3.5.22-.94 1.47-6.24 1.47-6.24s-.38-.75-.38-1.86c0-1.75 1.01-3.05 2.27-3.05 1.07 0 1.59.8 1.59 1.77 0 1.08-.69 2.69-1.04 4.18-.3 1.25.62 2.27 1.83 2.27 2.2 0 3.68-2.82 3.68-6.16 0-2.54-1.72-4.32-4.18-4.32-2.84 0-4.51 2.13-4.51 4.34 0 .86.33 1.78.74 2.29a.3.3 0 01.07.28c-.08.3-.24.96-.28 1.1-.04.17-.14.21-.32.13-1.25-.58-2.03-2.42-2.03-3.89 0-3.16 2.3-6.07 6.63-6.07 3.48 0 6.19 2.48 6.19 5.8 0 3.46-2.18 6.24-5.2 6.24-1.02 0-1.97-.53-2.3-1.15l-.62 2.33c-.23.86-.84 1.93-1.25 2.58.94.29 1.94.45 2.97.45 6.63 0 12-5.37 12-12S18.63 0 12 0z" />
      </svg>
    ),
  },
];

type Props = { categories?: Category[]; settings?: StoreSettings | null };

export default function Footer({ categories, settings }: Props) {
  const { currency, setCurrency } = useCurrency();
  const storeName = settings?.store_name || "MYSTORE";

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <footer ref={ref} className="bg-white border-t border-[#e5e7eb] text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* Top grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <motion.div {...stagger(0)} className="col-span-2 sm:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mykolo-logo.png"
              alt={storeName}
              style={{ height: "40px", width: "auto" }}
              className="mb-4"
            />
            <p className="text-[#6b7280] text-xs leading-relaxed mb-6 max-w-[180px]">
              Curated pieces for the modern wardrobe. Timeless style, delivered worldwide.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-[#6b7280] hover:text-[#111111] transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Shop */}
          <motion.div {...stagger(1)}>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280] mb-4">Shop</p>
            <ul className="space-y-2.5">
              {(categories && categories.length > 0
                ? categories.map((c) => ({ label: c.name, href: `/?category=${c.slug}` }))
                : [{ label: "All Products", href: "/" }]
              ).map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-[#6b7280] hover:text-[#111111] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info */}
          <motion.div {...stagger(2)}>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280] mb-4">Company</p>
            <ul className="space-y-2.5">
              {INFO_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-[#6b7280] hover:text-[#111111] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div {...stagger(3)}>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280] mb-4">Support</p>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-[#6b7280] hover:text-[#111111] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="border-t border-[#e5e7eb] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-[10px] text-[#9ca3af] tracking-wide">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>

          {/* Currency selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-white text-[#6b7280] text-[10px] uppercase tracking-wider border border-[#e5e7eb] px-2 py-1 outline-none hover:border-[#d1d5db] transition-colors cursor-pointer"
            >
              {Object.entries(CURRENCIES).map(([code, c]) => (
                <option key={code} value={code}>
                  {c.flag} {code}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[10px] text-[#9ca3af] hover:text-[#111111] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[10px] text-[#9ca3af] hover:text-[#111111] transition-colors">Terms</Link>
            <Link href="/shipping" className="text-[10px] text-[#9ca3af] hover:text-[#111111] transition-colors">Shipping</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
