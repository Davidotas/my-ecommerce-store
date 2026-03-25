"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/currency";
import { useCurrency } from "@/context/CurrencyContext";
import type { Product } from "@/lib/products";

const RECENT_KEY = "recentSearches";
const MAX_RECENT = 5;

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); }
  catch { return []; }
}

function saveRecent(q: string) {
  const prev = getRecent().filter((s) => s !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-[#d2ff1f] text-[#111111] font-semibold not-italic">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

type Props = { open: boolean; onClose: () => void };

export default function SearchOverlay({ open, onClose }: Props) {
  const router = useRouter();
  const { currency } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      setRecent(getRecent());
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        setResults(data.products ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    onClose();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function useRecent(r: string) { setQuery(r); submit(r); }

  function clearRecent() {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  }

  const showRecent = query.length === 0 && recent.length > 0;
  const noResults = query.length >= 2 && !loading && results.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search panel — slides down from top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            {/* Input row */}
            <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-5 pb-4 flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <form className="flex-1" onSubmit={(e) => { e.preventDefault(); submit(query); }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full text-lg sm:text-xl text-[#111111] placeholder-[#d1d5db] outline-none bg-transparent"
                />
              </form>

              {/* Clear query */}
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-[#9ca3af] hover:text-[#111111] transition-colors"
                  aria-label="Clear"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="ml-1 px-2.5 py-1 text-[10px] tracking-widest uppercase font-medium text-[#6b7280] border border-[#e5e7eb] hover:border-[#111111] hover:text-[#111111] transition-all"
                aria-label="Close search"
              >
                Esc
              </button>
            </div>

            <div className="border-t border-[#f3f4f6]" />

            <div className="max-w-2xl mx-auto px-5 sm:px-6 py-4 pb-6">

              {/* Spinner */}
              {loading && (
                <div className="flex items-center gap-3 py-6 text-sm text-[#9ca3af]">
                  <div className="w-4 h-4 border-2 border-[#e5e7eb] border-t-[#111111] rounded-full animate-spin" />
                  Searching…
                </div>
              )}

              {/* Recent searches */}
              {!loading && showRecent && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#9ca3af]">Recent searches</p>
                    <button onClick={clearRecent} className="text-[10px] text-[#9ca3af] hover:text-[#111111] underline transition-colors">
                      Clear all
                    </button>
                  </div>
                  <ul className="space-y-0.5">
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          onClick={() => useRecent(r)}
                          className="flex items-center gap-3 w-full py-2.5 text-sm text-[#374151] hover:text-[#111111] transition-colors group"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0 text-[#d1d5db] group-hover:text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hint while typing first char */}
              {!loading && query.length === 1 && (
                <p className="text-sm text-[#9ca3af] py-6 text-center">Keep typing…</p>
              )}

              {/* No results */}
              {noResults && (
                <div className="py-8 text-center">
                  <p className="text-[#111111] text-sm font-medium mb-2">No results for &ldquo;{query}&rdquo;</p>
                  <p className="text-[#9ca3af] text-xs mb-5">Try different keywords or check your spelling.</p>
                  <Link href="/" onClick={onClose} className="text-xs text-[#111111] underline underline-offset-2">
                    Browse all products
                  </Link>
                </div>
              )}

              {/* Live results */}
              {!loading && results.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#9ca3af] mb-3">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  <ul className="divide-y divide-[#f5f5f3]">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/products/${p.id}`}
                          onClick={() => { saveRecent(query); onClose(); }}
                          className="flex items-center gap-4 py-3 -mx-2 px-2 rounded hover:bg-[#fafaf8] transition-colors group"
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 shrink-0 bg-[#f5f5f3] rounded overflow-hidden relative">
                            {p.image ? (
                              <Image src={p.image} alt={p.name} fill unoptimized className="object-contain p-1.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {p.category && (
                              <p className="text-[10px] tracking-[0.15em] uppercase text-[#9ca3af] mb-0.5">{p.category}</p>
                            )}
                            <p className="text-sm text-[#111111] font-medium truncate">
                              <Highlight text={p.name} query={query} />
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-[#111111] shrink-0">
                            {formatCurrency(p.price, currency)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {results.length >= 8 && (
                    <div className="pt-4 border-t border-[#f5f5f3] text-center">
                      <button
                        onClick={() => submit(query)}
                        className="text-xs text-[#111111] underline underline-offset-2 hover:no-underline"
                      >
                        View all results for &ldquo;{query}&rdquo; →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
