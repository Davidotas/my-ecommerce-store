"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES, CurrencyCode } from "@/lib/currency";
import { Category, StoreSettings } from "@/lib/products";

type Props = { categories: Category[]; settings: StoreSettings | null };

const CATEGORY_IMAGES = [
  "/handcraft-collection-1.jpg",
  "/handcraft-collection-2.jpg",
  "/handcraft-collection-3.jpg",
  "/handcraft-collection-4.jpg",
  "/handcraft-collection-5.jpg",
  "/handcraft-collection-6.jpg",
];

const navLinks = [
  { label: "New Arrivals", href: "/" },
  { label: "About", href: "/" },
];

export default function Navbar({ categories, settings }: Props) {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { currency, setCurrency } = useCurrency();

  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const shopRef = useRef<HTMLDivElement>(null);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function openShop() {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setShopOpen(true);
  }
  function closeShop() {
    menuTimeout.current = setTimeout(() => setShopOpen(false), 120);
  }

  const storeName = settings?.store_name || "/mykolo logo.png";

  return (
    <>
      {/* ─── Main bar ──────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#030607]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.2)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Left: desktop nav ── */}
            <div className="hidden md:flex items-center gap-7 min-w-[200px]">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[11px] tracking-[0.18em] uppercase font-medium text-[#9c9381] hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}

              {/* Shop mega-menu trigger */}
              <div ref={shopRef} onMouseEnter={openShop} onMouseLeave={closeShop}>
                <button
                  className={`flex items-center gap-1 text-[11px] tracking-[0.18em] uppercase font-medium transition-colors text-[#9c9381] hover:text-white ${shopOpen ? "text-white" : ""}`}
                >
                  Shop
                  <motion.svg
                    animate={{ rotate: shopOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-3 h-3 mt-px"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
              </div>
            </div>

            {/* ── Center: logo ── */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link href="/">
                <Image
                  src={settings?.logo_url || "/mykolo logo.png"}
                  alt={storeName}
                  width={180}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* ── Right: icons ── */}
            <div className="flex items-center gap-2 min-w-[200px] justify-end">
              {/* Currency */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setCurrencyOpen((p) => !p)}
                  className="flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase font-medium px-3 py-1.5 border border-[rgba(255,255,255,0.2)] bg-white/5 text-[#9c9381] hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <span>{CURRENCIES[currency].flag}</span>
                  <span>{currency}</span>
                </button>
                <AnimatePresence>
                  {currencyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 bg-[#030607] border border-[rgba(255,255,255,0.2)] shadow-xl py-2 w-52 z-50"
                    >
                      {(Object.values(CURRENCIES) as typeof CURRENCIES[CurrencyCode][]).map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                          className={`flex items-center gap-2.5 w-full px-4 py-2 text-xs hover:bg-white/5 transition-colors ${
                            currency === c.code ? "text-white font-semibold" : "text-[#9c9381]"
                          }`}
                        >
                          <span>{c.flag}</span>
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative flex items-center justify-center w-9 h-9 border border-[rgba(255,255,255,0.2)] bg-white/5 text-[#9c9381] hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Wishlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <motion.span
                    key={wishlistCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#f01919] text-white text-[9px] font-bold flex items-center justify-center"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-9 h-9 border border-[rgba(255,255,255,0.2)] bg-white/5 text-[#9c9381] hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Cart"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#d2ff1f] text-[#030607] text-[9px] font-bold flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 border border-[rgba(255,255,255,0.2)] bg-white/5 text-[#9c9381] hover:text-white hover:bg-white/10 transition-all duration-300"
                onClick={() => setMobileOpen((p) => !p)}
                aria-label="Menu"
              >
                <span className="flex flex-col gap-[5px] w-4">
                  <motion.span
                    animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                    className="block h-px w-full bg-current"
                  />
                  <motion.span
                    animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="block h-px w-full bg-current"
                  />
                  <motion.span
                    animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                    className="block h-px w-full bg-current"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mega Menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {shopOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed top-[68px] left-0 right-0 z-40 bg-[#030607] border-b border-[rgba(255,255,255,0.2)]"
            onMouseEnter={openShop}
            onMouseLeave={closeShop}
          >
            <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-10">
              <div className="grid grid-cols-[1fr_2fr] gap-16 items-start">

                {/* ── Left: category list ── */}
                <div>
                  <p className="text-[9px] tracking-[0.35em] uppercase text-[#9c9381] mb-6">Categories</p>
                  <ul className="space-y-1">
                    <motion.li
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0 }}
                    >
                      <Link
                        href="/"
                        onClick={() => setShopOpen(false)}
                        onMouseEnter={() => setHoveredCat(-1)}
                        className="group flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] transition-all"
                      >
                        <span className="text-sm font-medium text-[#9c9381] group-hover:text-white group-hover:translate-x-1 transition-all duration-200 inline-block">
                          All Products
                        </span>
                        <svg className="w-3 h-3 text-[#9c9381] group-hover:text-white group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </motion.li>
                    {categories.map((cat, i) => (
                      <motion.li
                        key={cat.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (i + 1) * 0.04 }}
                      >
                        <Link
                          href={`/?category=${cat.slug}`}
                          onClick={() => setShopOpen(false)}
                          onMouseEnter={() => setHoveredCat(i)}
                          className="group flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] transition-all"
                        >
                          <span className="text-sm font-medium text-[#9c9381] group-hover:text-white group-hover:translate-x-1 transition-all duration-200 inline-block">
                            {cat.name}
                          </span>
                          <svg className="w-3 h-3 text-[#9c9381] group-hover:text-white group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* ── Right: image grid ── */}
                <div>
                  <p className="text-[9px] tracking-[0.35em] uppercase text-[#9c9381] mb-6">Featured</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(categories.length > 0 ? categories : [{id:"a",name:"New",slug:"new"},{id:"b",name:"Women",slug:"women"},{id:"c",name:"Men",slug:"men"}]).slice(0, 6).map((cat, i) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: i * 0.05 }}
                      >
                        <Link
                          href={`/?category=${cat.slug}`}
                          onClick={() => setShopOpen(false)}
                          className={`group relative block overflow-hidden aspect-[3/4] bg-[#030607] transition-all duration-300 ${
                            hoveredCat === i ? "ring-2 ring-[#d2ff1f] ring-offset-0" : ""
                          }`}
                        >
                          <Image
                            src={CATEGORY_IMAGES[i % CATEGORY_IMAGES.length]}
                            alt={cat.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                          />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(#03060700 0%, #03060799 100%)" }} />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-xs font-semibold tracking-wide">{cat.name}</p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-[#030607] pt-[68px] flex flex-col"
          >
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <p className="text-[9px] tracking-[0.35em] uppercase text-[#9c9381] mb-5">Menu</p>
              <ul className="space-y-0">
                {[
                  { label: "New Arrivals", href: "/" },
                  { label: "All Products", href: "/" },
                  ...categories.map((c) => ({ label: c.name, href: `/?category=${c.slug}` })),
                  { label: "About", href: "/" },
                ].map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-4 border-b border-[rgba(255,255,255,0.1)] text-xl font-semibold text-white hover:text-[#d2ff1f] transition-colors"
                    >
                      {link.label}
                      <svg className="w-4 h-4 text-[#9c9381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Currency in mobile */}
              <div className="mt-10">
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#9c9381] mb-4">Currency</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.values(CURRENCIES) as typeof CURRENCIES[CurrencyCode][]).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); }}
                      className={`flex flex-col items-center gap-1 py-2.5 border text-[10px] font-medium transition-all ${
                        currency === c.code
                          ? "border-[#d2ff1f] bg-[#d2ff1f] text-[#030607]"
                          : "border-[rgba(255,255,255,0.2)] bg-white/5 text-[#9c9381] hover:border-white/40"
                      }`}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
