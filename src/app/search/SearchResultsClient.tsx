"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Category } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const EASE = [0.22, 1, 0.36, 1] as const;

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

type Props = {
  products: Product[];
  categories: Category[];
  query: string;
  activeCategory?: string;
  activeSort?: string;
};

export default function SearchResultsClient({
  products,
  categories,
  query,
  activeCategory,
  activeSort,
}: Props) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeCategory) params.set("category", activeCategory);
    if (activeSort) params.set("sort", activeSort);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    return `/search?${params.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.5em] uppercase text-[#9ca3af] mb-2">Search results</p>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h1 className="text-[clamp(28px,4vw,48px)] text-[#111111]">
            {query ? (
              <>Results for &ldquo;<em>{query}</em>&rdquo;</>
            ) : (
              "Search"
            )}
          </h1>
          <p className="text-sm text-[#9ca3af]">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
        </div>
      </div>

      <div className="flex gap-10 items-start">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-[88px]">
          <Sidebar
            categories={categories}
            activeCategory={activeCategory}
            activeSort={activeSort}
            onSort={(v) => router.push(buildUrl({ sort: v || undefined }))}
            onCategory={(v) => router.push(buildUrl({ category: v }))}
          />
        </aside>

        <div className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between mb-6 gap-4 lg:hidden">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 border border-[#e5e7eb] text-sm text-[#111111] px-4 py-2 hover:border-[#111111] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Filter &amp; Sort
            </button>
            <p className="text-xs text-[#9ca3af]">{products.length} found</p>
          </div>

          {/* Grid */}
          {!query.trim() ? (
            <div className="py-24 text-center">
              <p className="text-[#9ca3af] text-sm">Enter a search term above to find products.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#111111] text-sm font-medium mb-2">No products found for &ldquo;{query}&rdquo;</p>
              <p className="text-[#9ca3af] text-xs mb-6">Try different keywords or browse all products.</p>
              <a href="/" className="text-xs text-[#111111] underline underline-offset-2">Browse all products</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-xl overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
                <span className="text-sm font-semibold text-[#111111]">Filter &amp; Sort</span>
                <button onClick={() => setFiltersOpen(false)}>
                  <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <Sidebar
                  categories={categories}
                  activeCategory={activeCategory}
                  activeSort={activeSort}
                  onSort={(v) => { router.push(buildUrl({ sort: v || undefined })); setFiltersOpen(false); }}
                  onCategory={(v) => { router.push(buildUrl({ category: v })); setFiltersOpen(false); }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({
  categories,
  activeCategory,
  activeSort,
  onSort,
  onCategory,
}: {
  categories: Category[];
  activeCategory?: string;
  activeSort?: string;
  onSort: (v: string) => void;
  onCategory: (v: string | undefined) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Sort */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#111111] mb-4">Sort by</p>
        <ul className="space-y-2.5">
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                onClick={() => onSort(opt.value)}
                className={`text-sm w-full text-left transition-colors ${
                  (activeSort ?? "") === opt.value
                    ? "text-[#111111] font-semibold"
                    : "text-[#6b7280] hover:text-[#111111]"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-[#f3f4f6]" />

      {/* Category */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#111111] mb-4">Category</p>
        <ul className="space-y-2.5">
          <li>
            <button
              onClick={() => onCategory(undefined)}
              className={`text-sm w-full text-left transition-colors ${
                !activeCategory ? "text-[#111111] font-semibold" : "text-[#6b7280] hover:text-[#111111]"
              }`}
            >
              All categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onCategory(cat.slug)}
                className={`text-sm w-full text-left transition-colors ${
                  activeCategory === cat.slug
                    ? "text-[#111111] font-semibold"
                    : "text-[#6b7280] hover:text-[#111111]"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
