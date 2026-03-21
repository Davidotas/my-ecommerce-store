"use client";

import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES, CurrencyCode } from "@/lib/currency";
import { Category, StoreSettings } from "@/lib/products";

const SHOP_LINKS = [
  { label: "New Arrivals", href: "/" },
  { label: "Women", href: "/?category=women" },
  { label: "Men", href: "/?category=men" },
  { label: "Accessories", href: "/?category=accessories" },
  { label: "Sale", href: "/?category=sale" },
];

const INFO_LINKS = [
  { label: "About Us", href: "/" },
  { label: "Sustainability", href: "/" },
  { label: "Careers", href: "/" },
  { label: "Press", href: "/" },
];

const SUPPORT_LINKS = [
  { label: "FAQ", href: "/" },
  { label: "Shipping & Returns", href: "/" },
  { label: "Size Guide", href: "/" },
  { label: "Contact Us", href: "/" },
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

  return (
    <footer className="bg-[#030607] border-t border-[rgba(255,255,255,0.2)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* Top grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs tracking-[0.35em] uppercase font-bold text-white mb-4">{storeName}</p>
            <p className="text-[#9c9381] text-xs leading-relaxed mb-6 max-w-[180px]">
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
                  className="text-[#9c9381] hover:text-[#d2ff1f] transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9c9381] mb-4">Shop</p>
            <ul className="space-y-2.5">
              {(categories && categories.length > 0
                ? categories.map((c) => ({ label: c.name, href: `/?category=${c.slug}` }))
                : SHOP_LINKS
              ).map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-[#9c9381] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9c9381] mb-4">Company</p>
            <ul className="space-y-2.5">
              {INFO_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-[#9c9381] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9c9381] mb-4">Support</p>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-[#9c9381] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(255,255,255,0.2)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[#9c9381] tracking-wide">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>

          {/* Currency selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#9c9381] uppercase tracking-wider">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-[#9c9381] text-[10px] uppercase tracking-wider border border-[rgba(255,255,255,0.2)] px-2 py-1 outline-none hover:border-white transition-colors cursor-pointer"
            >
              {Object.entries(CURRENCIES).map(([code, c]) => (
                <option key={code} value={code} className="bg-[#030607] text-white">
                  {c.flag} {code}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-[10px] text-[#9c9381] hover:text-white transition-colors">Privacy</Link>
            <Link href="/" className="text-[10px] text-[#9c9381] hover:text-white transition-colors">Terms</Link>
            <Link href="/" className="text-[10px] text-[#9c9381] hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
