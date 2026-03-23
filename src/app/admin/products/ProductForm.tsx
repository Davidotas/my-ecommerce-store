"use client";

import { useTransition, useRef, useState, useEffect, FormEvent, DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, Category } from "@/lib/products";
import { addProduct, updateProduct } from "../actions";

type Props = {
  product?: Product;
  categories: Category[];
};

async function uploadToStorage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error ?? "Upload failed");
  return data.url as string;
}

function calcMargin(priceStr: string, costStr: string): string {
  const price = parseFloat(priceStr);
  const cost = parseFloat(costStr);
  if (!price || price <= 0) return "—";
  if (!cost || cost < 0) return "—";
  const margin = ((price - cost) / price) * 100;
  return `${margin.toFixed(1)}%`;
}

export default function ProductForm({ product, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Pricing state for margin calculation
  const [priceVal, setPriceVal] = useState(
    product?.price ? String(product.price / 100) : ""
  );
  const [costVal, setCostVal] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  function addFiles(files: FileList | File[] | null) {
    if (!files) return;
    const arr = Array.from(files);
    const remaining = 4 - existingImages.length - newFiles.length;
    const toAdd = arr.slice(0, remaining);
    setNewFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => setNewPreviews((prev) => [...prev, URL.createObjectURL(f)]));
  }

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNew(i: number) {
    URL.revokeObjectURL(newPreviews[i]);
    setNewFiles((prev) => prev.filter((_, j) => j !== i));
    setNewPreviews((prev) => prev.filter((_, j) => j !== i));
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
    setUploadProgress("");

    startTransition(async () => {
      const uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          try {
            setUploadProgress(`Uploading image ${i + 1} of ${newFiles.length}…`);
            const url = await uploadToStorage(newFiles[i]);
            uploadedUrls.push(url);
          } catch (err) {
            setError(`Image upload failed: ${(err as Error).message}`);
            setUploadProgress("");
            return;
          }
        }
        setUploadProgress("");
      }

      const fd = new FormData(form);
      fd.set("existing_images", JSON.stringify(existingImages));
      fd.set("uploaded_urls", JSON.stringify(uploadedUrls));
      fd.delete("new_images");

      const action = product ? updateProduct : addProduct;
      try {
        const result = await action(fd);
        if (result?.error) setError(result.error);
      } catch (err) {
        const msg = (err as Error).message ?? "";
        if (!msg.includes("NEXT_REDIRECT")) {
          setError(`Unexpected error: ${msg}`);
        }
      }
    });
  }

  const totalImages = existingImages.length + newFiles.length;
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
              {busy
                ? uploadProgress
                  ? "Uploading…"
                  : "Saving…"
                : product
                ? "Save"
                : "Save product"}
            </button>
          </div>
        </div>
      </div>

      <form id="product-form" ref={formRef} onSubmit={handleSubmit}>
        {product && <input type="hidden" name="id" value={product.id} />}

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex gap-6 items-start">

            {/* ── Left column (70%) ── */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Title & Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      Title
                    </label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={product?.name}
                      required
                      placeholder="Short sleeve t-shirt"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={product?.description}
                      rows={6}
                      placeholder="Describe this product — materials, fit, care instructions…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Media</h2>

                {/* Thumbnails grid */}
                {totalImages > 0 && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {existingImages.map((url, i) => (
                      <div
                        key={url}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group border border-gray-200"
                      >
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                            Cover
                          </span>
                        )}
                        <Image src={url} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExisting(url)}
                          className="absolute top-1.5 right-1.5 z-10 bg-white border border-gray-200 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {newPreviews.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group border border-gray-200"
                      >
                        <Image src={url} alt="" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <span className="text-[10px] text-white font-medium bg-black/40 px-1.5 py-0.5 rounded">New</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNew(i)}
                          className="absolute top-1.5 right-1.5 z-10 bg-white border border-gray-200 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                {totalImages < 4 && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragOver
                        ? "border-gray-500 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
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
                        PNG, JPG, WEBP up to 10 MB · {4 - totalImages} slot{4 - totalImages !== 1 ? "s" : ""} remaining
                      </p>
                    </div>
                  </div>
                )}

                {uploadProgress && (
                  <p className="mt-3 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    {uploadProgress}
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Pricing</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      Price <span className="text-gray-400 font-normal text-xs">(in cents)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¢</span>
                      <input
                        name="price"
                        type="number"
                        value={priceVal}
                        onChange={(e) => setPriceVal(e.target.value)}
                        required
                        min="1"
                        placeholder="2999"
                        className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">e.g. 2999 = $29.99</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      Compare-at price <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¢</span>
                      <input
                        name="compare_at_price"
                        type="number"
                        defaultValue={product?.compareAtPrice ?? ""}
                        min="1"
                        placeholder="—"
                        className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Shows a strikethrough sale price</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        Cost per item <span className="text-gray-400 font-normal text-xs">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¢</span>
                        <input
                          type="number"
                          value={costVal}
                          onChange={(e) => setCostVal(e.target.value)}
                          min="0"
                          placeholder="—"
                          className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Not shown to customers</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        Profit margin
                      </label>
                      <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500">
                        {calcMargin(priceVal, costVal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Right column (30%) ── */}
            <div className="w-72 shrink-0 space-y-5">

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

              {/* Organisation */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Organisation</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Category</label>
                    <select
                      name="category_id"
                      defaultValue={product?.categoryId ?? ""}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white transition-colors"
                    >
                      <option value="">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Product type</label>
                    <input
                      type="text"
                      placeholder="e.g. Tops, Footwear"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Tags</label>
                    <input
                      type="text"
                      placeholder="summer, sale, new (comma separated)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                    />
                  </div>
                </div>
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

          {/* Error banner */}
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
