"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Product, Category } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

const EASE = [0.22, 1, 0.36, 1] as const;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const SORT_OPTIONS = [
  { label: "Newest", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name A–Z", value: "name_az" },
];

type Props = {
  products: Product[];
  categories: Category[];
  activeCategories: string[];
  activeSort?: string;
  activeMin?: number;
  activeMax?: number;
  activeInStock: boolean;
};

// ── Apple-style product card ──────────────────────────────────────────────────
function AppleProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { currency } = useCurrency();
  const wished = has(product.id);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const isNew = product.createdAt
    ? Date.now() - new Date(product.createdAt).getTime() < ONE_WEEK_MS
    : false;
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.97, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.35), ease: EASE }}
    >
      <Link
        href={`/products/${product.id}`}
        className="group block bg-[#f5f5f7] rounded-[18px] overflow-hidden hover:bg-[#ebebed] transition-colors duration-400"
      >
        {/* Image area */}
        <div className="relative aspect-square bg-[#f9f9f7] overflow-hidden">
          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
            {isNew && !hasDiscount && (
              <span className="bg-[#1d1d1f] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full">
                NEW
              </span>
            )}
            {discount && (
              <span className="bg-[#ff3b30] text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product);
            }}
            className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              wished
                ? "bg-[#1d1d1f] text-white opacity-100"
                : "bg-white/80 text-[#6e6e73] opacity-0 group-hover:opacity-100"
            }`}
            aria-label="Toggle wishlist"
          >
            <svg
              className="w-4 h-4"
              fill={wished ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Product image */}
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              className="object-contain p-8 transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-8 bg-[#e8e8e6] rounded-2xl" />
          )}

          {/* Quick Add */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(product);
                }}
                className="w-full bg-[#1d1d1f] text-white text-[11px] tracking-[0.18em] uppercase font-semibold py-3.5 hover:bg-[#3d3d3d] transition-colors"
              >
                Quick Add
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-5 pb-5 pt-4">
          {product.category && (
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#6e6e73] mb-1">
              {product.category}
            </p>
          )}
          <h3
            className="text-[#1d1d1f] font-semibold mb-1.5 leading-snug"
            style={{ fontSize: "15px", letterSpacing: "-0.2px" }}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[15px] text-[#1d1d1f] font-medium">
              {formatCurrency(product.price, currency)}
            </span>
            {hasDiscount && (
              <span className="text-[13px] text-[#6e6e73] line-through">
                {formatCurrency(product.compareAtPrice!, currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main ShopClient ───────────────────────────────────────────────────────────
export default function ShopClient({
  products,
  categories,
  activeCategories,
  activeSort,
  activeMin,
  activeMax,
  activeInStock,
}: Props) {
  const router = useRouter();
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [minInput, setMinInput] = useState(
    activeMin ? String(activeMin / 100) : ""
  );
  const [maxInput, setMaxInput] = useState(
    activeMax ? String(activeMax / 100) : ""
  );

  const extraFilterCount =
    (activeMin ? 1 : 0) + (activeMax ? 1 : 0) + (activeInStock ? 1 : 0);

  function buildParams(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (activeCategories.length > 0)
      p.set("categories", activeCategories.join(","));
    if (activeSort) p.set("sort", activeSort);
    if (activeMin) p.set("min", String(activeMin));
    if (activeMax) p.set("max", String(activeMax));
    if (activeInStock) p.set("inStock", "true");
    Object.entries(overrides).forEach(([k, v]) => {
      if (v !== undefined && v !== "") p.set(k, v);
      else p.delete(k);
    });
    return p.toString();
  }

  function toggleCategory(slug: string) {
    const next = activeCategories.includes(slug)
      ? activeCategories.filter((s) => s !== slug)
      : [...activeCategories, slug];
    const p = new URLSearchParams();
    if (next.length > 0) p.set("categories", next.join(","));
    if (activeSort) p.set("sort", activeSort);
    if (activeMin) p.set("min", String(activeMin));
    if (activeMax) p.set("max", String(activeMax));
    if (activeInStock) p.set("inStock", "true");
    router.push(`/shop?${p.toString()}`);
  }

  function clearAll() {
    setMinInput("");
    setMaxInput("");
    router.push("/shop");
  }

  function applyMoreFilters() {
    const minCents = minInput ? Math.round(parseFloat(minInput) * 100) : undefined;
    const maxCents = maxInput ? Math.round(parseFloat(maxInput) * 100) : undefined;
    const p = new URLSearchParams();
    if (activeCategories.length > 0)
      p.set("categories", activeCategories.join(","));
    if (activeSort) p.set("sort", activeSort);
    if (minCents) p.set("min", String(minCents));
    if (maxCents) p.set("max", String(maxCents));
    if (activeInStock) p.set("inStock", "true");
    router.push(`/shop?${p.toString()}`);
    setMoreFiltersOpen(false);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">

      {/* Page heading */}
      <div className="text-center mb-10">
        <h1
          className="text-[#1d1d1f] font-bold tracking-tight mb-2"
          style={{ fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.5px" }}
        >
          All Products
        </h1>
        <p className="text-[#6e6e73] text-[17px]">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 flex-wrap mb-10">

        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* All */}
          <button
            onClick={clearAll}
            className={`text-[13px] font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
              activeCategories.length === 0 && !activeMin && !activeMax && !activeInStock
                ? "bg-[#1d1d1f] text-white border-[#1d1d1f]"
                : "bg-transparent text-[#1d1d1f] border-[#d2d2d7] hover:border-[#1d1d1f]"
            }`}
          >
            All
          </button>

          {categories.map((cat) => {
            const active = activeCategories.includes(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.slug)}
                className={`text-[13px] font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
                  active
                    ? "bg-[#1d1d1f] text-white border-[#1d1d1f]"
                    : "bg-transparent text-[#1d1d1f] border-[#d2d2d7] hover:border-[#1d1d1f]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Right side: Sort + More Filters */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort */}
          <select
            value={activeSort ?? ""}
            onChange={(e) =>
              router.push(
                `/shop?${buildParams({ sort: e.target.value || undefined })}`
              )
            }
            className="text-[13px] font-medium px-4 py-2 rounded-full border border-[#d2d2d7] text-[#1d1d1f] bg-white focus:outline-none focus:border-[#1d1d1f] appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231d1d1f' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* More Filters */}
          <div className="relative">
            <button
              onClick={() => setMoreFiltersOpen((p) => !p)}
              className={`flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
                extraFilterCount > 0
                  ? "bg-[#1d1d1f] text-white border-[#1d1d1f]"
                  : "bg-transparent text-[#1d1d1f] border-[#d2d2d7] hover:border-[#1d1d1f]"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h18M7 12h10M11 20h2"
                />
              </svg>
              Filters
              {extraFilterCount > 0 && (
                <span className="w-4 h-4 bg-white text-[#1d1d1f] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {extraFilterCount}
                </span>
              )}
            </button>

            {/* More Filters dropdown */}
            <AnimatePresence>
              {moreFiltersOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-30"
                    onClick={() => setMoreFiltersOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-black/[0.06] z-40 p-5"
                  >
                    <p className="text-[11px] tracking-[0.3em] uppercase font-semibold text-[#1d1d1f] mb-3">
                      Price Range
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={minInput}
                        onChange={(e) => setMinInput(e.target.value)}
                        className="w-full border border-[#d2d2d7] rounded-lg text-sm px-3 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#1d1d1f] placeholder-[#b0b0b0]"
                      />
                      <span className="text-[#9ca3af] text-xs shrink-0">—</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={maxInput}
                        onChange={(e) => setMaxInput(e.target.value)}
                        className="w-full border border-[#d2d2d7] rounded-lg text-sm px-3 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#1d1d1f] placeholder-[#b0b0b0]"
                      />
                    </div>

                    <div className="border-t border-[#f3f4f6] pt-4 mb-4">
                      <button
                        onClick={() =>
                          router.push(
                            `/shop?${buildParams({
                              inStock: activeInStock ? undefined : "true",
                            })}`
                          )
                        }
                        className="flex items-center justify-between w-full group"
                      >
                        <span className="text-[14px] text-[#1d1d1f] font-medium">
                          In stock only
                        </span>
                        <span
                          className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 ${
                            activeInStock ? "bg-[#1d1d1f]" : "bg-[#e5e7eb]"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                              activeInStock ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={applyMoreFilters}
                      className="w-full bg-[#1d1d1f] text-white text-[13px] font-semibold py-2.5 rounded-full hover:bg-[#3d3d3d] transition-colors"
                    >
                      Apply
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Product grid ── */}
      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p
            className="text-[#1d1d1f] font-semibold mb-2"
            style={{ fontSize: "19px" }}
          >
            No products match your filters
          </p>
          <p className="text-[#6e6e73] text-[15px] mb-6">
            Try adjusting or clearing your filters.
          </p>
          <button
            onClick={clearAll}
            className="bg-[#1d1d1f] text-white text-[14px] font-medium px-6 py-2.5 rounded-full hover:bg-[#3d3d3d] transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <AppleProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
