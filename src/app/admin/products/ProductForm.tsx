"use client";

import { useTransition, useRef, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, Category } from "@/lib/products";
import { addProduct, updateProduct } from "../actions";

type Props = {
  product?: Product;
  categories: Category[];
};

export default function ProductForm({ product, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setNewFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => setNewPreviews((prev) => [...prev, URL.createObjectURL(f)]));
  }

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNew(i: number) {
    setNewFiles((prev) => prev.filter((_, j) => j !== i));
    setNewPreviews((prev) => prev.filter((_, j) => j !== i));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set("existing_images", JSON.stringify(existingImages));
    fd.delete("new_images");
    newFiles.forEach((f) => fd.append("new_images", f));
    setError("");

    startTransition(async () => {
      const action = product ? updateProduct : addProduct;
      const result = await action(fd);
      if (result?.error) setError(result.error);
    });
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Images <span className="text-gray-400 font-normal">(up to 4)</span>
        </label>
        <div className="flex gap-3 flex-wrap">
          {existingImages.map((url) => (
            <div key={url} className="relative w-24 h-24 bg-gray-100 overflow-hidden rounded">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-black/80"
              >
                ×
              </button>
            </div>
          ))}
          {newPreviews.map((url, i) => (
            <div key={i} className="relative w-24 h-24 bg-gray-100 overflow-hidden rounded">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-black/80"
              >
                ×
              </button>
            </div>
          ))}
          {totalImages < 4 && (
            <label className="w-24 h-24 border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
              <span className="text-2xl text-gray-300 leading-none mb-1">+</span>
              <span className="text-xs text-gray-400">Add image</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
        <input
          name="name"
          type="text"
          defaultValue={product?.name}
          required
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
          placeholder="Product name"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          name="description"
          defaultValue={product?.description}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent resize-none"
          placeholder="Product description"
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Price * <span className="text-gray-400 font-normal">(cents)</span>
          </label>
          <input
            name="price"
            type="number"
            defaultValue={product?.price}
            required
            min="1"
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
            placeholder="e.g. 2999 = $29.99"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Compare-at price <span className="text-gray-400 font-normal">(cents)</span>
          </label>
          <input
            name="compare_at_price"
            type="number"
            defaultValue={product?.compareAtPrice ?? ""}
            min="1"
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
            placeholder="Original price (for sale)"
          />
        </div>
      </div>

      {/* Category + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
          <select
            name="category_id"
            defaultValue={product?.categoryId ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent bg-white"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock quantity</label>
          <input
            name="stock"
            type="number"
            defaultValue={product?.stock ?? 0}
            min="0"
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white text-sm font-medium px-6 py-2.5 hover:bg-gray-900 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving…" : product ? "Update Product" : "Add Product"}
        </button>
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
