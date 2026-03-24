"use client";

import { useTransition, useRef, useState, useEffect, FormEvent, DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, Category } from "@/lib/products";
import { addProduct, updateProduct } from "../actions";

const MAX_IMAGES = 10;

const PRESET_CATEGORIES = [
  { name: "Plates & Bowls",          icon: "🍽️" },
  { name: "Wall Art & Decor",         icon: "🖼️" },
  { name: "Furniture",                icon: "🪑" },
  { name: "Sculptures & Figurines",   icon: "🗿" },
  { name: "Jewellery & Accessories",  icon: "💍" },
  { name: "Kitchenware",              icon: "🍴" },
  { name: "Frames & Mirrors",         icon: "🪞" },
  { name: "Planters & Vases",         icon: "🪴" },
  { name: "Toys & Games",             icon: "🎲" },
  { name: "Custom & Bespoke",         icon: "✨" },
  { name: "Other",                    icon: "➕" },
];

type UploadEntry = { file: File; preview: string; progress: number; url?: string; error?: string };

type Props = { product?: Product; categories: Category[] };

async function uploadFile(file: File, onProgress: (p: number) => void): Promise<string> {
  onProgress(10);
  const fd = new FormData();
  fd.append("file", file);
  onProgress(30);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  onProgress(80);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error ?? "Upload failed");
  onProgress(100);
  return data.url as string;
}

function calcMargin(priceStr: string, costStr: string): string {
  const price = parseFloat(priceStr);
  const cost = parseFloat(costStr);
  if (!price || price <= 0) return "—";
  if (!cost || cost < 0) return "—";
  return `${(((price - cost) / price) * 100).toFixed(1)}%`;
}

export default function ProductForm({ product, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Category chip state
  const initialPreset = PRESET_CATEGORIES.find(
    (p2) => p2.name.toLowerCase() === (product?.category ?? "").toLowerCase()
  );
  const [selectedChip, setSelectedChip] = useState<string>(initialPreset?.name ?? "");
  const [customCategory, setCustomCategory] = useState(
    initialPreset ? "" : (product?.category ?? "")
  );

  // Resolve category_id from selected chip name
  const resolvedCategoryId = (() => {
    const chipName = selectedChip === "Other" ? "" : selectedChip;
    if (!chipName) return product?.categoryId ?? "";
    const match = categories.find(
      (c) => c.name.toLowerCase() === chipName.toLowerCase()
    );
    return match?.id ?? "";
  })();

  const categoryName =
    selectedChip === "Other"
      ? customCategory
      : selectedChip || (product?.category ?? "");

  const [priceVal, setPriceVal] = useState(
    product?.price ? String(product.price / 100) : ""
  );
  const [costVal, setCostVal] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    return () => uploads.forEach((u) => URL.revokeObjectURL(u.preview));
  }, [uploads]);

  function addFiles(files: FileList | File[] | null) {
    if (!files) return;
    const arr = Array.from(files);
    const remaining = MAX_IMAGES - existingImages.length - uploads.length;
    const toAdd = arr.slice(0, remaining);
    setUploads((prev) => [
      ...prev,
      ...toAdd.map((f) => ({ file: f, preview: URL.createObjectURL(f), progress: 0 })),
    ]);
  }

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function removeUpload(i: number) {
    URL.revokeObjectURL(uploads[i].preview);
    setUploads((prev) => prev.filter((_, j) => j !== i));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    setError("");

    startTransition(async () => {
      // Upload all pending files concurrently with individual progress
      const uploadedUrls: string[] = [];
      if (uploads.some((u) => !u.url)) {
        const results = await Promise.all(
          uploads.map(async (entry, i) => {
            if (entry.url) return entry.url; // already uploaded
            try {
              const url = await uploadFile(entry.file, (p) => {
                setUploads((prev) =>
                  prev.map((u, j) => (j === i ? { ...u, progress: p } : u))
                );
              });
              setUploads((prev) =>
                prev.map((u, j) => (j === i ? { ...u, url, progress: 100 } : u))
              );
              return url;
            } catch (err) {
              const msg = (err as Error).message;
              setUploads((prev) =>
                prev.map((u, j) => (j === i ? { ...u, error: msg } : u))
              );
              return null;
            }
          })
        );

        const failed = results.filter((r) => r === null);
        if (failed.length > 0) {
          setError(`${failed.length} image(s) failed to upload. Remove them and try again.`);
          return;
        }
        uploadedUrls.push(...(results.filter(Boolean) as string[]));
      }

      const fd = new FormData(form);
      fd.set("existing_images", JSON.stringify(existingImages));
      fd.set("uploaded_urls", JSON.stringify(uploadedUrls));
      fd.set("category_id", resolvedCategoryId);
      fd.set("category_name", categoryName);
      fd.delete("new_images");

      const action = product ? updateProduct : addProduct;
      try {
        const result = await action(fd);
        if (result?.error) setError(result.error);
      } catch (err) {
        const msg = (err as Error).message ?? "";
        if (!msg.includes("NEXT_REDIRECT")) setError(`Unexpected error: ${msg}`);
      }
    });
  }

  const totalImages = existingImages.length + uploads.length;
  const busy = isPending;

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin/products" className="text-gray-500 hover:text-gray-900 transition-colors">
              Products
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">
              {product ? product.name : "Add product"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="text-sm text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              Discard
            </Link>
            <button
              type="submit"
              form="product-form"
              disabled={busy}
              className="text-sm font-medium bg-gray-900 text-white rounded-lg px-5 py-2 hover:bg-black disabled:opacity-50 transition-colors"
            >
              {busy ? "Saving…" : product ? "Save" : "Save product"}
            </button>
          </div>
        </div>
      </div>

      <form id="product-form" ref={formRef} onSubmit={handleSubmit}>
        {product && <input type="hidden" name="id" value={product.id} />}

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex gap-6 items-start">

            {/* ── Left column ── */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Title & Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">Title</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={product?.name}
                    required
                    placeholder="Handcrafted Oak Serving Board"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    defaultValue={product?.description}
                    rows={6}
                    placeholder="Describe this piece — wood type, finish, dimensions, care instructions…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Media — up to 10 images */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">Media</h2>
                  <span className="text-xs text-gray-400">{totalImages} / {MAX_IMAGES} images</span>
                </div>

                {totalImages > 0 && (
                  <div className="grid grid-cols-5 gap-2.5 mb-4">
                    {existingImages.map((url, i) => (
                      <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group border border-gray-200">
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 z-10 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                            Cover
                          </span>
                        )}
                        <Image src={url} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExisting(url)}
                          className="absolute top-1 right-1 z-10 bg-white border border-gray-200 text-gray-500 w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}

                    {uploads.map((entry, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={entry.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />

                        {/* Progress overlay */}
                        {entry.progress < 100 && !entry.error && (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                            <div className="w-10 h-1 bg-white/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#d2ff1f] transition-all duration-300"
                                style={{ width: `${entry.progress}%` }}
                              />
                            </div>
                            <span className="text-white text-[9px] font-medium">{entry.progress}%</span>
                          </div>
                        )}

                        {entry.error && (
                          <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center p-1">
                            <span className="text-white text-[9px] text-center font-medium">Failed</span>
                          </div>
                        )}

                        {entry.progress === 100 && !entry.error && (
                          <div className="absolute bottom-1 left-1 z-10 bg-green-500/80 text-white text-[9px] px-1.5 py-0.5 rounded">✓</div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeUpload(i)}
                          className="absolute top-1 right-1 z-10 bg-white border border-gray-200 text-gray-500 w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                {totalImages < MAX_IMAGES && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragOver ? "border-gray-500 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            Add files
                          </span>
                          <input
                            type="file"
                            name="new_images"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => addFiles(e.target.files)}
                          />
                        </label>
                        <span className="text-sm text-gray-400"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, WEBP · up to 10 images · {MAX_IMAGES - totalImages} slot{MAX_IMAGES - totalImages !== 1 ? "s" : ""} remaining
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Pricing</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        name="price"
                        type="number"
                        value={priceVal}
                        onChange={(e) => setPriceVal(e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                        placeholder="29.99"
                        className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      Compare-at price <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        name="compare_at_price"
                        type="number"
                        defaultValue={product?.compareAtPrice ? product.compareAtPrice / 100 : ""}
                        min="0.01"
                        step="0.01"
                        placeholder="—"
                        className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      Cost per item <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={costVal}
                        onChange={(e) => setCostVal(e.target.value)}
                        min="0"
                        placeholder="—"
                        className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Profit margin</label>
                    <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500">
                      {calcMargin(priceVal, costVal)}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Right column ── */}
            <div className="w-80 shrink-0 space-y-5">

              {/* Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Status</h2>
                <select
                  defaultValue="active"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">Active products are visible in the store.</p>
              </div>

              {/* Category chips */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Category</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_CATEGORIES.map((cat) => {
                    const active = selectedChip === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setSelectedChip(active ? "" : cat.name);
                          if (cat.name !== "Other") setCustomCategory("");
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                          active
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* "Other" text input */}
                {selectedChip === "Other" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter category name…"
                    autoFocus
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors mt-1"
                  />
                )}

                {/* Resolved display */}
                {selectedChip && selectedChip !== "Other" && (
                  <p className="text-xs text-gray-400 mt-2">
                    {resolvedCategoryId
                      ? "✓ Matched to existing category"
                      : "⚠ No matching category in database — will save as label only"}
                  </p>
                )}

                {/* Hidden inputs for form submission */}
                <input type="hidden" name="category_id" value={resolvedCategoryId} />
                <input type="hidden" name="category_name" value={categoryName} />
              </div>

              {/* Inventory */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Inventory</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">Stock quantity</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={product?.stock ?? 0}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>

            </div>
          </div>

          {error && (
            <div className="mt-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
