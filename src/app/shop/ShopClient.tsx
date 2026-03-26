"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Category } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minInput, setMinInput] = useState(
    activeMin ? String(activeMin / 100) : ""
  );
  const [maxInput, setMaxInput] = useState(
    activeMax ? String(activeMax / 100) : ""
  );

  const filterCount =
    activeCategories.length +
    (activeMin ? 1 : 0) +
    (activeMax ? 1 : 0) +
    (activeInStock ? 1 : 0);

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

  function applyPrice() {
    const minCents = minInput ? Math.round(parseFloat(minInput) * 100) : undefined;
    const maxCents = maxInput ? Math.round(parseFloat(maxInput) * 100) : undefined;
    const p = new URLSearchParams();
    if (activeCategories.length > 0) p.set("categories", activeCategories.join(","));
    if (activeSort) p.set("sort", activeSort);
    if (minCents) p.set("min", String(minCents));
    if (maxCents) p.set("max", String(maxCents));
    if (activeInStock) p.set("inStock", "true");
    router.push(`/shop?${p.toString()}`);
  }

  function clearAll() {
    setMinInput("");
    setMaxInput("");
    router.push("/shop");
  }

  const sidebar = (
    <ShopSidebar
      categories={categories}
      activeCategories={activeCategories}
      activeSort={activeSort}
      activeInStock={activeInStock}
      minInput={minInput}
      maxInput={maxInput}
      filterCount={filterCount}
      onMinInput={setMinInput}
      onMaxInput={setMaxInput}
      onSort={(v) =>
        router.push(`/shop?${buildParams({ sort: v || undefined })}`)
      }
      onToggleCategory={toggleCategory}
      onToggleInStock={() =>
        router.push(
          `/shop?${buildParams({ inStock: activeInStock ? undefined : "true" })}`
        )
      }
      onApplyPrice={applyPrice}
      onClearAll={clearAll}
    />
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.5em] uppercase text-[#9ca3af] mb-2">
          Explore our collection
        </p>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h1 className="text-[clamp(32px,5vw,56px)] tracking-tight text-[#111111] font-light">
            Shop
          </h1>
          <p className="text-sm text-[#9ca3af]">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <div className="flex gap-10 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-[88px]">
          {sidebar}
        </aside>

        <div className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between mb-6 gap-4 lg:hidden">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 border border-[#e5e7eb] text-sm text-[#111111] px-4 py-2 hover:border-[#111111] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
              Filters
              {filterCount > 0 && (
                <span className="bg-[#111111] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {filterCount}
                </span>
              )}
            </button>
            <select
              value={activeSort ?? ""}
              onChange={(e) =>
                router.push(
                  `/shop?${buildParams({ sort: e.target.value || undefined })}`
                )
              }
              className="text-sm border border-[#e5e7eb] px-3 py-2 text-[#111111] bg-white focus:outline-none focus:border-[#111111]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#111111] text-sm font-medium mb-2">
                No products match your filters
              </p>
              <p className="text-[#9ca3af] text-xs mb-6">
                Try adjusting or clearing your filters.
              </p>
              <button
                onClick={clearAll}
                className="text-xs text-[#111111] underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
              {products.map((product, i) => {
                const isNew =
                  product.createdAt
                    ? Date.now() - new Date(product.createdAt).getTime() <
                      ONE_WEEK_MS
                    : false;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(i * 0.04, 0.32),
                      ease: EASE,
                    }}
                  >
                    <ProductCard product={product} isNew={isNew} />
                  </motion.div>
                );
              })}
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
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-xl overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
                <span className="text-sm font-semibold text-[#111111]">
                  Filters
                  {filterCount > 0 && (
                    <span className="ml-2 bg-[#111111] text-white text-[9px] font-bold w-4 h-4 inline-flex items-center justify-center rounded-full">
                      {filterCount}
                    </span>
                  )}
                </span>
                <button onClick={() => setFiltersOpen(false)}>
                  <svg
                    className="w-5 h-5 text-[#6b7280]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-5">{sidebar}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShopSidebar({
  categories,
  activeCategories,
  activeSort,
  activeInStock,
  minInput,
  maxInput,
  filterCount,
  onMinInput,
  onMaxInput,
  onSort,
  onToggleCategory,
  onToggleInStock,
  onApplyPrice,
  onClearAll,
}: {
  categories: Category[];
  activeCategories: string[];
  activeSort?: string;
  activeInStock: boolean;
  minInput: string;
  maxInput: string;
  filterCount: number;
  onMinInput: (v: string) => void;
  onMaxInput: (v: string) => void;
  onSort: (v: string) => void;
  onToggleCategory: (slug: string) => void;
  onToggleInStock: () => void;
  onApplyPrice: () => void;
  onClearAll: () => void;
}) {
  return (
    <div className="space-y-7">
      {/* Clear all */}
      {filterCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#111111]">
            Filters
            <span className="ml-1.5 bg-[#111111] text-white text-[9px] font-bold w-4 h-4 inline-flex items-center justify-center rounded-full">
              {filterCount}
            </span>
          </span>
          <button
            onClick={onClearAll}
            className="text-[11px] text-[#9ca3af] hover:text-[#111111] transition-colors underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Sort */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#111111] mb-3">
          Sort by
        </p>
        <ul className="space-y-2">
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

      {/* Categories */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#111111] mb-3">
          Category
        </p>
        <ul className="space-y-2.5">
          {categories.map((cat) => {
            const checked = activeCategories.includes(cat.slug);
            return (
              <li key={cat.id}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <span
                    onClick={() => onToggleCategory(cat.slug)}
                    className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
                      checked
                        ? "bg-[#111111] border-[#111111]"
                        : "border-[#d1d5db] group-hover:border-[#111111]"
                    }`}
                  >
                    {checked && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    onClick={() => onToggleCategory(cat.slug)}
                    className={`text-sm transition-colors ${
                      checked
                        ? "text-[#111111] font-medium"
                        : "text-[#6b7280] group-hover:text-[#111111]"
                    }`}
                  >
                    {cat.name}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-[#f3f4f6]" />

      {/* Price range */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#111111] mb-3">
          Price range
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minInput}
              onChange={(e) => onMinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onApplyPrice()}
              className="w-full border border-[#e5e7eb] text-sm px-2.5 py-1.5 text-[#111111] focus:outline-none focus:border-[#111111] placeholder-[#c0c0c0]"
            />
          </div>
          <span className="text-[#9ca3af] text-xs">—</span>
          <div className="flex-1">
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxInput}
              onChange={(e) => onMaxInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onApplyPrice()}
              className="w-full border border-[#e5e7eb] text-sm px-2.5 py-1.5 text-[#111111] focus:outline-none focus:border-[#111111] placeholder-[#c0c0c0]"
            />
          </div>
        </div>
        <button
          onClick={onApplyPrice}
          className="w-full border border-[#111111] text-[11px] tracking-[0.15em] uppercase font-semibold py-2 hover:bg-[#111111] hover:text-white transition-colors duration-200"
        >
          Apply
        </button>
      </div>

      <div className="border-t border-[#f3f4f6]" />

      {/* In stock toggle */}
      <div>
        <button
          onClick={onToggleInStock}
          className="flex items-center justify-between w-full group"
        >
          <span
            className={`text-sm transition-colors ${
              activeInStock
                ? "text-[#111111] font-medium"
                : "text-[#6b7280] group-hover:text-[#111111]"
            }`}
          >
            In stock only
          </span>
          <span
            className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 ${
              activeInStock ? "bg-[#111111]" : "bg-[#e5e7eb]"
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
    </div>
  );
}
