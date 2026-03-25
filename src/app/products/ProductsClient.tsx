"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Category } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const EASE = [0.22, 1, 0.36, 1] as const;

const SORT_OPTIONS = [
  { label: "Newest", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

type Props = {
  products: Product[];
  categories: Category[];
  activeCategory?: string;
  activeSort?: string;
  maxProductPrice: number;
};

export default function ProductsClient({
  products,
  categories,
  activeCategory,
  activeSort,
  maxProductPrice,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(maxProductPrice || 50000);
  const [inStockOnly, setInStockOnly] = useState(false);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeSort) params.set("sort", activeSort);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    return `${pathname}?${params.toString()}`;
  }

  function setCategory(slug: string | undefined) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (activeSort) params.set("sort", activeSort);
    router.push(`${pathname}?${params.toString()}`);
  }

  function setSort(val: string) {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (val) params.set("sort", val);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.5em] uppercase text-[#9ca3af] mb-2">
          {activeCategory ? "Filtered by" : "All"}
        </p>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h1 className="text-[clamp(28px,4vw,48px)] text-[#111111]">
            {activeCategory
              ? categories.find((c) => c.slug === activeCategory)?.name ?? "Products"
              : "All Products"}
          </h1>
          <p className="text-sm text-[#9ca3af]">{products.length} items</p>
        </div>
      </div>

      <div className="flex gap-8 items-start">

        {/* ── Sidebar filters (desktop) ── */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-[88px]">
          <FilterPanel
            categories={categories}
            activeCategory={activeCategory}
            setCategory={setCategory}
            activeSort={activeSort}
            setSort={setSort}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            maxProductPrice={maxProductPrice}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
          />
        </aside>

        <div className="flex-1 min-w-0">
          {/* Top bar: sort + mobile filter toggle */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Mobile filter button */}
            <button
              className="lg:hidden flex items-center gap-2 border border-[#e5e7eb] text-sm text-[#111111] px-4 py-2 hover:border-[#111111] transition-colors"
              onClick={() => setFiltersOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Filters
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-[#6b7280] hidden sm:inline">Sort:</span>
              <select
                value={activeSort ?? ""}
                onChange={(e) => setSort(e.target.value)}
                className="border border-[#e5e7eb] text-sm text-[#111111] px-3 py-2 outline-none focus:border-[#111111] bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#9ca3af] text-sm mb-4">No products found.</p>
              <button
                onClick={() => setCategory(undefined)}
                className="text-[#111111] text-sm underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-12">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3), ease: EASE }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: EASE }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-xl overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
                <span className="text-sm font-semibold text-[#111111]">Filters</span>
                <button onClick={() => setFiltersOpen(false)}>
                  <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <FilterPanel
                  categories={categories}
                  activeCategory={activeCategory}
                  setCategory={(s) => { setCategory(s); setFiltersOpen(false); }}
                  activeSort={activeSort}
                  setSort={setSort}
                  priceMax={priceMax}
                  setPriceMax={setPriceMax}
                  maxProductPrice={maxProductPrice}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel({
  categories,
  activeCategory,
  setCategory,
  priceMax,
  setPriceMax,
  maxProductPrice,
  inStockOnly,
  setInStockOnly,
}: {
  categories: Category[];
  activeCategory?: string;
  setCategory: (s: string | undefined) => void;
  activeSort?: string;
  setSort: (s: string) => void;
  priceMax: number;
  setPriceMax: (n: number) => void;
  maxProductPrice: number;
  inStockOnly: boolean;
  setInStockOnly: (b: boolean) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#111111] mb-4">Category</p>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setCategory(undefined)}
              className={`text-sm transition-colors w-full text-left ${
                !activeCategory ? "text-[#111111] font-semibold" : "text-[#6b7280] hover:text-[#111111]"
              }`}
            >
              All Products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setCategory(cat.slug)}
                className={`text-sm transition-colors w-full text-left ${
                  activeCategory === cat.slug ? "text-[#111111] font-semibold" : "text-[#6b7280] hover:text-[#111111]"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="border-t border-[#f3f4f6]" />

      {/* Price range */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#111111] mb-4">
          Max Price
        </p>
        <input
          type="range"
          min={0}
          max={maxProductPrice || 100000}
          step={500}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#111111]"
        />
        <p className="text-xs text-[#6b7280] mt-2">Up to ₦{priceMax.toLocaleString()}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#f3f4f6]" />

      {/* In stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
              inStockOnly ? "bg-[#111111]" : "bg-[#e5e7eb]"
            }`}
          >
            <motion.div
              animate={{ x: inStockOnly ? 20 : 2 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </div>
          <span className="text-sm text-[#111111]">In stock only</span>
        </label>
      </div>
    </div>
  );
}
