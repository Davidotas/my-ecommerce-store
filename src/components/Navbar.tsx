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
import AccountMenu from "./AccountMenu";
import SearchOverlay from "./SearchOverlay";

type Props = { categories: Category[]; settings: StoreSettings | null };

const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
  "https://images.unsplash.com/photo-1593641421160-97d58e2ecf38?w=600&q=80",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",
];

const navLinks = [
  { label: "New Arrivals", href: "/" },
  { label: "Customise", href: "/customize" },
  { label: "About", href: "/about" },
];

export default function Navbar({ categories, settings }: Props) {
  const { totalItems, lastAdded } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { currency, setCurrency } = useCurrency();

  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const shopRef = useRef<HTMLDivElement>(null);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLastAdded = useRef(lastAdded);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (lastAdded !== prevLastAdded.current) {
      prevLastAdded.current = lastAdded;
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 700);
      return () => clearTimeout(t);
    }
  }, [lastAdded]);

  const openShop  = () => { if (menuTimeout.current) clearTimeout(menuTimeout.current); setShopOpen(true); };
  const closeShop = () => { menuTimeout.current = setTimeout(() => setShopOpen(false), 120); };

  const storeName = settings?.store_name || "Mykolo";

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/96 backdrop-blur-xl border-b border-[#e8e8e5] shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[68px]">

            {/* Left nav */}
            <div className="hidden lg:flex items-center gap-8 min-w-[200px]">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="nav-underline text-[11px] tracking-[0.18em] uppercase font-medium text-[#6b7280] hover:text-[#111111] transition-colors duration-200"
                >
                  {l.label}
                </Link>
              ))}
              <div ref={shopRef} onMouseEnter={openShop} onMouseLeave={closeShop}>
                <Link href="/shop" className={`nav-underline flex items-center gap-1 text-[11px] tracking-[0.18em] uppercase font-medium transition-colors duration-200 ${shopOpen ? "text-[#111111]" : "text-[#6b7280] hover:text-[#111111]"}`}>
                  Shop
                  <motion.svg animate={{ rotate: shopOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
                    className="w-3 h-3 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </Link>
              </div>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link href="/">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings?.logo_url || "/mykolo-logo.png"} alt={storeName} style={{ height: "40px", width: "auto" }} />
              </Link>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2 min-w-[200px] justify-end">
              {/* Currency */}
              <div className="relative hidden sm:block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setCurrencyOpen((p) => !p)}
                  className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase font-medium px-3 py-1.5 border border-[#e8e8e5] text-[#6b7280] hover:text-[#111111] hover:border-[#ccc] transition-all duration-200"
                >
                  <span>{CURRENCIES[currency].flag}</span>
                  <span>{currency}</span>
                </motion.button>
                <AnimatePresence>
                  {currencyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full mt-2 bg-white border border-[#e8e8e5] shadow-xl py-2 w-52 z-50"
                    >
                      {(Object.values(CURRENCIES) as typeof CURRENCIES[CurrencyCode][]).map((c) => (
                        <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                          className={`flex items-center gap-2.5 w-full px-4 py-2 text-xs hover:bg-[#fafaf8] transition-colors ${currency === c.code ? "text-[#111111] font-semibold" : "text-[#6b7280]"}`}>
                          <span>{c.flag}</span><span>{c.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Account */}
              <AccountMenu />

              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center w-9 h-9 text-[#6b7280] hover:text-[#111111] transition-colors duration-200"
                aria-label="Search"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>

              {/* Wishlist */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/wishlist" className="relative flex items-center justify-center w-9 h-9 text-[#6b7280] hover:text-[#111111] transition-colors duration-200" aria-label="Wishlist">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <motion.span key={wishlistCount} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#111111] text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                      {wishlistCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Cart */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                animate={cartBounce ? { scale: [1, 1.35, 0.85, 1.15, 1], rotate: [-8, 8, -4, 0] } : {}}
                transition={cartBounce ? { duration: 0.55, ease: "easeInOut" } : {}}
              >
                <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 text-[#6b7280] hover:text-[#111111] transition-colors duration-200" aria-label="Cart">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {totalItems > 0 && (
                    <motion.span key={totalItems} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#111111] text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                      {totalItems}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Hamburger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="lg:hidden flex items-center justify-center w-9 h-9 text-[#6b7280] hover:text-[#111111] transition-colors"
                onClick={() => setMobileOpen((p) => !p)} aria-label="Menu">
                <span className="flex flex-col gap-[5px] w-4">
                  <motion.span animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="block h-px w-full bg-current" />
                  <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} className="block h-px w-full bg-current" />
                  <motion.span animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="block h-px w-full bg-current" />
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mega Menu */}
      <AnimatePresence>
        {shopOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed top-[68px] left-0 right-0 z-40 bg-white border-b border-[#e8e8e5] shadow-lg"
            onMouseEnter={openShop} onMouseLeave={closeShop}
          >
            <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-10">
              <div className="grid grid-cols-[1fr_2fr] gap-16 items-start">
                <div>
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#9ca3af] mb-6">Categories</p>
                  <ul className="space-y-1">
                    {[{ id: "all", name: "All Products", slug: "" }, ...categories].map((cat, i) => (
                      <motion.li key={cat.id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.28, delay: i * 0.04 }}>
                        <Link href={cat.slug ? `/shop?categories=${cat.slug}` : "/shop"} onClick={() => setShopOpen(false)}
                          onMouseEnter={() => setHoveredCat(i)}
                          className="group flex items-center justify-between py-3 border-b border-[#f5f5f3] hover:border-[#d1d5db] transition-all">
                          <span className="text-sm font-medium text-[#6b7280] group-hover:text-[#111111] group-hover:translate-x-1 transition-all duration-200 inline-block">
                            {cat.name}
                          </span>
                          <svg className="w-3 h-3 text-[#d1d5db] group-hover:text-[#111111] group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#9ca3af] mb-6">Featured</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(categories.length > 0 ? categories : [{ id: "a", name: "New", slug: "new" }, { id: "b", name: "Women", slug: "women" }, { id: "c", name: "Men", slug: "men" }]).slice(0, 6).map((cat, i) => (
                      <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                        <Link href={`/shop?categories=${cat.slug}`} onClick={() => setShopOpen(false)}
                          className={`group relative block overflow-hidden aspect-[3/4] bg-[#f5f5f3] ${hoveredCat === i ? "ring-2 ring-[#111111]" : ""}`}>
                          <Image src={(cat as Category & { image_url?: string }).image_url || CATEGORY_IMAGES[i % CATEGORY_IMAGES.length]} alt={cat.name} fill unoptimized={!!(cat as Category & { image_url?: string }).image_url} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
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

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-white pt-[68px] flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-8">
              {/* Mobile search bar */}
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="flex items-center gap-3 w-full border border-[#e8e8e5] px-4 py-3 text-sm text-[#9ca3af] mb-6 hover:border-[#111111] transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search products…
              </button>
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#9ca3af] mb-5">Menu</p>
              <ul>
                {[
                  { label: "New Arrivals", href: "/" },
                  { label: "All Products", href: "/shop" },
                  ...categories.map((c) => ({ label: c.name, href: `/shop?categories=${c.slug}` })),
                  { label: "Customise", href: "/customize" },
                  { label: "About", href: "/about" },
                  { label: "Contact", href: "/contact" },
                ].map((link, i) => (
                  <motion.li key={link.label + i}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: i * 0.04 }}>
                    <Link href={link.href} onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-4 border-b border-[#f5f5f3] text-2xl text-[#111111] hover:text-[#6b7280] transition-colors">
                      {link.label}
                      <svg className="w-4 h-4 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10">
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#9ca3af] mb-4">Currency</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.values(CURRENCIES) as typeof CURRENCIES[CurrencyCode][]).map((c) => (
                    <button key={c.code} onClick={() => setCurrency(c.code)}
                      className={`flex flex-col items-center gap-1 py-2.5 border text-[10px] font-medium transition-all ${currency === c.code ? "border-[#111111] bg-[#111111] text-white" : "border-[#e8e8e5] text-[#6b7280] hover:border-[#d1d5db]"}`}>
                      <span className="text-base">{c.flag}</span>
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
